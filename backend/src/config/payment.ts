// backend/src/config/payment.ts

import { config } from './env.js';

export interface PaymentGatewayConfig {
  enabled: boolean;
  provider: 'stripe' | 'pagseguro' | 'mercadopago' | 'none';
  mode: 'sandbox' | 'production';
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
}

export interface PagSeguroConfig {
  email: string;
  token: string;
  sandbox: boolean;
}

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
}

export const paymentConfig: PaymentGatewayConfig = {
  enabled: process.env.PAYMENT_GATEWAY_ENABLED === 'true',
  provider: (process.env.PAYMENT_GATEWAY_PROVIDER as 'stripe' | 'pagseguro' | 'mercadopago' | 'none') || 'none',
  mode: (process.env.PAYMENT_GATEWAY_MODE as 'sandbox' | 'production') || 'sandbox',
};

export const stripeConfig: StripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
};

export const pagSeguroConfig: PagSeguroConfig = {
  email: process.env.PAGSEGURO_EMAIL || '',
  token: process.env.PAGSEGURO_TOKEN || '',
  sandbox: process.env.PAGSEGURO_SANDBOX === 'true',
};

export const mercadoPagoConfig: MercadoPagoConfig = {
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
};

export const PAYMENT_CURRENCY = 'BRL';
export const PAYMENT_DEFAULT_TAX = 0.02; // 2% taxa padrão para gateways

export const getGatewayConfig = () => {
  if (!paymentConfig.enabled) {
    return {
      enabled: false,
      provider: 'none' as const,
      mode: 'sandbox' as const,
      message: 'Gateway de pagamento está desativado. Ative via variável PAYMENT_GATEWAY_ENABLED=true',
    };
  }

  return {
    ...paymentConfig,
    message: `Gateway ${paymentConfig.provider} está configurado em modo ${paymentConfig.mode}`,
  };
};