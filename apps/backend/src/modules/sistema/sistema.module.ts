import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller.js';
import { StripeWebhookRepository } from './stripe-webhook.repository.js';
import { StripeWebhookService } from './stripe-webhook.service.js';
import { CheckoutModule } from '../checkout/checkout.module.js';
import { PaymentDistributionRepository } from './payment-distribution.repository.js';
import { PaymentDistributionService } from './payment-distribution.service.js';

@Module({
  imports: [CheckoutModule],
  controllers: [StripeWebhookController],
  providers: [
    StripeWebhookRepository,
    StripeWebhookService,
    PaymentDistributionRepository,
    PaymentDistributionService,
  ],
})
export class SistemaModule {}
