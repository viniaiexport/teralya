export interface DashboardSales {
  importe: string;
  moneda: 'EUR';
  num_pedidos: number;
}

export interface AdminDashboard {
  ventas_dia: DashboardSales;
  pedidos_pendientes: number;
}
