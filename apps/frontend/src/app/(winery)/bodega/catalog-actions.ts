'use server';
import { redirect } from 'next/navigation';
import { isUuid } from '@/lib/cart/contracts';
import { createWineryWine, requestWinePublication, updateWineryProfile, updateWineryWine } from '@/lib/winery/server';
import type { WineryProfilePatch, WineInput } from '@/lib/winery/contracts';

const text=(form:FormData,name:string,max:number):string|undefined=>{const value=String(form.get(name)??'').trim();return value===''?undefined:value.slice(0,max)};
const integer=(form:FormData,name:string):number|undefined=>{const value=text(form,name,20);if(value===undefined)return undefined;const parsed=Number(value);return Number.isInteger(parsed)?parsed:undefined};
const list=(form:FormData,name:string):string[]|undefined=>{const value=text(form,name,2000);if(value===undefined)return undefined;const values=value.split(',').map(item=>item.trim()).filter(Boolean).slice(0,20);return values.length===0?undefined:values};
function winePayload(form:FormData):WineInput|undefined{
  const nombre=text(form,'nombre_comercial',160),precio=text(form,'precio',20),stock=integer(form,'stock_disponible');
  if(nombre===undefined||precio===undefined||!/^(?!0\.00$)(0|[1-9][0-9]{0,7})\.[0-9]{2}$/.test(precio)||stock===undefined||stock<0)return undefined;
  return {nombre_comercial:nombre,precio,moneda:'EUR',stock_disponible:stock,disponible_venta:form.get('disponible_venta')==='on',...optionalText(form),...optionalNumbers(form),...optionalLists(form),produccion_limitada:form.get('produccion_limitada')==='on'};
}
function optionalText(form:FormData):Partial<WineInput>{const result:Record<string,string>={};for(const [name,max] of [['sku',100],['tipo_vino',80],['pais',100],['region',160],['denominacion_origen',160],['crianza',100],['graduacion_alcoholica',10],['descripcion_corta',500],['descripcion_completa',5000],['nota_cata',5000],['maridaje',5000],['temperatura_servicio',100]] as const){const value=text(form,name,max);if(value!==undefined)result[name]=value}return result}
function optionalNumbers(form:FormData):Partial<WineInput>{const result:Record<string,number>={};for(const name of ['anada','meses_crianza','volumen_ml','peso_gramos','plazo_preparacion_dias','botellas_por_caja'] as const){const value=integer(form,name);if(value!==undefined)result[name]=value}return result}
function optionalLists(form:FormData):Partial<WineInput>{return {variedades_uva:list(form,'variedades_uva'),certificaciones:list(form,'certificaciones'),premios:list(form,'premios')}}

export async function saveProfileAction(form:FormData):Promise<never>{
  const body:WineryProfilePatch={};
  for(const [name,max] of [['nombre_comercial',160],['historia',5000],['filosofia',5000],['region',160],['pais',100],['denominacion_origen',160],['web',2048],['video_url',2048],['email_principal',254],['telefono',32],['persona_contacto',100],['logo_url',2048],['imagen_principal_url',2048],['plazo_entrega_estimado',1000],['coste_envio_descripcion',2000],['transportista_habitual',160],['restricciones_entrega',2000],['condiciones_empaquetado',2000]] as const){const value=text(form,name,max);if(value!==undefined)body[name]=value}
  const year=integer(form,'anio_fundacion');if(year!==undefined)body.anio_fundacion=year;
  const preparation=integer(form,'plazo_preparacion_dias');if(preparation!==undefined)body.plazo_preparacion_dias=preparation;
  const rawCountries=String(form.get('paises_envio')??'');
  const countries=rawCountries.split(',').map(item=>item.trim().toUpperCase()).filter(Boolean);
  if(countries.some(item=>!/^[A-Z]{2}$/.test(item))||new Set(countries).size>27)redirect('/bodega/perfil?error=datos');
  body.paises_envio=[...new Set(countries)];
  body.capacidad_internacional=form.get('capacidad_internacional')==='on';
  if(Object.keys(body).length===0)redirect('/bodega/perfil?error=datos');
  try{await updateWineryProfile(body)}catch{redirect('/bodega/perfil?error=guardar')}
  redirect('/bodega/perfil?updated=1')
}
export async function createWineAction(form:FormData):Promise<never>{const body=winePayload(form);if(body===undefined)redirect('/bodega/vinos/nuevo?error=datos');let id:string;try{id=(await createWineryWine(body)).id}catch{redirect('/bodega/vinos/nuevo?error=guardar')}redirect(`/bodega/vinos/${encodeURIComponent(id)}?created=1`)}
export async function updateWineAction(form:FormData):Promise<never>{const id=String(form.get('vino_id')??''),body=winePayload(form);if(!isUuid(id)||body===undefined)redirect('/bodega/vinos?error=datos');try{await updateWineryWine(id,body)}catch{redirect(`/bodega/vinos/${encodeURIComponent(id)}?error=guardar`)}redirect(`/bodega/vinos/${encodeURIComponent(id)}?updated=1`)}
export async function requestPublicationAction(form:FormData):Promise<never>{const id=String(form.get('vino_id')??'');if(!isUuid(id))redirect('/bodega/vinos?error=solicitud');try{await requestWinePublication(id)}catch{redirect(`/bodega/vinos/${encodeURIComponent(id)}?error=publicacion`)}redirect(`/bodega/vinos/${encodeURIComponent(id)}?requested=1`)}
