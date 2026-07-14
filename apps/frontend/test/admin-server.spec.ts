import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const {apiRequest,readAccessToken,readSessionIdentity}=vi.hoisted(()=>({apiRequest:vi.fn(),readAccessToken:vi.fn(),readSessionIdentity:vi.fn()}));
vi.mock('../src/lib/api/client',()=>({apiRequest}));vi.mock('../src/lib/session/session',()=>({readAccessToken,readSessionIdentity}));
import {getAdminDashboard,getAdminOrder,listAdminOrders} from '../src/lib/admin/server';
const id='55555555-5555-4555-8555-555555555555';
beforeEach(()=>{vi.clearAllMocks();readSessionIdentity.mockResolvedValue({usuario_id:'u',rol:'administrador'});readAccessToken.mockResolvedValue('token')});
describe('operación administrativa FE-007',()=>{
 it('consulta únicamente los dos indicadores de API-028',async()=>{apiRequest.mockResolvedValue({ventas_dia:{importe:'0.00',moneda:'EUR',num_pedidos:0},pedidos_pendientes:0});await getAdminDashboard();expect(apiRequest).toHaveBeenCalledWith('/admin/dashboard',{method:'GET',token:'token'})});
 it('pagina todos los pedidos mediante API-027',async()=>{apiRequest.mockResolvedValue({items:[]});await listAdminOrders(3,50);expect(apiRequest).toHaveBeenCalledWith('/admin/pedidos?page=3&page_size=50',{method:'GET',token:'token'})});
 it('normaliza paginación manipulada',async()=>{apiRequest.mockResolvedValue({items:[]});await listAdminOrders(-2,1000);expect(apiRequest).toHaveBeenCalledWith('/admin/pedidos?page=1&page_size=20',{method:'GET',token:'token'})});
 it('consulta pedido completo y SubPedidos por API-039',async()=>{apiRequest.mockResolvedValue({id,subpedidos:[]});await getAdminOrder(id);expect(apiRequest).toHaveBeenCalledWith(`/admin/pedidos/${id}`,{method:'GET',token:'token'})});
 it('bloquea UUID manipulado y actor no administrador',async()=>{await expect(getAdminOrder('../pedido')).rejects.toThrow('Pedido inválido');readSessionIdentity.mockResolvedValue({usuario_id:'u',rol:'bodega',bodega_id:'b'});await expect(getAdminDashboard()).rejects.toThrow('ADMIN_SESSION_REQUIRED')});
});
