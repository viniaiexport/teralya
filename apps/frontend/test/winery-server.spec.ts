import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const {apiRequest,readAccessToken,readSessionIdentity}=vi.hoisted(()=>({apiRequest:vi.fn(),readAccessToken:vi.fn(),readSessionIdentity:vi.fn()}));
vi.mock('../src/lib/api/client',()=>({apiRequest}));vi.mock('../src/lib/session/session',()=>({readAccessToken,readSessionIdentity}));
import {createWineryWine,getWineryProfile,getWineryWine,listWineryWines,requestWinePublication,updateWineryProfile,updateWineryWine} from '../src/lib/winery/server';
const id='44444444-4444-4444-8444-444444444444';
const input={nombre_comercial:'Vino',precio:'12.50',moneda:'EUR' as const,stock_disponible:10,disponible_venta:true};
beforeEach(()=>{vi.clearAllMocks();readSessionIdentity.mockResolvedValue({usuario_id:'u',rol:'bodega',bodega_id:'b'});readAccessToken.mockResolvedValue('token')});
describe('contratos de perfil y vinos FE-007',()=>{
 it('consulta y actualiza perfil por API-031/API-006',async()=>{apiRequest.mockResolvedValue({id});await getWineryProfile();expect(apiRequest).toHaveBeenLastCalledWith('/bodegas/yo/perfil',{method:'GET',token:'token'});await updateWineryProfile({region:'Rioja'});expect(apiRequest).toHaveBeenLastCalledWith('/bodegas/yo/perfil',{method:'PATCH',token:'token',body:{region:'Rioja'}})});
 it('crea vino en borrador por API-007',async()=>{apiRequest.mockResolvedValue({id});await createWineryWine(input);expect(apiRequest).toHaveBeenCalledWith('/bodegas/yo/vinos',{method:'POST',token:'token',body:input})});
 it('lista y filtra vinos propios por API-032',async()=>{apiRequest.mockResolvedValue({items:[]});await listWineryWines(2,'borrador');expect(apiRequest).toHaveBeenCalledWith('/bodegas/yo/vinos?page=2&page_size=20&estado=borrador',{method:'GET',token:'token'})});
 it('consulta y reemplaza vino propio por API-033/API-008',async()=>{apiRequest.mockResolvedValue({id});await getWineryWine(id);expect(apiRequest).toHaveBeenLastCalledWith(`/bodegas/yo/vinos/${id}`,{method:'GET',token:'token'});await updateWineryWine(id,input);expect(apiRequest).toHaveBeenLastCalledWith(`/bodegas/yo/vinos/${id}`,{method:'PUT',token:'token',body:input})});
 it('solicita revisión sin publicar directamente por API-034',async()=>{apiRequest.mockResolvedValue({id,estado:'pendiente_revision'});await requestWinePublication(id);expect(apiRequest).toHaveBeenCalledWith(`/bodegas/yo/vinos/${id}/solicitar-publicacion`,{method:'POST',token:'token'})});
 it('rechaza UUID manipulados antes de la API',async()=>{await expect(getWineryWine('../admin')).rejects.toThrow('Vino inválido');expect(apiRequest).not.toHaveBeenCalled()});
 it('bloquea actor que no sea bodega asociada',async()=>{readSessionIdentity.mockResolvedValue({usuario_id:'u',rol:'comprador'});await expect(getWineryProfile()).rejects.toThrow('WINERY_SESSION_REQUIRED');expect(apiRequest).not.toHaveBeenCalled()});
});
