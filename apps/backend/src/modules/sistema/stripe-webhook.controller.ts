import { Controller, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type { WebhookAck } from './dto/stripe-webhook.dto.js';
import { StripeWebhookService } from './stripe-webhook.service.js';

@Controller('sistema/webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly service:StripeWebhookService){}
  @Post() @HttpCode(HttpStatus.OK)
  procesar(@Req() request:RawBodyRequest<Request>,@Headers('stripe-signature') signature:string|undefined):Promise<WebhookAck>{return this.service.procesar(request.rawBody,signature);}
}
