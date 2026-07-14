// frontend/src/pages/BillingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Building2,
  Users,
  Clock,
  FileText,
  Download,
  Printer,
  RefreshCw,
  XCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Container } from '../components/ui/Container.js';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../contexts/AuthContext.js';
import { subscriptionService, Subscription, SubscriptionStatusResult } from '../services/subscription.service.js';
import { paymentService, Payment } from '../services/payment.service.js';
import { planService, Plan } from '../services/plan.service.js';
import toast from 'react-hot-toast';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusResult | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentPagination, setPaymentPagination] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentLimit] = useState(10);

  useEffect(() => {
    loadData();
  }, [paymentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar assinatura ativa
      const activeData = await subscriptionService.getActiveSubscription();
      setSubscription(activeData.subscription);
      setSubscriptionStatus(activeData.status);

      // Carregar histórico de pagamentos
      const paymentsData = await paymentService.listPayments({
        page: paymentPage,
        limit: paymentLimit,
      });
      setPayments(paymentsData.payments || []);
      setPaymentPagination(paymentsData.pagination);

      // Carregar planos disponíveis
      const plansData = await planService.getPublicPlans();
      setPlans(plansData.plans || []);

      // Selecionar plano atual
      if (activeData.subscription?.planId) {
        const planId = typeof activeData.subscription.planId === 'string'
          ? activeData.subscription.planId
          : (activeData.subscription.planId as any)._id;
        setSelectedPlan(planId);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de faturamento:', error);
      toast.error('Erro ao carregar dados de faturamento');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!subscription) return;

    setUpgrading(true);
    try {
      await subscriptionService.updateSubscription(subscription._id, {
        planId,
      });
      toast.success('Plano atualizado com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    setCancelling(true);
    try {
      await subscriptionService.cancelSubscription(subscription._id, cancelReason);
      toast.success('Assinatura cancelada com sucesso');
      setShowCancelConfirm(false);
      setCancelReason('');
      await loadData();
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast.error('Erro ao cancelar assinatura');
    } finally {
      setCancelling(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!subscription) return;

    try {
      await paymentService.generateInvoice(subscription._id);
      toast.success('Fatura gerada com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      toast.error('Erro ao gerar fatura');
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p._id === planId);
    return plan?.displayName || planId;
  };

  const getPlanColor = (planName: string) => {
    const colors: Record<string, string> = {
      'basic': 'text-gray-600',
      'pro': 'text-[#30736C]',
      'enterprise': 'text-[#122A40]',
    };
    return colors[planName] || 'text-gray-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#30736C] mx-auto" />
            <p className="mt-4 text-gray-500">Carregando informações de faturamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const hasSubscription = subscription && subscriptionStatus;

  return (
    <Layout>
      <Container size="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faturamento</h1>
            <p className="text-gray-500">Gerencie sua assinatura e histórico de pagamentos</p>
          </div>
          <div className="flex gap-3">
            {hasSubscription && subscriptionStatus.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInvoice}
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar Fatura
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/plans')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Ver Planos
            </Button>
          </div>
        </div>

        {/* Status da Assinatura */}
        {hasSubscription ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Plano</p>
                  <p className={`text-lg font-bold ${getPlanColor(subscription.status)}`}>
                    {getPlanName(typeof subscription.planId === 'string' ? subscription.planId : (subscription.planId as any)._id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${subscriptionService.getStatusColor(subscription.status)}`}>
                    {subscriptionService.getStatusLabel(subscription.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Próxima Cobrança</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(subscription.nextPaymentDate || subscription.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(subscription.amount)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      /{subscription.billingCycle === 'annual' ? 'ano' : 'mês'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Detalhes adicionais */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Usuários</p>
                  <p className="text-sm font-medium text-gray-900">
                    {subscription.currentUsers || 0} / {subscription.maxUsers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Horas de Consultoria</p>
                  <p className="text-sm font-medium text-gray-900">
                    {subscription.consultingHoursUsed || 0} / {subscription.consultingHoursTotal || 0}
                    {subscription.consultingHoursRemaining !== undefined && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({subscription.consultingHoursRemaining} restantes)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Renovação Automática</p>
                  <p className="text-sm font-medium">
                    {subscription.autoRenew ? (
                      <span className="text-green-600">✅ Ativa</span>
                    ) : (
                      <span className="text-red-500">❌ Desativada</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ciclo de Faturamento</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {subscription.billingCycle}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/plans')}
                >
                  Mudar Plano
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  disabled={subscription.status === 'cancelled'}
                >
                  Cancelar Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Você não possui uma assinatura ativa</p>
              <Button
                className="mt-4"
                style={{ backgroundColor: '#30736C', color: '#FFFFFF' }}
                onClick={() => navigate('/plans')}
              >
                Ver Planos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Features do Plano */}
        {hasSubscription && subscription.features && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Funcionalidades do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {subscription.features.canViewReport ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Visualizar Relatório</span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.features.canPrintReport ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Imprimir/Download</span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.features.canViewRoadmap ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Roadmap</span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.features.canViewComparative ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Comparativo Anual</span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.features.canExportData ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Exportação de Dados</span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.features.hasConsultingHours && subscription.features.consultingHours > 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">
                    {subscription.features.consultingHours}h de Consultoria
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.features.supportPriority === 'high' || subscription.features.supportPriority === 'critical' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Suporte Prioritário</span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.features.canIntegrateAPI ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">API e SSO</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade de Plano */}
        {hasSubscription && subscriptionStatus.isActive && plans.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Upgrade de Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const currentPlanId = typeof subscription.planId === 'string'
                    ? subscription.planId
                    : (subscription.planId as any)._id;
                  const isCurrent = plan._id === currentPlanId;
                  const isUpgrade = plan.priceMonthly > (subscription.amount || 0);

                  return (
                    <div
                      key={plan._id}
                      className={`p-4 rounded-xl border-2 ${
                        isCurrent
                          ? 'border-[#30736C] bg-[#30736C]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{plan.displayName}</h4>
                          <p className="text-sm text-gray-500">
                            {plan.features.maxUsers >= 999 ? 'Ilimitado' : `Até ${plan.features.maxUsers}`} usuários
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {planService.formatPrice(plan.priceMonthly)}
                            <span className="text-xs font-normal text-gray-500">/mês</span>
                          </p>
                        </div>
                        {isCurrent ? (
                          <span className="text-sm font-medium text-[#30736C]">Atual</span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleUpgrade(plan._id)}
                            disabled={upgrading}
                            style={{
                              backgroundColor: isUpgrade ? '#30736C' : '#122A40',
                              color: '#FFFFFF',
                            }}
                          >
                            {upgrading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              isUpgrade ? 'Fazer Upgrade' : 'Alterar'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Pagamentos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
              <span className="text-sm text-gray-500">
                Total: {paymentPagination?.total || 0} pagamentos
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum pagamento encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Data
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Descrição
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Método
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {payment.items[0]?.description || 'Pagamento'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {payment.transactionType}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                          {paymentService.getPaymentMethodLabel(payment.paymentMethod)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${paymentService.getStatusColor(payment.status)}`}>
                            {paymentService.getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginação */}
            {paymentPagination && paymentPagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Página {paymentPagination.page} de {paymentPagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                    disabled={paymentPagination.page <= 1}
                    className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPaymentPage(p => Math.min(paymentPagination.totalPages, p + 1))}
                    disabled={paymentPagination.page >= paymentPagination.totalPages}
                    className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Cancelar Assinatura</h2>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-600 text-center">
                Tem certeza que deseja cancelar sua assinatura?
              </p>
              <p className="text-sm text-gray-400 text-center mt-1">
                Você perderá acesso ao sistema ao final do período pago atual.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo do cancelamento (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Conte-nos o motivo do cancelamento..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent resize-none h-20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmar Cancelamento'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};