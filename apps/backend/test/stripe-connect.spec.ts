import { ConfigService } from "@nestjs/config";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { StripeGateway } from "../src/modules/checkout/stripe.gateway.js";
import type { StripeConnectRepository } from "../src/modules/bodegas/stripe-connect.repository.js";
import { StripeConnectService } from "../src/modules/bodegas/stripe-connect.service.js";

const WINERY_ID = "11111111-1111-4111-8111-111111111111";

function setup() {
  const repository = {
    context: vi.fn(),
    get: vi.fn(),
    saveAccount: vi.fn(),
  };
  const stripe = {
    createConnectedAccount: vi.fn(),
    retrieveConnectedAccount: vi.fn(),
    createConnectedAccountLink: vi.fn(),
  };
  const config = new ConfigService({
    STRIPE_CONNECT_DEFAULT_COUNTRY: "ES",
    STRIPE_CONNECT_REFRESH_URL:
      "https://staging.teralya.eu/bodega/pagos?stripe=refresh",
    STRIPE_CONNECT_RETURN_URL:
      "https://staging.teralya.eu/bodega/pagos?stripe=return",
  });
  return {
    repository,
    stripe,
    service: new StripeConnectService(
      repository as unknown as StripeConnectRepository,
      stripe as unknown as StripeGateway,
      config,
    ),
  };
}

describe("API-052/API-053 Stripe Connect", () => {
  it("crea una cuenta Express idempotente y entrega onboarding alojado", async () => {
    const { repository, stripe, service } = setup();
    repository.context.mockResolvedValue({
      id: WINERY_ID,
      email: "bodega@example.test",
      estado: "aprobada",
      stripeAccountId: null,
    });
    const account = {
      id: "acct_test",
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      country: "ES",
      defaultCurrency: "eur",
    };
    stripe.createConnectedAccount.mockResolvedValue(account);
    repository.saveAccount.mockResolvedValue({
      stripe_account_id: account.id,
      estado_cuenta: "pendiente",
      cuenta_verificada: false,
      cargos_habilitados: false,
      cobros_habilitados: false,
      ultima_sincronizacion: null,
    });
    stripe.createConnectedAccountLink.mockResolvedValue({
      url: "https://connect.stripe.com/setup/test",
      expiresAt: 1_800_000_000,
    });

    await expect(service.onboarding(WINERY_ID)).resolves.toMatchObject({
      estado: "pendiente",
      puede_cobrar: false,
      onboarding_url: "https://connect.stripe.com/setup/test",
    });
    expect(stripe.createConnectedAccount).toHaveBeenCalledWith({
      country: "ES",
      email: "bodega@example.test",
      idempotencyKey: `teralya-connect-${WINERY_ID}`,
      metadata: { bodega_id: WINERY_ID },
    });
  });

  it("no permite onboarding a una bodega no aprobada", async () => {
    const { repository, service } = setup();
    repository.context.mockResolvedValue({
      id: WINERY_ID,
      email: "bodega@example.test",
      estado: "pendiente_revision",
      stripeAccountId: null,
    });

    await expect(service.onboarding(WINERY_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("no genera enlaces nuevos cuando la cuenta ya puede cobrar", async () => {
    const { repository, stripe, service } = setup();
    repository.context.mockResolvedValue({
      id: WINERY_ID,
      email: "bodega@example.test",
      estado: "activa",
      stripeAccountId: "acct_test",
    });
    stripe.retrieveConnectedAccount.mockResolvedValue({
      id: "acct_test",
      detailsSubmitted: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      country: "ES",
      defaultCurrency: "eur",
    });
    repository.saveAccount.mockResolvedValue({
      stripe_account_id: "acct_test",
      estado_cuenta: "activa",
      cuenta_verificada: true,
      cargos_habilitados: true,
      cobros_habilitados: true,
      ultima_sincronizacion: new Date(),
    });

    await expect(service.onboarding(WINERY_ID)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(stripe.createConnectedAccountLink).not.toHaveBeenCalled();
  });
});
