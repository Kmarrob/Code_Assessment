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
export declare const paymentConfig: PaymentGatewayConfig;
export declare const stripeConfig: StripeConfig;
export declare const pagSeguroConfig: PagSeguroConfig;
export declare const mercadoPagoConfig: MercadoPagoConfig;
export declare const PAYMENT_CURRENCY = "BRL";
export declare const PAYMENT_DEFAULT_TAX = 0.02;
export declare const getGatewayConfig: () => {
    message: string;
    enabled: boolean;
    provider: "stripe" | "pagseguro" | "mercadopago" | "none";
    mode: "sandbox" | "production";
};
//# sourceMappingURL=payment.d.ts.map