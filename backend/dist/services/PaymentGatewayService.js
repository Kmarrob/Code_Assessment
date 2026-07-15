"use strict";
// backend/src/services/PaymentGatewayService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePaymentGateway = void 0;
const logger_js_1 = require("../utils/logger.js");
class BasePaymentGateway {
    /**
     * Log de ação para simulação
     */
    log(action, data) {
        logger_js_1.logger.info(`[${this.name}] ${action}:`, {
            data,
            timestamp: new Date().toISOString(),
            enabled: this.enabled,
        });
    }
    /**
     * Simular delay para simular processamento real
     */
    simulateDelay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Método para simular criação de pagamento (quando desativado)
     */
    mockCreatePayment(params) {
        const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        return {
            success: true,
            paymentId: mockId,
            status: 'pending',
            providerResponse: { mock: true },
            message: `[MOCK] Pagamento simulado para ${params.amount / 100} ${params.currency}`,
        };
    }
    /**
     * Método para simular confirmação de pagamento (quando desativado)
     */
    mockConfirmPayment(paymentId) {
        return {
            success: true,
            paymentId,
            status: 'paid',
            providerResponse: { mock: true },
            message: `[MOCK] Pagamento ${paymentId} confirmado simulado`,
        };
    }
    /**
     * Método para simular estorno (quando desativado)
     */
    mockRefundPayment(paymentId) {
        return {
            success: true,
            paymentId,
            status: 'refunded',
            providerResponse: { mock: true },
            message: `[MOCK] Pagamento ${paymentId} estornado simulado`,
        };
    }
}
exports.BasePaymentGateway = BasePaymentGateway;
//# sourceMappingURL=PaymentGatewayService.js.map