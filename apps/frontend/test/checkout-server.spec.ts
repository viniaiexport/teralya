import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiProblem } from '../src/lib/api/problem';
vi.mock('server-only',()=>({}));
const {apiRequest,readAccessToken,readSessionIdentity}=vi.hoisted(()=>({apiRequest:vi.fn(),readAccessToken:vi.fn(),readSessionIdentity:vi.fn()}));
vi.mock('../src/lib/api/client',()=>({apiRequest}));
vi.mock('../src/lib/session/session',()=>({readAccessToken,readSessionIdentity}));
import { createAddress, createPaymentSession, getOrderConfirmation, prepareOrder, safeCheckoutError, validatedStripeUrl } from '../src/lib/checkout/server';

const addressId='11111111-1111-4111-8111-111111111111';
const orderId='22222222-2222-4222-8222-222222222222';
const input={uso:'ambos' as const,nombre_destinatario:'Ana',direccion:'Calle Mayor 1',codigo_postal:'28001',ciudad:'Madrid',pais:'España'};

afterEach(()=>{vi.clearAllMocks();readSessionIdentity.mockResolvedValue({usuario_id:'user',rol:'comprador'});readAccessToken.mockResolvedValue('opaque-token')});

describe('contrato FE-006',()=>{
  it('crea direcciones con Idempotency-Key UUID y token solo en servidor',async()=>{apiRequest.mockResolvedValue({id:addressId,...input});await createAddress(addressId,input);expect(apiRequest).toHaveBeenCalledWith('/direcciones',{method:'POST',token:'opaque-token',headers:{'Idempotency-Key':addressId},body:input})});
  it('prepara un único pedido con las dos direcciones seleccionadas',async()=>{apiRequest.mockResolvedValue({id:orderId});await prepareOrder(addressId,addressId);expect(apiRequest).toHaveBeenCalledWith('/checkout',{method:'POST',token:'opaque-token',body:{direccion_envio_id:addressId,direccion_facturacion_id:addressId}})});
  it('solicita Stripe mediante API-017 sin datos de tarjeta',async()=>{apiRequest.mockResolvedValue({pedido_id:orderId,checkout_url:'https://checkout.stripe.com/c/pay/test'});await createPaymentSession(orderId);expect(apiRequest).toHaveBeenCalledWith('/checkout/pago',{method:'POST',token:'opaque-token',body:{pedido_id:orderId}});expect(JSON.stringify(apiRequest.mock.calls[0])).not.toMatch(/tarjeta|card_number|cvv/)});
  it('consulta API-018 y no fabrica una confirmación local',async()=>{apiRequest.mockResolvedValue({pedido_id:orderId,pago_estado:'pendiente',pedido_estado:'pendiente_pago'});const result=await getOrderConfirmation(orderId);expect(result.pago_estado).toBe('pendiente');expect(apiRequest).toHaveBeenCalledWith(`/checkout/confirmacion/${orderId}`,{method:'GET',token:'opaque-token'})});
  it('acepta únicamente redirecciones HTTPS de Stripe',()=>{expect(validatedStripeUrl('https://checkout.stripe.com/c/pay/test')).toContain('checkout.stripe.com');expect(()=>validatedStripeUrl('https://evil.example/steal')).toThrow('Stripe');expect(()=>validatedStripeUrl('javascript:alert(1)')).toThrow()});
  it('no filtra detalles internos de errores upstream',()=>{const safe=safeCheckoutError(new ApiProblem({type:'about:blank',title:'Upstream',status:502,detail:'secret Stripe response',code:'UPSTREAM_ERROR',request_id:'req-1',retryable:true}),'fallo');expect(safe).toEqual({message:'Stripe no ha podido procesar la solicitud.',requestId:'req-1'});expect(safe.message).not.toContain('secret')});
  it('bloquea checkout privado para roles distintos de comprador',async()=>{readSessionIdentity.mockResolvedValue({usuario_id:'user',rol:'bodega'});await expect(prepareOrder(addressId,addressId)).rejects.toThrow('BUYER_SESSION_REQUIRED');expect(apiRequest).not.toHaveBeenCalled()});
});
