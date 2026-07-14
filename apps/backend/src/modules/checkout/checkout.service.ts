import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CheckoutRepository } from "./checkout.repository.js";
import type { CheckoutRequestDto, OrderPrepared } from "./dto/checkout.dto.js";
@Injectable()
export class CheckoutService {
  constructor(private readonly repository: CheckoutRepository) {}
  async preparar(
    owner: string,
    input: CheckoutRequestDto,
  ): Promise<OrderPrepared> {
    const result = await this.repository.preparar(owner, input);
    if (result.kind === "missing")
      throw new NotFoundException({
        code: "RESOURCE_NOT_FOUND",
        message: "Carrito o direcciones no encontrados.",
      });
    if (result.kind === "forbidden")
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Las direcciones pertenecen a otro comprador.",
      });
    if (result.kind === "validation")
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: result.message,
      });
    if (result.kind === "conflict")
      throw new ConflictException({
        code: "CONFLICT",
        message: result.message,
      });
    return result.order;
  }
}
