import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  STRIPE_GATEWAY,
  StripeUnavailableError,
  StripeUpstreamError,
  type StripeGateway,
} from "../checkout/stripe.gateway.js";
import type {
  StripeConnectOnboardingDto,
  StripeConnectStatusDto,
} from "./dto/stripe-connect.dto.js";
import {
  StripeConnectRepository,
  type ConnectRecord,
} from "./stripe-connect.repository.js";

@Injectable()
export class StripeConnectService {
  private readonly country: string;
  private readonly refreshUrl: string;
  private readonly returnUrl: string;

  constructor(
    private readonly repository: StripeConnectRepository,
    @Inject(STRIPE_GATEWAY) private readonly stripe: StripeGateway,
    config: ConfigService,
  ) {
    this.country = config.get<string>("STRIPE_CONNECT_DEFAULT_COUNTRY") ?? "ES";
    this.refreshUrl = config.getOrThrow<string>("STRIPE_CONNECT_REFRESH_URL");
    this.returnUrl = config.getOrThrow<string>("STRIPE_CONNECT_RETURN_URL");
  }

  async onboarding(bodegaId: string): Promise<StripeConnectOnboardingDto> {
    const context = await this.repository.context(bodegaId);
    if (context === null) {
      throw new NotFoundException({
        code: "RESOURCE_NOT_FOUND",
        message: "La bodega no dispone de un email operativo.",
      });
    }
    if (!["aprobada", "activa"].includes(context.estado)) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "La bodega no está habilitada para vincular cobros.",
      });
    }
    try {
      const account =
        context.stripeAccountId === null
          ? await this.stripe.createConnectedAccount({
              country: this.country,
              email: context.email,
              idempotencyKey: `teralya-connect-${context.id}`,
              metadata: { bodega_id: context.id },
            })
          : await this.stripe.retrieveConnectedAccount(context.stripeAccountId);
      const record = await this.repository.saveAccount(context.id, account);
      if (this.ready(record)) {
        throw new ConflictException({
          code: "CONFLICT",
          message: "La cuenta Stripe Connect ya está activa.",
        });
      }
      const link = await this.stripe.createConnectedAccountLink({
        accountId: account.id,
        refreshUrl: this.refreshUrl,
        returnUrl: this.returnUrl,
      });
      return {
        ...this.map(record),
        onboarding_url: link.url,
        expires_at: new Date(link.expiresAt * 1000).toISOString(),
      };
    } catch (error) {
      this.mapStripeError(error);
    }
  }

  async status(bodegaId: string): Promise<StripeConnectStatusDto> {
    const record = await this.repository.get(bodegaId);
    if (record === null) {
      return {
        estado: "no_iniciada",
        cuenta_verificada: false,
        cargos_habilitados: false,
        cobros_habilitados: false,
        puede_cobrar: false,
      };
    }
    try {
      const account = await this.stripe.retrieveConnectedAccount(
        record.stripe_account_id,
      );
      return this.map(await this.repository.saveAccount(bodegaId, account));
    } catch (error) {
      this.mapStripeError(error);
    }
  }

  private map(record: ConnectRecord): StripeConnectStatusDto {
    return {
      estado: record.estado_cuenta,
      cuenta_verificada: record.cuenta_verificada,
      cargos_habilitados: record.cargos_habilitados,
      cobros_habilitados: record.cobros_habilitados,
      puede_cobrar: this.ready(record),
      ...(record.ultima_sincronizacion === null
        ? {}
        : {
            ultima_sincronizacion: new Date(
              record.ultima_sincronizacion,
            ).toISOString(),
          }),
    };
  }

  private ready(record: ConnectRecord): boolean {
    return (
      record.estado_cuenta === "activa" &&
      record.cuenta_verificada &&
      record.cargos_habilitados &&
      record.cobros_habilitados
    );
  }

  private mapStripeError(error: unknown): never {
    if (error instanceof ConflictException) throw error;
    if (error instanceof StripeUnavailableError) {
      throw new ServiceUnavailableException({
        code: "UPSTREAM_UNAVAILABLE",
        message: "Stripe no está disponible.",
      });
    }
    if (error instanceof StripeUpstreamError) {
      throw new BadGatewayException({
        code: "UPSTREAM_ERROR",
        message: "Stripe rechazó la operación de vinculación.",
      });
    }
    throw error;
  }
}
