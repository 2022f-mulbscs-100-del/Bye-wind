export type BackendPaymentGateway = {
  id: string;
  provider: string;
  currency: string;
  isActive: boolean;
  isTestMode: boolean;
  taxRate?: number;
  config?: Record<string, unknown>;
};

export type PaymentGatewayView = {
  id: string;
  provider: string;
  label: string;
  status: "Active" | "Inactive";
  currency: string;
  isTestMode: boolean;
  taxRate?: number;
  config?: Record<string, unknown>;
};

export type ReservationPaymentMethod = {
  id: string;
  label: string;
};

export const FALLBACK_PAYMENT_GATEWAYS: BackendPaymentGateway[] = [
  {
    id: "gw-1",
    provider: "Stripe",
    currency: "USD",
    isActive: true,
    isTestMode: false,
    taxRate: 0,
  },
  {
    id: "gw-2",
    provider: "Square",
    currency: "USD",
    isActive: false,
    isTestMode: true,
    taxRate: 0,
  },
];

export const mapPaymentGatewayToView = (gateway: BackendPaymentGateway): PaymentGatewayView => ({
  id: gateway.id,
  provider: gateway.provider,
  label: `${gateway.provider} (${gateway.currency})`,
  status: gateway.isActive ? "Active" : "Inactive",
  currency: gateway.currency,
  isTestMode: gateway.isTestMode,
  taxRate: gateway.taxRate,
  config: gateway.config,
});

export const mapGatewayToMethod = (gateway: PaymentGatewayView): ReservationPaymentMethod => ({
  id: gateway.id,
  label: `${gateway.provider} · ${gateway.currency}${gateway.isTestMode ? " (Test)" : ""}`,
});
