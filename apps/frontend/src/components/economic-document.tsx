import type { EconomicDocument } from '@/lib/orders/contracts';
import { formatOrderDate } from '@/lib/orders/contracts';

const labels:Record<string,string>={
  subtotal:'Subtotal',
  subtotal_vino:'Subtotal del vino',
  descuentos:'Descuentos',
  vino_neto:'Vino después de descuentos',
  transporte:'Transporte',
  impuestos:'Impuestos',
  comision_teralya:'Comisión Teralya',
  importe_bodega:'Importe para la bodega',
  total_cliente:'Total del cliente',
  total_pagado:'Total pagado',
  base_servicio_intermediacion:'Servicio de intermediación',
  total_retenido:'Total retenido',
  porcentaje_comision:'Comisión aplicada',
  tratamiento_iva:'Tratamiento de IVA',
  numero_pedido:'Pedido',
};

function value(input:unknown):string{
  if(input===null||input===undefined)return'—';
  if(typeof input==='string'||typeof input==='number'||typeof input==='boolean')return String(input);
  return JSON.stringify(input);
}

function Snapshot({title,data}:{title:string;data:Record<string,unknown>}){
  return <section className="private-card"><h2>{title}</h2><dl>{Object.entries(data).map(([key,input])=><div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{value(input)}</dd></div>)}</dl></section>;
}

export function EconomicDocumentView({document}:{document:EconomicDocument}){
  return <article className="private-page">
    <header className="private-heading"><p className="eyebrow">{document.numero_documento}</p><h1>{document.tipo==='justificante_cliente'?'Justificante de pago':document.tipo==='liquidacion_bodega'?'Liquidación de bodega':'Factura de comisión'}</h1><p>Emitido el {formatOrderDate(document.emitido_at)} · Moneda {document.moneda}</p></header>
    <div className="private-card-grid"><Snapshot title="Emisor" data={document.emisor}/><Snapshot title="Receptor" data={document.receptor}/></div>
    <section className="checkout-summary"><h2>Importes</h2><dl>{Object.entries(document.importes).map(([key,input])=><div key={key}><dt>{labels[key]??key.replaceAll('_',' ')}</dt><dd>{value(input)}</dd></div>)}</dl></section>
    <p className="form-help">{document.leyenda}</p>
  </article>;
}
