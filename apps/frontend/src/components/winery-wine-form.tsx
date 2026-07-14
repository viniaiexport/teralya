import type { WineOwnDetail } from '@/lib/winery/contracts';
import { createWineAction, updateWineAction } from '@/app/(winery)/bodega/catalog-actions';

const joined=(value?:string[]):string=>value?.join(', ')??'';
export function WineryWineForm({wine}:{wine?:WineOwnDetail}){
  return <form action={wine===undefined?createWineAction:updateWineAction} className="management-form">
    {wine!==undefined&&<input type="hidden" name="vino_id" value={wine.id}/>}<div className="form-grid">
    <label className="field field-wide">Nombre comercial<input name="nombre_comercial" required maxLength={160} defaultValue={wine?.nombre_comercial}/></label>
    <label className="field">Precio EUR<input name="precio" required inputMode="decimal" pattern="^(?!0\.00$)(0|[1-9][0-9]{0,7})\.[0-9]{2}$" placeholder="12.50" defaultValue={wine?.precio}/></label>
    <label className="field">Stock disponible<input name="stock_disponible" required type="number" min={0} max={999999} defaultValue={wine?.stock_disponible??0}/></label>
    <label className="check-field field-wide"><input type="checkbox" name="disponible_venta" defaultChecked={wine?.disponible_venta??true}/>Disponible para venta</label>
    <label className="field">SKU<input name="sku" maxLength={100} defaultValue={wine?.sku}/></label><label className="field">Tipo de vino<input name="tipo_vino" maxLength={80} defaultValue={wine?.tipo_vino}/></label>
    <label className="field">Añada<input name="anada" type="number" min={1800} max={2100} defaultValue={wine?.anada}/></label><label className="field">País<input name="pais" maxLength={100} defaultValue={wine?.pais}/></label>
    <label className="field">Región<input name="region" maxLength={160} defaultValue={wine?.region}/></label><label className="field">Denominación de origen<input name="denominacion_origen" maxLength={160} defaultValue={wine?.denominacion_origen}/></label>
    <label className="field field-wide">Variedades de uva, separadas por comas<input name="variedades_uva" maxLength={2000} defaultValue={joined(wine?.variedades_uva)}/></label>
    <label className="field">Crianza<input name="crianza" maxLength={100} defaultValue={wine?.crianza}/></label><label className="field">Meses de crianza<input name="meses_crianza" type="number" min={0} max={120} defaultValue={wine?.meses_crianza}/></label>
    <label className="field">Graduación alcohólica<input name="graduacion_alcoholica" inputMode="decimal" placeholder="13.50" defaultValue={wine?.graduacion_alcoholica}/></label><label className="field">Volumen (ml)<input name="volumen_ml" type="number" min={1} max={10000} defaultValue={wine?.volumen_ml}/></label>
    <label className="field field-wide">Descripción corta<textarea name="descripcion_corta" maxLength={500} defaultValue={wine?.descripcion_corta}/></label><label className="field field-wide">Descripción completa<textarea name="descripcion_completa" maxLength={5000} defaultValue={wine?.descripcion_completa}/></label>
    <label className="field field-wide">Nota de cata<textarea name="nota_cata" maxLength={5000} defaultValue={wine?.nota_cata}/></label><label className="field field-wide">Maridaje<textarea name="maridaje" maxLength={5000} defaultValue={wine?.maridaje}/></label>
    <label className="field">Temperatura de servicio<input name="temperatura_servicio" maxLength={100} defaultValue={wine?.temperatura_servicio}/></label><label className="field">Peso (g)<input name="peso_gramos" type="number" min={1} max={100000} defaultValue={wine?.peso_gramos}/></label>
    <label className="field">Preparación (días)<input name="plazo_preparacion_dias" type="number" min={0} max={365} defaultValue={wine?.plazo_preparacion_dias}/></label><label className="field">Botellas por caja<input name="botellas_por_caja" type="number" min={1} max={100} defaultValue={wine?.botellas_por_caja}/></label>
    <label className="field field-wide">Certificaciones, separadas por comas<input name="certificaciones" maxLength={2000} defaultValue={joined(wine?.certificaciones)}/></label><label className="field field-wide">Premios, separados por comas<input name="premios" maxLength={2000} defaultValue={joined(wine?.premios)}/></label>
    <label className="check-field field-wide"><input type="checkbox" name="produccion_limitada" defaultChecked={wine?.produccion_limitada}/>Producción limitada</label></div>
    <button className="button primary" type="submit">{wine===undefined?'Crear vino':'Guardar todos los datos'}</button>{wine!==undefined&&<p className="field-help">La edición sustituye el registro completo. Los campos opcionales vacíos se eliminan.</p>}
  </form>;
}
