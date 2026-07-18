import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const STRIPE_GATEWAY = Symbol("STRIPE_GATEWAY");

export interface StripeSessionInput {
  amountCents: number;
  currency: "eur";
  expiresAt: number;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  metadata: Record<string, string>;
}

export interface StripeSession {
  id: string;
  url: string;
  expiresAt: number;
}

export type StripeRefundStatus =
  | "pending"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "canceled";

export interface StripeRefund {
  id: string;
  paymentIntentId: string;
  status: StripeRefundStatus;
}

export interface StripeGateway {
  createCheckoutSession(input: StripeSessionInput): Promise<StripeSession>;
  retrieveCheckoutSession(id: string): Promise<StripeSession>;
  retrieveCheckoutSessionPaymentIntent(id: string): Promise<string>;
  createRefund(input: {
    paymentIntentId: string;
    idempotencyKey: string;
    metadata: Record<string, string>;
  }): Promise<StripeRefund>;
  retrieveRefund(id: string): Promise<StripeRefund>;
}

export class StripeUnavailableError extends Error {}
export class StripeUpstreamError extends Error {}

@Injectable()
export class FetchStripeGateway implements StripeGateway {
  private readonly key: string;

  constructor(config: ConfigService) {
    this.key = config.getOrThrow<string>("STRIPE_SECRET_KEY");
  }

  async createCheckoutSession(
    input: StripeSessionInput,
  ): Promise<StripeSession> {
    const form = new URLSearchParams({
      mode: "payment",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      expires_at: String(input.expiresAt),
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": input.currency,
      "line_items[0][price_data][unit_amount]": String(input.amountCents),
      "line_items[0][price_data][product_data][name]": "Pedido Teralya",
    });
    for (const [key, value] of Object.entries(input.metadata)) {
      form.set(`metadata[${key}]`, value);
    }
    const value = await this.requestJson(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": input.idempotencyKey,
        },
        body: form,
      },
    );
    return this.parseSession(value);
  }

  async retrieveCheckoutSession(id: string): Promise<StripeSession> {
    const value = await this.requestJson(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    return this.parseSession(value);
  }

  async retrieveCheckoutSessionPaymentIntent(id: string): Promise<string> {
    const value = await this.requestJson(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    const paymentIntent = value.payment_intent;
    if (typeof paymentIntent === "string" && paymentIntent.length > 0) {
      return paymentIntent;
    }
    if (
      typeof paymentIntent === "object" &&
      paymentIntent !== null &&
      "id" in paymentIntent &&
      typeof paymentIntent.id === "string" &&
      paymentIntent.id.length > 0
    ) {
      return paymentIntent.id;
    }
    throw new StripeUpstreamError(
      "La sesión de Stripe no contiene PaymentIntent reembolsable.",
    );
  }

  async createRefund(input: {
    paymentIntentId: string;
    idempotencyKey: string;
    metadata: Record<string, string>;
  }): Promise<StripeRefund> {
    const form = new URLSearchParams({
      payment_intent: input.paymentIntentId,
      reason: "requested_by_customer",
    });
    for (const [key, value] of Object.entries(input.metadata)) {
      form.set(`metadata[${key}]`, value);
    }
    const response = await this.requestJson("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: form,
    });
    return this.parseRefund(response);
  }

  async retrieveRefund(id: string): Promise<StripeRefund> {
    const response = await this.requestJson(
      `https://api.stripe.com/v1/refunds/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    return this.parseRefund(response);
  }

  private parseSession(value: Record<string, unknown>): StripeSession {
    if (
      typeof value.id !== "string" ||
      typeof value.url !== "string" ||
      typeof value.expires_at !== "number"
    ) {
      throw new StripeUpstreamError("Respuesta Stripe incompleta.");
    }
    return { id: value.id, url: value.url, expiresAt: value.expires_at };
  }

  private parseRefund(value: Record<string, unknown>): StripeRefund {
    const allowedStatuses = new Set<StripeRefundStatus>([
      "pending",
      "requires_action",
      "succeeded",
      "failed",
      "canceled",
    ]);
    const paymentIntent = value.payment_intent;
    if (
      typeof value.id !== "string" ||
      typeof paymentIntent !== "string" ||
      typeof value.status !== "string" ||
      !allowedStatuses.has(value.status as StripeRefundStatus)
    ) {
      throw new StripeUpstreamError("Respuesta de reembolso Stripe incompleta.");
    }
    return {
      id: value.id,
      paymentIntentId: paymentIntent,
      status: value.status as StripeRefundStatus,
    };
  }

  private async requestJson(
    url: string,
    init: RequestInit,
  ): Promise<Record<string, unknown>> {
    let response: Response;
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.key}`);
    try {
      response = await fetch(url, { ...init, headers });
    } catch {
      throw new StripeUnavailableError("Stripe no está disponible.");
    }
    if (!response.ok) {
      throw new StripeUpstreamError(
        `Stripe respondió ${String(response.status)}.`,
      );
    }
    const value: unknown = await response.json();
    if (typeof value !== "object" || value === null) {
      throw new StripeUpstreamError("Respuesta Stripe inválida.");
    }
    return value as Record<string, unknown>;
  }
}
