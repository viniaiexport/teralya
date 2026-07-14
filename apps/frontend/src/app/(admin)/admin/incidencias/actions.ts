'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isUuid } from '@/lib/cart/contracts';
import { isIncidentState } from '@/lib/admin/contracts';
import { transitionAdminIncident } from '@/lib/admin/server';
export async function transitionIncidentAction(form:FormData):Promise<never>{const id=String(form.get('incidencia_id')??''),state=String(form.get('estado_destino')??'');if(!isUuid(id)||!isIncidentState(state))redirect('/admin/incidencias?error=datos');try{await transitionAdminIncident(id,state)}catch{redirect(`/admin/incidencias/${encodeURIComponent(id)}?error=transicion`)}revalidatePath('/admin/incidencias');redirect(`/admin/incidencias/${encodeURIComponent(id)}?updated=1`)}
