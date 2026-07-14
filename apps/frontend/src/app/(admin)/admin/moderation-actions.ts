'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isUuid } from '@/lib/cart/contracts';
import { publishAdminWine, unpublishAdminWine, validateAdminWinery } from '@/lib/admin/server';
export async function validateWineryAction(form:FormData):Promise<never>{const id=String(form.get('bodega_id')??'');if(!isUuid(id))redirect('/admin/bodegas?error=datos');try{await validateAdminWinery(id)}catch{redirect(`/admin/bodegas/${encodeURIComponent(id)}?error=validar`)}revalidatePath('/admin/bodegas');redirect(`/admin/bodegas/${encodeURIComponent(id)}?validated=1`)}
export async function publishWineAction(form:FormData):Promise<never>{const id=String(form.get('vino_id')??'');if(!isUuid(id))redirect('/admin/vinos?error=datos');try{await publishAdminWine(id)}catch{redirect(`/admin/vinos/${encodeURIComponent(id)}?error=publicar`)}revalidatePath('/admin/vinos');redirect(`/admin/vinos/${encodeURIComponent(id)}?published=1`)}
export async function unpublishWineAction(form:FormData):Promise<never>{const id=String(form.get('vino_id')??'');if(!isUuid(id))redirect('/admin/vinos?error=datos');try{await unpublishAdminWine(id)}catch{redirect(`/admin/vinos/${encodeURIComponent(id)}?error=despublicar`)}revalidatePath('/admin/vinos');redirect(`/admin/vinos/${encodeURIComponent(id)}?unpublished=1`)}
