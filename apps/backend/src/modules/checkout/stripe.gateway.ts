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
export interface StripeGateway {
  createCheckoutSession(input: StripeSessionInput): Promise<StripeSession>;
  retrieveCheckoutSession(id: string): Promise<StripeSession>;
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
    for (const [key, value] of Object.entries(input.metadata))
      form.set(`metadata[${key}]`, value);
    return this.request("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: form,
    });
  }
  retrieveCheckoutSession(id: string): Promise<StripeSession> {
    return this.request(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
  }
  private async request(
    url: string,
    init: RequestInit,
  ): Promise<StripeSession> {
    let response: Response;
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.key}`);
    try {
      response = await fetch(url, {
        ...init,
        headers,
      });
    } catch {
      throw new StripeUnavailableError("Stripe no está disponible.");
    }
    if (!response.ok)
      throw new StripeUpstreamError(
        `Stripe respondió ${String(response.status)}.`,
      );
    const value: unknown = await response.json();
    if (typeof value !== "object" || value === null)
      throw new StripeUpstreamError("Respuesta Stripe inválida.");
    const row = value as { id?: unknown; url?: unknown; expires_at?: unknown };
    if (
      typeof row.id !== "string" ||
      typeof row.url !== "string" ||
      typeof row.expires_at !== "number"
    )
      throw new StripeUpstreamError("Respuesta Stripe incompleta.");
    return { id: row.id, url: row.url, expiresAt: row.expires_at };
  }
}
