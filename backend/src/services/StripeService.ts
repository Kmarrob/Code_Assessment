import {
  BasePaymentGateway,
  PaymentGatewayService,
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundPaymentParams,
  PaymentGatewayResponse,
  PaymentWebhookData,
} from './PaymentGatewayService.js';

import { stripeConfig, paymentConfig } from '../config/payment.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';


interface StripeClient {
  paymentIntents?: unknown;
  webhooks?: {
    constructEvent(
      payload: string | Buffer,
      signature: string,
      secret: string
    ): unknown;
  };
}


export class StripeService
  extends BasePaymentGateway
  implements PaymentGatewayService {

  name = 'Stripe';

  enabled =
    paymentConfig.enabled &&
    paymentConfig.provider === 'stripe';


  private stripe: StripeClient | null = null;

  private initialized = false;


  async initialize(): Promise<void> {

    if (!this.enabled) {

      logger.info(
        '[Stripe] Serviço desativado. Utilizando modo MOCK.'
      );

      this.initialized = true;
      return;
    }


    try {

      /**
       * Importação dinâmica para evitar quebra
       * quando Stripe não estiver instalado.
       */
      const stripePackage = await import('stripe');


      const Stripe =
        stripePackage.default ||
        stripePackage;


      this.stripe = new Stripe(
        stripeConfig.secretKey,
        {
          apiVersion:
            '2026-06-24.dahlia',
        }
      );


      this.initialized = true;


      logger.info(
        '[Stripe] Serviço inicializado com sucesso.'
      );


    } catch (error) {


      logger.warn(
        '[Stripe] Biblioteca stripe não encontrada. Ativando MOCK.'
      );


      this.stripe = null;

      this.initialized = true;


      logger.info(
        '[Stripe] Serviço executando em modo MOCK.'
      );
    }

  }



  async createPayment(
    params: CreatePaymentParams
  ): Promise<PaymentGatewayResponse> {


    if (
      !this.enabled ||
      !this.initialized
    ) {

      this.log(
        'createPayment MOCK',
        params
      );


      return this.mockCreatePayment(params);
    }


    try {


      /**
       * Implementação real Stripe futuramente.
       */


      this.log(
        'createPayment REAL',
        params
      );


      return this.mockCreatePayment(params);


    } catch(error) {


      logger.error(
        '[Stripe] Erro ao criar pagamento:',
        error
      );


      return {

        success:false,

        paymentId:'',

        status:'failed',

        providerResponse:error,

        error:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido'
      };

    }

  }




  async confirmPayment(
    params: ConfirmPaymentParams
  ): Promise<PaymentGatewayResponse> {


    if (
      !this.enabled ||
      !this.initialized
    ) {


      return this.mockConfirmPayment(
        params.paymentId
      );

    }


    try {


      this.log(
        'confirmPayment REAL',
        params
      );


      return this.mockConfirmPayment(
        params.paymentId
      );


    } catch(error){


      logger.error(
        '[Stripe] Erro confirmar pagamento:',
        error
      );


      return {

        success:false,

        paymentId:
          params.paymentId,

        status:'failed',

        providerResponse:error,

        error:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido'
      };

    }

  }





  async refundPayment(
    params: RefundPaymentParams
  ): Promise<PaymentGatewayResponse> {


    if (
      !this.enabled ||
      !this.initialized
    ) {

      return this.mockRefundPayment(
        params.paymentId
      );

    }


    try {


      this.log(
        'refundPayment REAL',
        params
      );


      return this.mockRefundPayment(
        params.paymentId
      );


    } catch(error){


      logger.error(
        '[Stripe] Erro refund:',
        error
      );


      return {

        success:false,

        paymentId:
          params.paymentId,

        status:'failed',

        providerResponse:error,

        error:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido'
      };

    }

  }





  async handleWebhook(
    data:any,
    headers:any
  ):Promise<PaymentWebhookData>{



    if(
      !this.enabled ||
      !this.initialized
    ){


      const event =
        data?.type ??
        'payment_intent.succeeded';


      return {

        provider:this.name,

        event,

        paymentId:
          data?.data?.object?.id ??
          `mock_${Date.now()}`,

        status:
          event.includes('succeeded')
          ? 'paid'
          : 'pending',

        paidAt:
          event.includes('succeeded')
          ? new Date().toISOString()
          : undefined,

        metadata:
          data?.data?.object?.metadata ?? {}

      };

    }



    try {


      const signature =
        headers['stripe-signature'];



      /**
       * Ativar quando webhook real estiver pronto.
       *
       * this.stripe.webhooks.constructEvent(...)
       */


      logger.info(
        '[Stripe] Webhook recebido.'
      );



      return {

        provider:this.name,

        event:
          data?.type ??
          'unknown',

        paymentId:
          data?.data?.object?.id ??
          'unknown',

        status:'paid',

        paidAt:
          new Date().toISOString(),

        metadata:
          data?.data?.object?.metadata ?? {}

      };


    } catch(error){


      logger.error(
        '[Stripe] Erro webhook:',
        error
      );


      throw error;

    }

  }





  async getHealth():
  Promise<{
    status:'ok'|'error';
    message:string
  }> {


    if(!this.enabled){

      return {

        status:'ok',

        message:
          'Stripe desativado (mock mode)'
      };

    }



    if(!this.initialized){

      return {

        status:'error',

        message:
          'Stripe não inicializado'
      };

    }



    return {

      status:'ok',

      message:
        'Stripe conectado'

    };

  }

}