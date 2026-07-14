import { Module } from "@nestjs/common";
import { CheckoutController } from "./checkout.controller.js";
import { CheckoutRepository } from "./checkout.repository.js";
import { CheckoutService } from "./checkout.service.js";
import { CheckoutPaymentRepository } from "./checkout-payment.repository.js";
import { CheckoutPaymentService } from "./checkout-payment.service.js";
import { FetchStripeGateway, STRIPE_GATEWAY } from "./stripe.gateway.js";
import { CheckoutConfirmationRepository } from "./checkout-confirmation.repository.js";
import { CheckoutConfirmationService } from "./checkout-confirmation.service.js";

@Module({
  controllers: [CheckoutController],
  providers: [
    CheckoutRepository,
    CheckoutService,
    CheckoutPaymentRepository,
    CheckoutPaymentService,
    CheckoutConfirmationRepository,
    CheckoutConfirmationService,
    FetchStripeGateway,
    { provide: STRIPE_GATEWAY, useExisting: FetchStripeGateway },
  ],
})
export class CheckoutModule {}
