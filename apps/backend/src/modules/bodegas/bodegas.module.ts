import { Module } from '@nestjs/common';
import { BodegasController } from './bodegas.controller.js';
import { BodegasRepository } from './bodegas.repository.js';
import { BodegasService } from './bodegas.service.js';
import { CheckoutModule } from '../checkout/checkout.module.js';
import { StripeConnectRepository } from './stripe-connect.repository.js';
import { StripeConnectService } from './stripe-connect.service.js';

@Module({
  imports: [CheckoutModule],
  controllers: [BodegasController],
  providers: [
    BodegasService,
    BodegasRepository,
    StripeConnectRepository,
    StripeConnectService,
  ],
})
export class BodegasModule {}
