"use strict";
/**
 * ============================================
 * SCRIPT: POPULAR PAGAMENTOS HISTÓRICOS
 * ============================================
 *
 * Este script cria registros de pagamento para cada empresa
 * baseado no plano e data de criação.
 *
 * @module seed-payments
 * @since v32.0
 *
 * Como executar:
 * npx ts-node src/scripts/seed-payments.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var dotenv = require("dotenv");
var Company_js_1 = require("../models/Company.js");
var Payment_js_1 = require("../models/Payment.js");
var Subscription_js_1 = require("../models/Subscription.js");
var User_js_1 = require("../models/User.js");
dotenv.config();
// ============================================
// CONFIGURAÇÕES
// ============================================
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';
// Mapeamento de planos para preços (em centavos)
var PLAN_PRICES = {
    'basic': 1497,
    'pro': 3297,
    'enterprise': 5997
};
var PLAN_NAMES = {
    'basic': 'Básico',
    'pro': 'Profissional',
    'enterprise': 'Enterprise'
};
// ============================================
// FUNÇÃO PRINCIPAL
// ============================================
function seedPayments() {
    return __awaiter(this, void 0, void 0, function () {
        var companies, totalPaymentsCreated, totalPaymentsUpdated, _i, companies_1, company, user, subscription, planKey, price, planDisplayName, startDate, now, startDateObj, currentDate, paymentsCreated, paymentsUpdated, paymentDate, existingPayment, payment, totalPayments, totalPaidResult, totalPaid, companiesWithPayments, _a, companiesWithPayments_1, item, company, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🚀 Iniciando script de popular pagamentos...');
                    console.log('📊 Conectando ao MongoDB...');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 25, , 27]);
                    return [4 /*yield*/, mongoose_1.default.connect(MONGODB_URI)];
                case 2:
                    _c.sent();
                    console.log('✅ Conectado ao MongoDB com sucesso!');
                    // ============================================
                    // 1. Buscar todas as empresas ativas
                    // ============================================
                    console.log('📊 Buscando empresas...');
                    return [4 /*yield*/, Company_js_1.Company.find({
                            status: { $in: ['active'] }
                        })];
                case 3:
                    companies = _c.sent();
                    console.log("\uD83D\uDCCA Encontradas ".concat(companies.length, " empresas ativas."));
                    totalPaymentsCreated = 0;
                    totalPaymentsUpdated = 0;
                    _i = 0, companies_1 = companies;
                    _c.label = 4;
                case 4:
                    if (!(_i < companies_1.length)) return [3 /*break*/, 16];
                    company = companies_1[_i];
                    console.log("\n\uD83D\uDCCA Processando empresa: ".concat(company.name, " (").concat(company._id, ")"));
                    console.log("   Plano: ".concat(company.plan, ", Criada em: ").concat(company.createdAt));
                    return [4 /*yield*/, User_js_1.User.findOne({
                            companyId: company._id
                        }).sort({ createdAt: 1 })];
                case 5:
                    user = _c.sent();
                    if (!user) {
                        console.log("   \u26A0\uFE0F Nenhum usu\u00E1rio encontrado para esta empresa. Pulando...");
                        return [3 /*break*/, 15];
                    }
                    console.log("   Usu\u00E1rio encontrado: ".concat(user.name, " (").concat(user.email, ")"));
                    return [4 /*yield*/, Subscription_js_1.Subscription.findOne({
                            companyId: company._id,
                            status: { $in: ['active', 'trialing'] }
                        }).sort({ createdAt: -1 })];
                case 6:
                    subscription = _c.sent();
                    planKey = ((_b = company.plan) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'basic';
                    price = PLAN_PRICES[planKey] || 1497;
                    planDisplayName = PLAN_NAMES[planKey] || 'Básico';
                    console.log("   Pre\u00E7o mensal: R$ ".concat((price / 100).toFixed(2)));
                    startDate = (subscription === null || subscription === void 0 ? void 0 : subscription.startDate) || company.createdAt;
                    now = new Date();
                    console.log("   Data de in\u00EDcio: ".concat(startDate));
                    startDateObj = new Date(startDate);
                    currentDate = new Date(startDateObj);
                    currentDate.setDate(1); // Primeiro dia do mês
                    paymentsCreated = 0;
                    paymentsUpdated = 0;
                    _c.label = 7;
                case 7:
                    if (!(currentDate <= now)) return [3 /*break*/, 14];
                    paymentDate = new Date(currentDate);
                    return [4 /*yield*/, Payment_js_1.Payment.findOne({
                            companyId: company._id,
                            createdAt: {
                                $gte: new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1),
                                $lt: new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 1)
                            }
                        })];
                case 8:
                    existingPayment = _c.sent();
                    if (!!existingPayment) return [3 /*break*/, 10];
                    payment = new Payment_js_1.Payment({
                        companyId: company._id,
                        subscriptionId: (subscription === null || subscription === void 0 ? void 0 : subscription._id) || null,
                        userId: user._id,
                        amount: price,
                        amountPaid: price,
                        amountRefunded: 0,
                        currency: 'BRL',
                        transactionType: 'subscription',
                        paymentMethod: 'boleto',
                        paymentProvider: 'manual',
                        status: 'paid',
                        statusHistory: [
                            {
                                status: 'paid',
                                changedAt: paymentDate,
                                reason: 'Pagamento histórico gerado automaticamente'
                            }
                        ],
                        dueDate: new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 1),
                        paidAt: paymentDate,
                        processedAt: paymentDate,
                        billingPeriod: {
                            start: new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1),
                            end: new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 1)
                        },
                        items: [
                            {
                                description: "Plano ".concat(planDisplayName, " - ").concat(paymentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })),
                                quantity: 1,
                                unitPrice: price,
                                totalPrice: price,
                                type: 'plan'
                            }
                        ],
                        discounts: [],
                        fees: [],
                        companyName: company.name,
                        companyCnpj: company.cnpj || '',
                        userEmail: user.email || '',
                        userName: user.name || '',
                        metadata: {
                            generatedBy: 'seed-payments-script',
                            generatedAt: new Date(),
                            month: paymentDate.getMonth() + 1,
                            year: paymentDate.getFullYear(),
                            isHistorical: true
                        },
                        notes: 'Pagamento gerado automaticamente pelo script de seed',
                        createdBy: company.createdBy || null,
                        createdAt: paymentDate,
                        updatedAt: paymentDate
                    });
                    return [4 /*yield*/, payment.save()];
                case 9:
                    _c.sent();
                    paymentsCreated++;
                    console.log("   \u2705 Criado pagamento: ".concat(paymentDate.toLocaleDateString('pt-BR'), " - R$ ").concat((price / 100).toFixed(2)));
                    return [3 /*break*/, 13];
                case 10:
                    if (!(existingPayment.status !== 'paid')) return [3 /*break*/, 12];
                    existingPayment.status = 'paid';
                    existingPayment.paidAt = paymentDate;
                    existingPayment.processedAt = paymentDate;
                    existingPayment.amountPaid = existingPayment.amount;
                    existingPayment.addStatusHistory('paid', 'Status atualizado pelo script de seed');
                    return [4 /*yield*/, existingPayment.save()];
                case 11:
                    _c.sent();
                    paymentsUpdated++;
                    console.log("   \uD83D\uDD04 Atualizado pagamento: ".concat(paymentDate.toLocaleDateString('pt-BR'), " - status alterado para 'paid'"));
                    return [3 /*break*/, 13];
                case 12:
                    console.log("   \u23F3 Pagamento j\u00E1 existe: ".concat(paymentDate.toLocaleDateString('pt-BR')));
                    _c.label = 13;
                case 13:
                    // Avançar para o próximo mês
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    return [3 /*break*/, 7];
                case 14:
                    console.log("   \uD83D\uDCCA Total: ".concat(paymentsCreated, " criados, ").concat(paymentsUpdated, " atualizados"));
                    totalPaymentsCreated += paymentsCreated;
                    totalPaymentsUpdated += paymentsUpdated;
                    _c.label = 15;
                case 15:
                    _i++;
                    return [3 /*break*/, 4];
                case 16:
                    // ============================================
                    // 4. Resumo final
                    // ============================================
                    console.log('\n✅ SCRIPT CONCLUÍDO COM SUCESSO!');
                    console.log("\uD83D\uDCCA Total de pagamentos criados: ".concat(totalPaymentsCreated));
                    console.log("\uD83D\uDCCA Total de pagamentos atualizados: ".concat(totalPaymentsUpdated));
                    return [4 /*yield*/, Payment_js_1.Payment.countDocuments()];
                case 17:
                    totalPayments = _c.sent();
                    return [4 /*yield*/, Payment_js_1.Payment.aggregate([
                            { $match: { status: 'paid' } },
                            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
                        ])];
                case 18:
                    totalPaidResult = _c.sent();
                    totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].total : 0;
                    console.log("\n\uD83D\uDCCA Estat\u00EDsticas finais:");
                    console.log("   Total de registros de pagamento: ".concat(totalPayments));
                    console.log("   Total pago: R$ ".concat((totalPaid / 100).toFixed(2)));
                    return [4 /*yield*/, Payment_js_1.Payment.aggregate([
                            { $group: { _id: '$companyId', count: { $sum: 1 }, total: { $sum: '$amountPaid' } } },
                            { $sort: { total: -1 } },
                            { $limit: 10 }
                        ])];
                case 19:
                    companiesWithPayments = _c.sent();
                    console.log("\n\uD83D\uDCCA Top 10 empresas por valor pago:");
                    _a = 0, companiesWithPayments_1 = companiesWithPayments;
                    _c.label = 20;
                case 20:
                    if (!(_a < companiesWithPayments_1.length)) return [3 /*break*/, 23];
                    item = companiesWithPayments_1[_a];
                    return [4 /*yield*/, Company_js_1.Company.findById(item._id)];
                case 21:
                    company = _c.sent();
                    if (company) {
                        console.log("   ".concat(company.name, ": ").concat(item.count, " pagamentos - R$ ").concat((item.total / 100).toFixed(2)));
                    }
                    _c.label = 22;
                case 22:
                    _a++;
                    return [3 /*break*/, 20];
                case 23: return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 24:
                    _c.sent();
                    console.log('🔌 Desconectado do MongoDB.');
                    return [3 /*break*/, 27];
                case 25:
                    error_1 = _c.sent();
                    console.error('❌ Erro ao executar script:', error_1);
                    return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 26:
                    _c.sent();
                    process.exit(1);
                    return [3 /*break*/, 27];
                case 27: return [2 /*return*/];
            }
        });
    });
}
// ============================================
// EXECUÇÃO
// ============================================
seedPayments();
