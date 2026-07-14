'use server';
import { revalidatePath } from 'next/cache';
import { ApiProblem } from '@/lib/api/problem';
import { isUuid } from '@/lib/cart/contracts';
import type { ImageActionResult, ImagePatchRequest, ImageUploadAuthorization, ImageUploadRequest, WineImage, WineImageContentType } from '@/lib/winery/contracts';
import { authorizeWineImageUpload, confirmWineImage, deleteWineImage, updateWineImage } from '@/lib/winery/server';

const types:readonly WineImageContentType[]=['image/jpeg','image/png','image/webp'];
const validText=(value:string,max:number):boolean=>value.trim().length>=1&&value.trim().length<=max;
const validOrder=(value:number|undefined):boolean=>value===undefined||(Number.isInteger(value)&&value>=0&&value<=999);
function failure<T=undefined>(error:unknown,fallback:string):ImageActionResult<T>{if(error instanceof ApiProblem)return{ok:false,message:error.problem.status===409?'La operación entra en conflicto con el estado actual del vino.':fallback,requestId:error.problem.request_id};return{ok:false,message:fallback}}
function refresh(wineId:string):void{revalidatePath(`/bodega/vinos/${wineId}`)}

export async function authorizeImageUploadAction(wineId:string,body:ImageUploadRequest):Promise<ImageActionResult<ImageUploadAuthorization>>{
  if(!isUuid(wineId)||!isUuid(body.upload_id)||!validText(body.nombre_archivo,200)||!types.includes(body.content_type)||!Number.isInteger(body.tamanio_bytes)||body.tamanio_bytes<1||body.tamanio_bytes>10485760||!/^[A-Za-z0-9+/]{43}=$/.test(body.checksum_sha256))return{ok:false,message:'El archivo no cumple los requisitos de carga.'};
  try{return{ok:true,data:await authorizeWineImageUpload(wineId,{...body,nombre_archivo:body.nombre_archivo.trim()})}}catch(error){return failure<ImageUploadAuthorization>(error,'No se ha podido autorizar la carga.')}
}
export async function confirmImageUploadAction(wineId:string,body:{upload_id:string;confirmation_token:string;alt_text:string;orden?:number;es_principal?:boolean}):Promise<ImageActionResult<WineImage>>{
  if(!isUuid(wineId)||!isUuid(body.upload_id)||body.confirmation_token.length<32||body.confirmation_token.length>4096||!validText(body.alt_text,500)||!validOrder(body.orden)||typeof body.es_principal!=='boolean')return{ok:false,message:'Los metadatos de la imagen no son válidos.'};
  try{const data=await confirmWineImage(wineId,{...body,alt_text:body.alt_text.trim()});refresh(wineId);return{ok:true,data}}catch(error){return failure<WineImage>(error,'No se ha podido verificar y confirmar la imagen.')}
}
export async function updateImageAction(wineId:string,imageId:string,body:ImagePatchRequest):Promise<ImageActionResult<WineImage>>{
  const keys=Object.keys(body);if(!isUuid(wineId)||!isUuid(imageId)||keys.length===0||keys.some(key=>!['alt_text','orden','es_principal'].includes(key))||(body.alt_text!==undefined&&!validText(body.alt_text,500))||!validOrder(body.orden)||(body.es_principal!==undefined&&typeof body.es_principal!=='boolean'))return{ok:false,message:'Los metadatos de la imagen no son válidos.'};
  try{const data=await updateWineImage(wineId,imageId,{...body,...(body.alt_text===undefined?{}:{alt_text:body.alt_text.trim()})});refresh(wineId);return{ok:true,data}}catch(error){return failure<WineImage>(error,'No se han podido actualizar los metadatos.')}
}
export async function deleteImageAction(wineId:string,imageId:string):Promise<ImageActionResult>{
  if(!isUuid(wineId)||!isUuid(imageId))return{ok:false,message:'La imagen no es válida.'};
  try{await deleteWineImage(wineId,imageId);refresh(wineId);return{ok:true}}catch(error){return failure(error,'No se ha podido desactivar la imagen.')}
}
