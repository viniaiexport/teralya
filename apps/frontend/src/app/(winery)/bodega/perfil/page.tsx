import Link from 'next/link';
import { getWineryProfile } from '@/lib/winery/server';
import { saveProfileAction } from '../catalog-actions';

interface Props { searchParams: Promise<{ error?: string; updated?: string }> }

export default async function WineryProfilePage({ searchParams }: Props) {
  const query = await searchParams;
  let profile;
  try {
    profile = await getWineryProfile();
  } catch {
    return <section className="screen-state screen-state-error"><h1>No hemos podido cargar el perfil</h1><Link className="button secondary" href="/bodega/perfil">Reintentar</Link></section>;
  }

  return <section className="private-page">
    <nav className="breadcrumbs"><Link href="/bodega">Panel</Link><span>/</span><span>Perfil</span></nav>
    <header className="private-heading"><p className="eyebrow">PT-BOD-002</p><h1>Perfil de {profile.nombre_comercial}</h1><p>Estado de la bodega: {profile.estado.replaceAll('_', ' ')}.</p></header>
    {query.updated && <div className="form-status form-success"><p>Perfil y condiciones de envío actualizados.</p></div>}
    {query.error && <div className="form-status form-error"><p>No se ha podido guardar el perfil.</p></div>}
    <form action={saveProfileAction} className="management-form">
      <fieldset>
        <legend>Perfil público</legend>
        <div className="form-grid">
          <label className="field field-wide">Nombre comercial<input name="nombre_comercial" maxLength={160} defaultValue={profile.nombre_comercial}/></label>
          <label className="field field-wide">Historia<textarea name="historia" maxLength={5000} defaultValue={profile.historia}/></label>
          <label className="field field-wide">Filosofía<textarea name="filosofia" maxLength={5000} defaultValue={profile.filosofia}/></label>
          <label className="field">Región<input name="region" maxLength={160} defaultValue={profile.region}/></label>
          <label className="field">País<input name="pais" maxLength={100} defaultValue={profile.pais}/></label>
          <label className="field">Denominación de origen<input name="denominacion_origen" maxLength={160} defaultValue={profile.denominacion_origen}/></label>
          <label className="field">Año de fundación<input name="anio_fundacion" type="number" min={1800} max={2100} defaultValue={profile.anio_fundacion}/></label>
          <label className="field">Web<input name="web" type="url" maxLength={2048} defaultValue={profile.web}/></label>
          <label className="field">Vídeo<input name="video_url" type="url" maxLength={2048} defaultValue={profile.video_url}/></label>
          <label className="field">Email de contacto<input name="email_principal" type="email" maxLength={254} defaultValue={profile.email_principal}/></label>
          <label className="field">Teléfono<input name="telefono" maxLength={32} defaultValue={profile.telefono}/></label>
          <label className="field">Persona de contacto<input name="persona_contacto" maxLength={100} defaultValue={profile.persona_contacto}/></label>
          <label className="field">URL del logo<input name="logo_url" type="url" maxLength={2048} defaultValue={profile.logo_url}/></label>
          <label className="field field-wide">URL de imagen principal<input name="imagen_principal_url" type="url" maxLength={2048} defaultValue={profile.imagen_principal_url}/></label>
        </div>
      </fieldset>

      <fieldset id="condiciones-envio">
        <legend>Condiciones de envío</legend>
        <p className="form-help">Publica información clara para que el comprador conozca los destinos, plazos y restricciones antes de comprar. Usa códigos ISO de dos letras separados por comas, por ejemplo: ES, FR, DE.</p>
        <div className="form-grid">
          <label className="field field-wide">Países de envío<input name="paises_envio" maxLength={200} defaultValue={profile.paises_envio?.join(', ')}/></label>
          <label className="field">Plazo de preparación en días<input name="plazo_preparacion_dias" type="number" min={0} max={365} defaultValue={profile.plazo_preparacion_dias}/></label>
          <label className="field">Transportista habitual<input name="transportista_habitual" maxLength={160} defaultValue={profile.transportista_habitual}/></label>
          <label className="field field-wide">Plazo estimado de entrega<textarea name="plazo_entrega_estimado" maxLength={1000} defaultValue={profile.plazo_entrega_estimado}/></label>
          <label className="field field-wide">Coste de envío<textarea name="coste_envio_descripcion" maxLength={2000} defaultValue={profile.coste_envio_descripcion}/></label>
          <label className="field field-wide">Restricciones de entrega<textarea name="restricciones_entrega" maxLength={2000} defaultValue={profile.restricciones_entrega}/></label>
          <label className="field field-wide">Condiciones de empaquetado<textarea name="condiciones_empaquetado" maxLength={2000} defaultValue={profile.condiciones_empaquetado}/></label>
          <label className="check-field field-wide"><input name="capacidad_internacional" type="checkbox" defaultChecked={profile.capacidad_internacional}/><span>La bodega está preparada para envíos internacionales dentro de los países indicados.</span></label>
        </div>
      </fieldset>

      <button className="button primary" type="submit">Guardar perfil y condiciones</button>
    </form>
  </section>;
}
