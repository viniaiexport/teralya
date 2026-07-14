import 'server-only';
import { apiRequest } from '@/lib/api/client';
import { isUuid } from '@/lib/cart/contracts';
import { readAccessToken, readSessionIdentity } from '@/lib/session/session';
import { isIncidentState, type AdminDashboard, type AdminOrderDetail, type AdminOrderPage, type AdminWineDetail, type AdminWinePage, type AdminWinery, type AdminWineryPage, type IncidentDetail, type IncidentPage, type IncidentState } from './contracts';

async function token():Promise<string>{const [identity,access]=await Promise.all([readSessionIdentity(),readAccessToken()]);if(identity?.rol!=='administrador'||access===undefined)throw new Error('ADMIN_SESSION_REQUIRED');return access}
export async function getAdminDashboard():Promise<AdminDashboard>{return apiRequest('/admin/dashboard',{method:'GET',token:await token()})}
export async function listAdminOrders(page=1,pageSize=20):Promise<AdminOrderPage>{const safePage=Number.isInteger(page)&&page>0?page:1,safeSize=Number.isInteger(pageSize)&&pageSize>0&&pageSize<=100?pageSize:20;return apiRequest(`/admin/pedidos?page=${safePage}&page_size=${safeSize}`,{method:'GET',token:await token()})}
export async function getAdminOrder(id:string):Promise<AdminOrderDetail>{if(!isUuid(id))throw new Error('Pedido inválido.');return apiRequest(`/admin/pedidos/${encodeURIComponent(id)}`,{method:'GET',token:await token()})}
export async function listPendingWineries(page=1):Promise<AdminWineryPage>{const safePage=Number.isInteger(page)&&page>0?page:1;return apiRequest(`/admin/bodegas?estado=pendiente&page=${safePage}&page_size=20`,{method:'GET',token:await token()})}
export async function getAdminWinery(id:string):Promise<AdminWinery>{if(!isUuid(id))throw new Error('Bodega inválida.');return apiRequest(`/admin/bodegas/${encodeURIComponent(id)}`,{method:'GET',token:await token()})}
export async function validateAdminWinery(id:string):Promise<AdminWinery>{if(!isUuid(id))throw new Error('Bodega inválida.');return apiRequest(`/admin/bodegas/${encodeURIComponent(id)}/validar`,{method:'POST',token:await token()})}
export async function listPendingWines(page=1):Promise<AdminWinePage>{const safePage=Number.isInteger(page)&&page>0?page:1;return apiRequest(`/admin/vinos?estado=pendiente_revision&page=${safePage}&page_size=20`,{method:'GET',token:await token()})}
export async function getAdminWine(id:string):Promise<AdminWineDetail>{if(!isUuid(id))throw new Error('Vino inválido.');return apiRequest(`/admin/vinos/${encodeURIComponent(id)}`,{method:'GET',token:await token()})}
export async function publishAdminWine(id:string):Promise<AdminWineDetail>{if(!isUuid(id))throw new Error('Vino inválido.');return apiRequest(`/admin/vinos/${encodeURIComponent(id)}/publicar`,{method:'POST',token:await token()})}
export async function unpublishAdminWine(id:string):Promise<AdminWineDetail>{if(!isUuid(id))throw new Error('Vino inválido.');return apiRequest(`/admin/vinos/${encodeURIComponent(id)}/despublicar`,{method:'POST',token:await token()})}
export async function listAdminIncidents(page=1,state?:IncidentState):Promise<IncidentPage>{const safePage=Number.isInteger(page)&&page>0?page:1,query=new URLSearchParams({page:String(safePage),page_size:'20'});if(state!==undefined)query.set('estado',state);return apiRequest(`/admin/incidencias?${query}`,{method:'GET',token:await token()})}
export async function getAdminIncident(id:string):Promise<IncidentDetail>{if(!isUuid(id))throw new Error('Incidencia inválida.');return apiRequest(`/admin/incidencias/${encodeURIComponent(id)}`,{method:'GET',token:await token()})}
export async function transitionAdminIncident(id:string,state:IncidentState):Promise<IncidentDetail>{if(!isUuid(id)||!isIncidentState(state))throw new Error('Transición de incidencia inválida.');return apiRequest(`/admin/incidencias/${encodeURIComponent(id)}`,{method:'PATCH',token:await token(),body:{estado_destino:state}})}
