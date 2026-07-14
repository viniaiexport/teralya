import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { CheckoutConfirmationRepository } from "./checkout-confirmation.repository.js";
export interface OrderConfirmationDto {
  pedido_id: string;
  numero_pedido: string;
  pago_estado: "pagado";
  pedido_estado: "pagado";
  confirmado_at: string;
}
@Injectable()
export class CheckoutConfirmationService {
  constructor(private readonly repository: CheckoutConfirmationRepository) {}
  async obtener(owner: string, id: string): Promise<OrderConfirmationDto> {
    if (!isUUID(id)) this.notFound();
    const result = await this.repository.obtener(owner, id);
    if (result.kind === "missing") this.notFound();
    if (result.kind === "foreign")
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "El pedido pertenece a otro comprador.",
      });
    return {
      pedido_id: result.record.pedido_id,
      numero_pedido: result.record.numero_pedido,
      pago_estado: "pagado",
      pedido_estado: "pagado",
      confirmado_at: new Date(result.record.confirmado_at ?? 0).toISOString(),
    };
  }
  private notFound(): never {
    throw new NotFoundException({
      code: "RESOURCE_NOT_FOUND",
      message: "Confirmación no encontrada.",
    });
  }
}
