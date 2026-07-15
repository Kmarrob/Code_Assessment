"use strict";
// backend/src/config/payment.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGatewayConfig = exports.PAYMENT_DEFAULT_TAX = exports.PAYMENT_CURRENCY = exports.mercadoPagoConfig = exports.pagSeguroConfig = exports.stripeConfig = exports.paymentConfig = void 0;
exports.paymentConfig = {
    enabled: process.env.PAYMENT_GATEWAY_ENABLED === 'true',
    provider: process.env.PAYMENT_GATEWAY_PROVIDER || 'none',
    mode: process.env.PAYMENT_GATEWAY_MODE || 'sandbox',
};
exports.stripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
};
exports.pagSeguroConfig = {
    email: process.env.PAGSEGURO_EMAIL || '',
    token: process.env.PAGSEGURO_TOKEN || '',
    sandbox: process.env.PAGSEGURO_SANDBOX === 'true',
};
exports.mercadoPagoConfig = {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
};
exports.PAYMENT_CURRENCY = 'BRL';
exports.PAYMENT_DEFAULT_TAX = 0.02; // 2% taxa padrão para gateways
const getGatewayConfig = () => {
    if (!exports.paymentConfig.enabled) {
        return {
            enabled: false,
            provider: 'none',
            mode: 'sandbox',
            message: 'Gateway de pagamento está desativado. Ative via variável PAYMENT_GATEWAY_ENABLED=true',
        };
    }
    return {
        ...exports.paymentConfig,
        message: `Gateway ${exports.paymentConfig.provider} está configurado em modo ${exports.paymentConfig.mode}`,
    };
};
exports.getGatewayConfig = getGatewayConfig;
//# sourceMappingURL=payment.js.map