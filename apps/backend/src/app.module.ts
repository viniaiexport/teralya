import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BodegasModule } from './modules/bodegas/bodegas.module.js';
import { CarritoModule } from './modules/carrito/carrito.module.js';
import { CheckoutModule } from './modules/checkout/checkout.module.js';
import { DireccionesModule } from './modules/direcciones/direcciones.module.js';
import { ImagenesModule } from './modules/imagenes/imagenes.module.js';
import { PedidosModule } from './modules/pedidos/pedidos.module.js';
import { SistemaModule } from './modules/sistema/sistema.module.js';
import { SubpedidosModule } from './modules/subpedidos/subpedidos.module.js';
import { VinosModule } from './modules/vinos/vinos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnvironment }),
    AuthModule,
    BodegasModule,
    VinosModule,
    CarritoModule,
    CheckoutModule,
    PedidosModule,
    SubpedidosModule,
    AdminModule,
    SistemaModule,
    DireccionesModule,
    ImagenesModule,
  ],
})
export class AppModule {}
