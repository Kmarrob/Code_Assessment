// backend/src/utils/emailTemplates.ts

interface ReviewRequestEmailData {
  userName: string;
  controlName: string;
  controlId: string;
  justification: string;
  repName: string;
  reviewId: string;
  link: string;
}

interface ReviewStatusEmailData {
  userName: string;
  controlName: string;
  controlId: string;
  status: 'approved' | 'rejected';
  repName: string;
  justification?: string;
  link: string;
}

export const emailTemplates = {
  /**
   * Template para notificar o usuário sobre uma solicitação de revisão
   */
  reviewRequested: (data: ReviewRequestEmailData): string => {
    const statusLabel = 'Pendente de Revisão';
    const statusColor = '#f59e0b';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .status { display: inline-block; background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
          .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
          .badge { display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Code_Assessment</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">Sistema de Avaliação de Maturidade ISO 27001</p>
          </div>
          <div class="content">
            <h2 style="margin-top: 0;">📋 Solicitação de Revisão</h2>
            
            <p>Olá, <strong>${data.userName}</strong>!</p>
            
            <p>O preposto <strong>${data.repName}</strong> solicitou uma revisão da sua resposta para o controle:</p>
            
            <p style="background: #f3f4f6; padding: 12px; border-radius: 6px;">
              <strong>${data.controlId}</strong> - ${data.controlName}
            </p>
            
            <p><strong>Justificativa:</strong></p>
            <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-style: italic;">
              "${data.justification}"
            </p>
            
            <p style="margin-top: 20px;">
              <span class="status">${statusLabel}</span>
            </p>
            
            <p>
              <a href="${data.link}" class="btn">🔍 Visualizar Solicitação</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>ID da Solicitação:</strong> <span class="badge">${data.reviewId}</span>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
              Por favor, acesse o sistema para revisar sua resposta e realizar as alterações necessárias.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Code_Assessment - Todos os direitos reservados</p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Template para notificar o preposto sobre a conclusão da revisão
   */
  reviewCompleted: (data: ReviewStatusEmailData): string => {
    const isApproved = data.status === 'approved';
    const statusLabel = isApproved ? 'Aprovado' : 'Rejeitado';
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusIcon = isApproved ? '✅' : '❌';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .status { display: inline-block; background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
          .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
          .badge { display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Code_Assessment</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">Sistema de Avaliação de Maturidade ISO 27001</p>
          </div>
          <div class="content">
            <h2 style="margin-top: 0;">${statusIcon} Revisão ${statusLabel}</h2>
            
            <p>Olá, <strong>${data.repName}</strong>!</p>
            
            <p>O usuário <strong>${data.userName}</strong> respondeu à solicitação de revisão para o controle:</p>
            
            <p style="background: #f3f4f6; padding: 12px; border-radius: 6px;">
              <strong>${data.controlId}</strong> - ${data.controlName}
            </p>
            
            <p style="margin-top: 20px;">
              <span class="status">${statusLabel}</span>
            </p>
            
            ${data.justification ? `
              <p><strong>Justificativa do usuário:</strong></p>
              <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-style: italic;">
                "${data.justification}"
              </p>
            ` : ''}
            
            <p>
              <a href="${data.link}" class="btn">🔍 Visualizar Resposta</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Status:</strong> ${statusLabel}
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
              Acesse o sistema para visualizar a resposta completa e, se necessário, solicitar uma nova revisão.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Code_Assessment - Todos os direitos reservados</p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
};