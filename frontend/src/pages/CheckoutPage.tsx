// frontend/src/pages/CheckoutPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  Loader2,
  ArrowLeft,
  FileText,
  QrCode,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Container } from '../components/ui/Container.js';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../contexts/AuthContext.js';
import { PaymentMethodSelector, PaymentMethod } from '../components/billing/PaymentMethodSelector.js';
import { CreditCardForm, CreditCardData } from '../components/billing/CreditCardForm.js';
import { paymentGatewayService } from '../services/payment.gateway.service.js';
import { planService } from '../services/plan.service.js';
import { subscriptionService } from '../services/subscription.service.js';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planId = searchParams.get('plan');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');

  const [plan, setPlan] = useState<any>(null);
  const [gatewayEnabled, setGatewayEnabled] = useState(false);

  // Dados do cartão
  const [cardData, setCardData] = useState<CreditCardData>({
    number: '',
    holderName: '',
    expiryMonth: 0,
    expiryYear: 0,
    cvv: '',
  });
  const [cardValid, setCardValid] = useState(false);

  // Estado do checkout
  const [step, setStep] = useState<'confirm' | 'processing' | 'done'>('confirm');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [pixCopiaCola, setPixCopiaCola] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [planId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Verificar se o gateway está ativo
      const enabled = await paymentGatewayService.isGatewayEnabled();
      setGatewayEnabled(enabled);

      // Carregar plano
      if (planId) {
        const plans = await planService.getPublicPlans();
        const found = plans.plans.find((p: any) => p._id === planId);
        if (found) {
          setPlan(found);
        } else {
          toast.error('Plano não encontrado');
          navigate('/plans');
        }
      } else {
        // Se não tiver plano, redirecionar
        navigate('/plans');
      }
    } catch (error) {
      console.error('Erro ao carregar checkout:', error);
      toast.error('Erro ao carregar dados do checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!plan) return;

    if (!gatewayEnabled) {
      toast.error('Gateway de pagamento não está configurado. Use a versão mock.');
      // Criar pagamento mock
      await handleMockPayment();
      return;
    }

    setProcessing(true);
    setStep('processing');

    try {
      let response;

      switch (paymentMethod) {
        case 'credit_card':
          if (!cardValid) {
            toast.error('Preencha os dados do cartão corretamente');
            setStep('confirm');
            setProcessing(false);
            return;
          }
          response = await paymentGatewayService.processCreditCardPayment({
            amount: plan.priceMonthly,
            description: `Assinatura ${plan.displayName}`,
            cardNumber: cardData.number,
            cardHolder: cardData.holderName,
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear,
            cvv: cardData.cvv,
          });
          break;

        case 'boleto':
          response = await paymentGatewayService.processBoletoPayment({
            amount: plan.priceMonthly,
            description: `Assinatura ${plan.displayName}`,
            returnUrl: window.location.origin + '/billing',
          });
          break;

        case 'pix':
          response = await paymentGatewayService.processPixPayment({
            amount: plan.priceMonthly,
            description: `Assinatura ${plan.displayName}`,
          });
          break;

        default:
          // Mock para outros métodos
          response = await handleMockPayment();
          break;
      }

      setPaymentResult(response);
      setStep('done');

      if (response.boletoUrl) setBoletoUrl(response.boletoUrl);
      if (response.pixCopiaCola) setPixCopiaCola(response.pixCopiaCola);

      toast.success('Pagamento processado com sucesso!');

      // Criar assinatura no sistema
      await subscriptionService.createSubscription({
        planId: plan._id,
        billingCycle: 'monthly',
        autoRenew: true,
        paymentMethod: paymentMethod,
        paymentProvider: gatewayEnabled ? 'manual' : 'manual',
        paymentId: response.paymentId,
      });

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      setStep('confirm');
    } finally {
      setProcessing(false);
    }
  };

  const handleMockPayment = async () => {
    // Simular pagamento mock
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      paymentId: `mock_${Date.now()}`,
      status: 'pending' as const,
      message: 'Pagamento simulado (modo mock)',
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#30736C] mx-auto" />
            <p className="mt-4 text-gray-500">Carregando checkout...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <Container size="sm">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Plano não encontrado</h2>
            <p className="text-gray-500 mt-2">Selecione um plano para continuar</p>
            <Button className="mt-4" onClick={() => navigate('/plans')}>
              Ver Planos
            </Button>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{plan.displayName}</p>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatPrice(plan.priceMonthly)}</p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <p className="text-sm text-gray-500">Ciclo de faturamento</p>
                  <p className="text-sm font-medium text-gray-900">Mensal</p>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-200 pt-3">
                  <p className="text-base font-bold text-gray-900">Total</p>
                  <p className="text-xl font-bold text-[#30736C]">
                    {formatPrice(plan.priceMonthly)}
                    <span className="text-sm font-normal text-gray-500 ml-1">/mês</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {step === 'confirm' && (
            <>
              {/* Seleção de Método de Pagamento */}
              <Card>
                <CardContent className="pt-6">
                  <PaymentMethodSelector
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                  />
                </CardContent>
              </Card>

              {/* Formulário de Cartão de Crédito */}
              {paymentMethod === 'credit_card' && (
                <Card>
                  <CardContent className="pt-6">
                    <CreditCardForm
                      value={cardData}
                      onChange={setCardData}
                      onValidationChange={setCardValid}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Aviso de Gateway Desativado */}
              {!gatewayEnabled && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Gateway de pagamento desativado. O pagamento será simulado.
                  </p>
                </div>
              )}

              {/* Botão de Pagamento */}
              <Button
                onClick={handleSubmit}
                disabled={processing || (paymentMethod === 'credit_card' && !cardValid)}
                className="w-full py-4 text-lg bg-[#30736C] hover:bg-[#265a54] text-white"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {processing ? 'Processando...' : `Pagar ${formatPrice(plan.priceMonthly)}`}
              </Button>
            </>
          )}

          {/* Processando */}
          {step === 'processing' && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#30736C] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Processando pagamento</h3>
                <p className="text-gray-500 mt-2">Aguarde enquanto processamos seu pagamento...</p>
              </CardContent>
            </Card>
          )}

          {/* Concluído */}
          {step === 'done' && paymentResult && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Pagamento Confirmado!</h3>
                <p className="text-gray-500 mt-2">
                  Seu pagamento foi processado com sucesso.
                  {!gatewayEnabled && ' (Modo de simulação)'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  ID do pagamento: {paymentResult.paymentId}
                </p>

                {/* Boleto */}
                {boletoUrl && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-6 h-6 text-[#30736C] mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Boleto gerado com sucesso</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(boletoUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Boleto
                    </Button>
                  </div>
                )}

                {/* Pix */}
                {pixCopiaCola && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <QrCode className="w-6 h-6 text-[#30736C] mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Código Pix para pagamento</p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white p-2 rounded border border-gray-200 break-all">
                        {pixCopiaCola}
                      </code>
                      <button
                        onClick={() => copyToClipboard(pixCopiaCola)}
                        className="p-2 border rounded hover:bg-gray-50"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3 justify-center">
                  <Button onClick={() => navigate('/billing')}>
                    Ir para Faturamento
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Ir para Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </Layout>
  );
};