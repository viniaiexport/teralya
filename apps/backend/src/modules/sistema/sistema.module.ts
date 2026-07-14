import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller.js';
import { StripeWebhookRepository } from './stripe-webhook.repository.js';
import { StripeWebhookService } from './stripe-webhook.service.js';

@Module({ controllers: [StripeWebhookController], providers: [StripeWebhookRepository, StripeWebhookService] })
export class SistemaModule {}
