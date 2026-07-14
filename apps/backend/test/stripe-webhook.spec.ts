import { createHmac } from 'node:crypto';
import { BadRequestException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import type { StripeWebhookRepository } from '../src/modules/sistema/stripe-webhook.repository.js';
import { StripeWebhookService } from '../src/modules/sistema/stripe-webhook.service.js';

const SECRET='whsec_test_secret_123456789',ORDER='11111111-1111-4111-8111-111111111111',PAYMENT='22222222-2222-4222-8222-222222222222';
function setup(){const repository={procesar:vi.fn().mockResolvedValue({kind:'ok',ack:{event_id:'evt_1',status:'processed'}})};const config={getOrThrow:vi.fn((key:string)=>key==='STRIPE_WEBHOOK_SECRET'?SECRET:'sk_test_example')} as unknown as ConfigService;return{repository,service:new StripeWebhookService(repository as unknown as StripeWebhookRepository,config)};}
function payload(type='checkout.session.completed',metadataValid=true):Buffer{const amount='1000';const signature=createHmac('sha256',SECRET).update([ORDER,PAYMENT,'eur',amount].join('|')).digest('hex');return Buffer.from(JSON.stringify({id:'evt_1',type,livemode:false,data:{object:{id:'cs_old',payment_status:'paid',amount_total:1000,currency:'eur',metadata:{pedido_id:ORDER,pago_id:PAYMENT,currency:'eur',amount_cents:amount,metadata_signature:metadataValid?signature:'0'.repeat(64)}}}}));}
function header(body:Buffer,timestamp=Math.floor(Date.now()/1000)):string{return`t=${String(timestamp)},v1=${createHmac('sha256',SECRET).update(`${String(timestamp)}.`).update(body).digest('hex')}`;}
describe('API-029 Stripe webhook',()=>{
  it('valida firma sobre bytes crudos y despacha metadata firmada',async()=>{const{repository,service}=setup();const body=payload();await expect(service.procesar(body,header(body))).resolves.toMatchObject({status:'processed'});expect(repository.procesar).toHaveBeenCalledWith(expect.objectContaining({id:'evt_1'}),ORDER,PAYMENT);});
  it('rechaza firma incorrecta o con más de 300 segundos',()=>{const{service}=setup();const body=payload();expect(()=>service.procesar(body,'t=1,v1='+'0'.repeat(64))).toThrow(BadRequestException);expect(()=>service.procesar(body,header(body,Math.floor(Date.now()/1000)-301))).toThrow(BadRequestException);});
  it('rechaza eventos fuera de allowlist y metadata manipulada',async()=>{const{service}=setup();const unsupported=payload('payment_intent.succeeded');expect(()=>service.procesar(unsupported,header(unsupported))).toThrow(UnprocessableEntityException);const tampered=payload('checkout.session.completed',false);await expect(service.procesar(tampered,header(tampered))).rejects.toBeInstanceOf(ConflictException);});
});


