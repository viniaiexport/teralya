export interface StripeConnectStatusDto {
  estado:
    | "no_iniciada"
    | "pendiente"
    | "en_revision"
    | "activa"
    | "restringida"
    | "suspendida";
  cuenta_verificada: boolean;
  cargos_habilitados: boolean;
  cobros_habilitados: boolean;
  puede_cobrar: boolean;
  ultima_sincronizacion?: string;
}

export interface StripeConnectOnboardingDto extends StripeConnectStatusDto {
  onboarding_url: string;
  expires_at: string;
}
