import 'server-only';
import { apiRequest } from '@/lib/api/client';
import { isUuid } from '@/lib/cart/contracts';
import { readAccessToken, readSessionIdentity } from '@/lib/session/session';
import type { WineryProfile, WineryProfilePatch, WineInput, WineOwnDetail, WineOwnPage, WineState } from './contracts';

async function token():Promise<string>{const [identity,access]=await Promise.all([readSessionIdentity(),readAccessToken()]);if(identity?.rol!=='bodega'||identity.bodega_id===undefined||access===undefined)throw new Error('WINERY_SESSION_REQUIRED');return access}
export async function getWineryProfile():Promise<WineryProfile>{return apiRequest('/bodegas/yo/perfil',{method:'GET',token:await token()})}
export async function updateWineryProfile(body:WineryProfilePatch):Promise<WineryProfile>{return apiRequest('/bodegas/yo/perfil',{method:'PATCH',token:await token(),body})}
export async function listWineryWines(page=1,state?:WineState):Promise<WineOwnPage>{const query=new URLSearchParams({page:String(Number.isInteger(page)&&page>0?page:1),page_size:'20'});if(state!==undefined)query.set('estado',state);return apiRequest(`/bodegas/yo/vinos?${query}`,{method:'GET',token:await token()})}
export async function createWineryWine(body:WineInput):Promise<WineOwnDetail>{return apiRequest('/bodegas/yo/vinos',{method:'POST',token:await token(),body})}
export async function getWineryWine(id:string):Promise<WineOwnDetail>{if(!isUuid(id))throw new Error('Vino inválido.');return apiRequest(`/bodegas/yo/vinos/${encodeURIComponent(id)}`,{method:'GET',token:await token()})}
export async function updateWineryWine(id:string,body:WineInput):Promise<WineOwnDetail>{if(!isUuid(id))throw new Error('Vino inválido.');return apiRequest(`/bodegas/yo/vinos/${encodeURIComponent(id)}`,{method:'PUT',token:await token(),body})}
export async function requestWinePublication(id:string):Promise<WineOwnDetail>{if(!isUuid(id))throw new Error('Vino inválido.');return apiRequest(`/bodegas/yo/vinos/${encodeURIComponent(id)}/solicitar-publicacion`,{method:'POST',token:await token()})}
