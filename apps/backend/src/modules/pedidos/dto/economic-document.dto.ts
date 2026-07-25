export interface EconomicDocumentDto {
  tipo: "justificante_cliente" | "liquidacion_bodega" | "factura_comision";
  numero_documento: string;
  pedido_id: string;
  subpedido_id?: string;
  emisor: Record<string, unknown>;
  receptor: Record<string, unknown>;
  importes: Record<string, unknown>;
  moneda: "EUR";
  leyenda: string;
  emitido_at: string;
}
