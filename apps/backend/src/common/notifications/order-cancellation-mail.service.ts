import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";
import type { OrderCancellationResult } from "../../modules/pedidos/dto/pedidos.dto.js";

@Injectable()
export class OrderCancellationMailService {
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter =
      config.getOrThrow<string>("NODE_ENV") === "test"
        ? nodemailer.createTransport({ jsonTransport: true })
        : nodemailer.createTransport({
            host: config.getOrThrow<string>("SMTP_HOST"),
            port: config.getOrThrow<number>("SMTP_PORT"),
            secure: config.getOrThrow<boolean>("SMTP_SECURE"),
            auth: {
              user: config.getOrThrow<string>("SMTP_USER"),
              pass: config.getOrThrow<string>("SMTP_PASSWORD"),
            },
          });
  }

  async send(
    email: string,
    numeroPedido: string,
    result: OrderCancellationResult,
  ): Promise<void> {
    const refundMessage =
      result.reembolso_estado === "succeeded"
        ? "El reembolso ha sido confirmado."
        : "El reembolso se está procesando y quedará reflejado por el medio de pago original.";
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>("PASSWORD_RECOVERY_FROM_EMAIL"),
      to: email,
      subject: `Cancelación del pedido ${numeroPedido}`,
      text:
        `Hemos registrado la cancelación del pedido ${numeroPedido}.\n\n` +
        `${refundMessage}\n\n` +
        "Puedes consultar el estado actualizado desde tu cuenta de Teralya.",
    });
  }
}
