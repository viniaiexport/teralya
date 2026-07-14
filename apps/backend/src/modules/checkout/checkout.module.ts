import { Module } from "@nestjs/common";
import { CheckoutController } from "./checkout.controller.js";
import { CheckoutRepository } from "./checkout.repository.js";
import { CheckoutService } from "./checkout.service.js";
import { CheckoutPaymentRepository } from "./checkout-payment.repository.js";
import { CheckoutPaymentService } from "./checkout-payment.service.js";
import { FetchStripeGateway, STRIPE_GATEWAY } from "./stripe.gateway.js";

@Module({
  controllers: [CheckoutController],
  providers: [
    CheckoutRepository,
    CheckoutService,
    CheckoutPaymentRepository,
    CheckoutPaymentService,
    FetchStripeGateway,
    { provide: STRIPE_GATEWAY, useExisting: FetchStripeGateway },
  ],
})
export class CheckoutModule {}
