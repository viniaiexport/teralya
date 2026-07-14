import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiProblem } from '../src/lib/api/problem';
vi.mock('server-only',()=>({}));
const {apiRequest,readAccessToken,readSessionIdentity}=vi.hoisted(()=>({apiRequest:vi.fn(),readAccessToken:vi.fn(),readSessionIdentity:vi.fn()}));
vi.mock('../src/lib/api/client',()=>({apiRequest}));
vi.mock('../src/lib/session/session',()=>({readAccessToken,readSessionIdentity}));
import { addBuyerItem, mergeGuestCart, updateBuyerItem } from '../src/lib/cart/server';

const wineId='22222222-2222-4222-8222-222222222222';
const itemId='33333333-3333-4333-8333-333333333333';
const fusionId='11111111-1111-4111-8111-111111111111';
const cart={id:fusionId,estado:'activo',items:[],num_productos:0,num_botellas:0,subtotal:'0.00',gastos_envio:'0.00',descuentos:'0.00',total:'0.00',moneda:'EUR',updated_at:'2026-07-14T12:00:00Z'};

afterEach(()=>vi.clearAllMocks());

describe('integración de carrito autenticado',()=>{
  it('mantiene el token opaco solo en la llamada de servidor',async()=>{readSessionIdentity.mockResolvedValue({usuario_id:'user',rol:'comprador'});readAccessToken.mockResolvedValue('secret-token');apiRequest.mockResolvedValue({carrito:cart});const result=await addBuyerItem(wineId,2);expect(result.ok).toBe(true);expect(apiRequest).toHaveBeenCalledWith('/carrito/items',{method:'POST',token:'secret-token',body:{vino_id:wineId,cantidad:2}})});
  it('envía la fusión idempotente exactamente con fusion_id y líneas locales',async()=>{readSessionIdentity.mockResolvedValue({usuario_id:'user',rol:'comprador'});readAccessToken.mockResolvedValue('secret-token');apiRequest.mockResolvedValue({carrito:cart,fusion:[]});await mergeGuestCart(fusionId,[{vino_id:wineId,cantidad_local:3}]);expect(apiRequest).toHaveBeenCalledWith('/carrito/items',{method:'POST',token:'secret-token',body:{fusion_id:fusionId,items:[{vino_id:wineId,cantidad_local:3}]}})});
  it('rechaza duplicados y cantidades manipuladas antes de llamar al backend',async()=>{readSessionIdentity.mockResolvedValue({usuario_id:'user',rol:'comprador'});readAccessToken.mockResolvedValue('secret-token');const result=await mergeGuestCart(fusionId,[{vino_id:wineId,cantidad_local:1},{vino_id:wineId,cantidad_local:2}]);expect(result.ok).toBe(false);expect(apiRequest).not.toHaveBeenCalled()});
  it('no permite usar API privadas con una sesión de bodega',async()=>{readSessionIdentity.mockResolvedValue({usuario_id:'user',rol:'bodega'});readAccessToken.mockResolvedValue('secret-token');expect((await updateBuyerItem(itemId,2)).ok).toBe(false);expect(apiRequest).not.toHaveBeenCalled()});
  it('traduce conflictos sin filtrar detalles internos y conserva request_id',async()=>{readSessionIdentity.mockResolvedValue({usuario_id:'user',rol:'comprador'});readAccessToken.mockResolvedValue('secret-token');apiRequest.mockRejectedValue(new ApiProblem({type:'about:blank',title:'Conflict',status:409,detail:'stock row internal detail',code:'CONFLICT',request_id:'request-1',retryable:false}));const result=await addBuyerItem(wineId,2);expect(result).toMatchObject({ok:false,message:'El carrito ha cambiado. Revísalo antes de continuar.',requestId:'request-1'});expect(result.message).not.toContain('internal')});
});
