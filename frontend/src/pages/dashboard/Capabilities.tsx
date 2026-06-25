// frontend/src/pages/dashboard/Capabilities.tsx
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../../components/dashboard/DashboardPageWrapper.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
import { RadarChart } from '../../components/dashboard/RadarChart.js';
import { DashboardData } from '../../services/dashboard.service.js';
import { 
  AlertTriangle, CheckCircle, Info, X, Lightbulb, Target, Clock, 
  ClipboardList, ChevronRight, BookOpen, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// CAPABILITIES GUIDE - DADOS DA CARTILHA
// ============================================

const CAPABILITIES_GUIDE_DATA = {
  title: '📘 Guia de Interpretação - Capacidades Operacionais',
  description: 'Entenda como analisar e agir sobre os dados de maturidade das capacidades operacionais da sua organização.',
  sections: [
    {
      id: 'introduction',
      title: '🎯 O que são Capacidades Operacionais?',
      content: [
        'As Capacidades Operacionais analisam os controles da ISO 27001:2022 sob a perspectiva dos recursos operacionais de segurança da informação da organização.',
        'Diferente de outras visões (como domínios ou categorias), esta abordagem oferece uma visão prática e acionável dos controles, permitindo que o preposto identifique exatamente onde estão as lacunas e quais ações tomar.'
      ]
    },
    {
      id: 'domains',
      title: '📋 Os 15 Domínios de Capacidades Operacionais',
      content: [
        'As 15 capacidades operacionais foram extraídas da norma ISO/IEC 27002:2022 e representam as áreas-chave que uma organização deve desenvolver para manter um SGSI (Sistema de Gestão de Segurança da Informação) eficaz.',
        'Cada capacidade agrupa controles relacionados que, juntos, formam uma competência operacional essencial.'
      ],
      table: {
        headers: ['#', 'Capacidade', 'Descrição', 'Controles Associados'],
        rows: [
          ['1', 'Governança', 'Estrutura de liderança, políticas e responsabilidades para a SI', '5.1, 5.2, 5.3, 5.4, 5.8'],
          ['2', 'Gestão de ativos', 'Inventário, classificação e proteção de ativos de informação', '5.9, 5.10, 5.11, 5.14, 7.9, 7.10, 8.1'],
          ['3', 'Proteção da informação', 'Medidas para garantir confidencialidade, integridade e disponibilidade', '5.12, 5.13, 6.6, 6.7, 8.10, 8.11, 8.12, 8.33, 8.34'],
          ['4', 'Gestão de identidade e acesso', 'Controle de quem acessa o quê e quando', '5.15, 5.16, 5.17, 5.18, 8.2, 8.3, 8.4, 8.5'],
          ['5', 'Segurança nas relações com fornecedores', 'Gestão de riscos de SI em parcerias e contratos', '5.19, 5.20, 5.21, 5.22, 5.23, 6.6'],
          ['6', 'Gestão de eventos de SI', 'Monitoramento, detecção e resposta a incidentes', '5.24, 5.25, 5.26, 5.27, 5.28'],
          ['7', 'Gestão de ameaças e vulnerabilidades', 'Identificação e tratamento de riscos de SI', '5.7, 8.8'],
          ['8', 'Gestão de continuidade do negócio', 'Planos para manter operações durante crises', '5.29, 5.30, 8.6, 8.13, 8.14'],
          ['9', 'Segurança física', 'Proteção de instalações e equipamentos', '7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 7.13, 7.14, 8.1'],
          ['10', 'Desenvolvimento seguro', 'Práticas de segurança no ciclo de vida do software', '8.25, 8.26, 8.27, 8.28, 8.29, 8.30, 8.31'],
          ['11', 'Gestão de redes', 'Segurança de infraestrutura de rede e sistemas', '6.7, 8.18, 8.19, 8.20, 8.21, 8.22, 8.23, 8.31, 8.32, 8.34'],
          ['12', 'Monitoramento e análise', 'Observação contínua de sistemas e atividades', '8.16, 8.15, 8.17'],
          ['13', 'Gestão de pessoas', 'Treinamento, conscientização e disciplina em SI', '6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8'],
          ['14', 'Gestão de criptografia', 'Uso seguro de criptografia e chaves', '8.24'],
          ['15', 'Garantia de SI', 'Auditoria, conformidade e melhoria contínua', '5.22, 5.35, 5.36, 8.29']
        ]
      }
    },
    {
      id: 'interpretation',
      title: '📊 Como Interpretar os Dados',
      content: [
        'A tabela principal mostra, para cada capacidade, a quantidade de controles associados e seu status de implementação.',
        'O percentual de aderência é calculado como: (Controles Implementados / Total de Controles) × 100.',
        'O percentual de Não Aderente é: ((Parciais + Não Implementados) / Total) × 100.',
        'O "Total Controles" na linha de rodapé corresponde ao somatório de todas as capacidades, considerando que um mesmo controle pode aparecer em mais de uma capacidade (pois pode ter múltiplos atributos).'
      ]
    },
    {
      id: 'attention',
      title: '⚠️ Cards de Pontos de Atenção',
      content: [
        'Os cards de "Pontos de Atenção" destacam capacidades com aderência abaixo de 50%.',
        'Cada card mostra:',
        '• Diagnóstico: situação atual da capacidade',
        '• Métricas interativas: clique nos números para ver a lista de controles específicos',
        '• Barra de progresso: visualização da aderência'
      ],
      actionItems: [
        '✅ Implementados: Controles com nível de maturidade 2 (totalmente implementados)',
        '🔄 Parciais: Controles com nível 1 (parcialmente implementados) - revisar e completar',
        '❌ Não Implementados: Controles com nível 0 - priorizar implementação'
      ]
    },
    {
      id: 'actions',
      title: '🎯 Ações Recomendadas por Cenário',
      content: [
        'Com base nos dados, você pode tomar as seguintes ações:'
      ],
      scenarios: [
        {
          condition: 'aderente === 0',
          title: '🔴 Nenhum controle implementado',
          action: 'Ação imediata necessária. Realizar diagnóstico completo e elaborar plano de ação prioritário.'
        },
        {
          condition: 'aderente < 25',
          title: '🟠 Aderência crítica',
          action: 'Priorizar a implementação. Identificar controles mais simples e estabelecer metas de curto prazo.'
        },
        {
          condition: 'aderente < 50',
          title: '🟡 Aderência abaixo do esperado',
          action: 'Revisar controles parciais e não implementados. Alocar recursos para acelerar a implementação.'
        },
        {
          condition: 'aderente >= 50',
          title: '🟢 Aderência adequada',
          action: 'Manter monitoramento. Continuar melhorando controles parciais.'
        }
      ]
    },
    {
      id: 'controls',
      title: '🔗 Como Relacionar com os Controles',
      content: [
        'Clique nos números (Implementados, Parciais ou Não Implementados) dentro de cada card para abrir a lista de controles específicos daquela capacidade.',
        'No modal de lista, você verá o ID, nome e status de cada controle.',
        'Use esta lista para identificar quais controles precisam de atenção e iniciar as ações corretivas.'
      ]
    }
  ]
};

// ============================================
// COMPONENTE DA CARTILHA (CORRIGIDO)
// ============================================

interface CapabilitiesGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CapabilitiesGuide: React.FC<CapabilitiesGuideProps> = ({ isOpen, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handlePrint = () => {
    if (contentRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const userName = user?.name || 'Usuário não identificado';
        const userEmail = user?.email || 'email@nao.informado';
        const printDate = new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        printWindow.document.write(`
          <html>
            <head>
              <title>Guia - Capacidades Operacionais</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Inter', 'Segoe UI', sans-serif; 
                  padding: 40px; 
                  max-width: 1000px; 
                  margin: 0 auto; 
                  color: #1e293b; 
                  line-height: 1.6;
                  background: #ffffff;
                }
                /* Cabeçalho */
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 3px solid #2563eb;
                  padding-bottom: 16px;
                  margin-bottom: 24px;
                }
                .header-left {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                .header-left .logo {
                  font-size: 24px;
                  font-weight: 800;
                  color: #0f172a;
                  letter-spacing: -0.5px;
                }
                .header-left .logo span {
                  color: #2563eb;
                }
                .header-left .version {
                  font-size: 11px;
                  color: #94a3b8;
                  background: #f1f5f9;
                  padding: 2px 10px;
                  border-radius: 12px;
                  font-weight: 500;
                }
                .header-right {
                  text-align: right;
                  font-size: 12px;
                  color: #64748b;
                }
                .header-right .user-name {
                  font-weight: 600;
                  color: #1e293b;
                }
                .header-right .print-date {
                  font-size: 11px;
                  color: #94a3b8;
                }
                /* Conteúdo */
                h1 { font-size: 28px; color: #0f172a; margin-bottom: 8px; }
                .subtitle { font-size: 16px; color: #64748b; margin-bottom: 24px; }
                h2 { font-size: 22px; color: #1e293b; margin-top: 32px; margin-bottom: 12px; }
                h3 { font-size: 18px; color: #334155; margin-top: 24px; margin-bottom: 10px; }
                p { margin-bottom: 8px; font-size: 14px; color: #334155; }
                .description-box {
                  background: #eff6ff;
                  border-left: 4px solid #2563eb;
                  padding: 16px 20px;
                  border-radius: 8px;
                  margin-bottom: 24px;
                }
                .description-box p {
                  color: #1e40af;
                  font-weight: 500;
                  margin: 0;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 16px 0 24px 0; 
                  font-size: 13px; 
                }
                th { 
                  background: #f1f5f9; 
                  text-align: left; 
                  padding: 10px 12px; 
                  border: 1px solid #e2e8f0;
                  font-weight: 600;
                  color: #1e293b;
                }
                td { 
                  padding: 8px 12px; 
                  border: 1px solid #e2e8f0;
                  color: #334155;
                }
                tr:nth-child(even) { background: #f8fafc; }
                .badge { 
                  display: inline-block; 
                  padding: 2px 10px; 
                  border-radius: 12px; 
                  font-size: 11px; 
                  font-weight: 600; 
                }
                .badge-red { background: #fee2e2; color: #dc2626; }
                .badge-orange { background: #ffedd5; color: #ea580c; }
                .badge-yellow { background: #fef9c3; color: #ca8a04; }
                .badge-green { background: #dcfce7; color: #16a34a; }
                .scenarios-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 12px;
                  margin: 12px 0 20px 0;
                }
                .scenario-card {
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  padding: 12px 16px;
                  background: #f8fafc;
                }
                .scenario-card .title {
                  font-weight: 600;
                  font-size: 14px;
                  color: #1e293b;
                }
                .scenario-card .action {
                  font-size: 12px;
                  color: #64748b;
                  margin-top: 4px;
                }
                .action-list { list-style: none; padding: 0; margin: 8px 0 16px 0; }
                .action-list li { 
                  padding: 4px 0; 
                  font-size: 13px; 
                  color: #334155;
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                }
                .action-list li::before { content: "•"; color: #2563eb; font-weight: bold; }
                .footer {
                  border-top: 2px solid #e2e8f0;
                  padding-top: 16px;
                  margin-top: 32px;
                  display: flex;
                  justify-content: space-between;
                  font-size: 11px;
                  color: #94a3b8;
                }
                @media print {
                  body { padding: 20px; }
                  .no-print { display: none; }
                  .scenarios-grid { break-inside: avoid; }
                  table { break-inside: auto; }
                  tr { break-inside: avoid; }
                }
                @media (max-width: 768px) {
                  .scenarios-grid { grid-template-columns: 1fr; }
                  .header { flex-direction: column; align-items: flex-start; gap: 8px; }
                  .header-right { text-align: left; width: 100%; }
                }
              </style>
            </head>
            <body>
              <!-- CABEÇALHO COM METADADOS -->
              <div class="header">
                <div class="header-left">
                  <div class="logo">Code<span>_Assessment</span></div>
                  <span class="version">v1.0</span>
                </div>
                <div class="header-right">
                  <div>Impresso por: <span class="user-name">${userName}</span></div>
                  <div class="print-date">${userEmail} • ${printDate}</div>
                </div>
              </div>

              <!-- CONTEÚDO PRINCIPAL -->
              ${contentRef.current.innerHTML}

              <!-- RODAPÉ -->
              <div class="footer">
                <span>ISO/IEC 27001:2022 · Análise de Capacidades Operacionais</span>
                <span>Página 1 de 1</span>
              </div>

              <script>
                window.onload = function() { 
                  window.print(); 
                };
              <\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{CAPABILITIES_GUIDE_DATA.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Imprimir / Baixar PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)]" ref={contentRef}>
          <div className="prose prose-sm max-w-none">
            {/* Descrição */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm font-medium">{CAPABILITIES_GUIDE_DATA.description}</p>
            </div>

            {/* Seções (mantidas) */}
            {CAPABILITIES_GUIDE_DATA.sections.map((section) => (
              <div key={section.id} className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h3>
                {section.content && (
                  <div className="space-y-2">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-sm text-gray-700 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                )}

                {/* Tabela de Domínios */}
                {section.table && (
                  <div className="overflow-x-auto mt-3 border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {section.table.headers.map((h, idx) => (
                            <th key={idx} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {section.table.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-3 py-2 text-gray-700">
                                {cellIdx === 1 ? <span className="font-medium">{cell}</span> : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Cenários de Ação */}
                {section.scenarios && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {section.scenarios.map((scenario, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-800">{scenario.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{scenario.action}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Itens de Ação */}
                {section.actionItems && (
                  <ul className="space-y-1 mt-3">
                    {section.actionItems.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// CONFIGURAÇÕES EXISTENTES (MANTIDAS)
// ============================================

const CAPABILITIES = [
  { key: 'Governança', label: 'Governança', altKeys: ['Governança', 'Governança_e_ecossistema'] },
  { key: 'Gestão de ativos', label: 'Gestão de Ativos', altKeys: ['Gestão de ativos', 'Gestão_de_ativos'] },
  { key: 'Proteção da informação', label: 'Proteção da Informação', altKeys: ['Proteção da informação', 'Proteção_da_informação'] },
  { key: 'Gestão de identidade e acesso', label: 'Gestão de Identidade e Acesso', altKeys: ['Gestão de identidade e acesso', 'Gestão_de_identidade_e_acesso'] },
  { key: 'Segurança nas relações com fornecedores', label: 'Relações com Fornecedores', altKeys: ['Segurança nas relações com fornecedores', 'Segurança_nas_relações_com_fornecedores'] },
  { key: 'Gestão de evento de segurança da informação', label: 'Gestão de Eventos de SI', altKeys: ['Gestão de incidentes', 'Gestão de eventos de SI', 'Gestão_de_evento_de_segurança_da_informação'] },
  { key: 'Gestão de ameaças e vulnerabilidades', label: 'Ameaças e Vulnerabilidades', altKeys: ['Gestão de ameaças e vulnerabilidades', 'Gestão_de_ameaças_e_vulnerabilidades'] },
  { key: 'Gestão de continuidade do negócio', label: 'Continuidade', altKeys: ['Gestão de continuidade', 'Continuidade', 'Gestão_de_continuidade_do_negócio'] },
  { key: 'Segurança física', label: 'Segurança Física', altKeys: ['Segurança física', 'Segurança_física'] },
  { key: 'Desenvolvimento seguro', label: 'Desenvolvimento Seguro', altKeys: ['Desenvolvimento seguro', 'Segurança de aplicações', 'Segurança_de_aplicações'] },
  { key: 'Gestão de redes', label: 'Segurança de Sistemas e Rede', altKeys: ['Gestão de redes', 'Segurança de sistemas e rede', 'Segurança_de_sistemas_e_rede', 'Segurança de sistemas'] },
  { key: 'Monitoramento e análise', label: 'Monitoramento e Análise', altKeys: ['Monitoramento e análise', 'Monitoramento_e_análise'] },
  { key: 'Gestão de pessoas', label: 'Segurança em Recursos Humanos', altKeys: ['Gestão de pessoas', 'Segurança em recursos humanos', 'Segurança_em_recursos_humanos'] },
  { key: 'Gestão de criptografia', label: 'Gestão de Criptografia', altKeys: ['Gestão de criptografia', 'Gestão_de_criptografia'] },
  { key: 'Garantia de segurança da informação', label: 'Garantia de SI', altKeys: ['Garantia de SI', 'Garantia de segurança da informação', 'Garantia_de_segurança_da_informação'] },
  { key: 'Configuração segura', label: 'Configuração Segura', altKeys: ['Configuração segura', 'Configuração_segura'] },
  { key: 'Legal e compliance', label: 'Legal e Compliance', altKeys: ['Legal e compliance', 'Leis e compliance', 'Legal_e_compliance'] }
].filter((v, i, a) => a.findIndex(t => t.key === v.key) === i).slice(0, 15);

const RADAR_COLORS = {
  Implementado: '#10b981',
  Recomendado: '#94a3b8',
};

// ============================================
// COMPONENTE PRINCIPAL (MANTIDO)
// ============================================

const CapabilitiesContent: React.FC<{ data: DashboardData }> = ({ data }) => {
  const [selectedCapability, setSelectedCapability] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  const [listModal, setListModal] = useState<{
    isOpen: boolean;
    title: string;
    controls: any[];
    status: string;
    capKey: string;
  }>({
    isOpen: false,
    title: '',
    controls: [],
    status: '',
    capKey: '',
  });

  const controls = data?.controls || [];

  const capData = CAPABILITIES.map(cap => {
    const filtered = controls.filter(c => {
      const control = c.control || c;
      const capacidades = control?.capacidadesOperacionais || [];
      if (Array.isArray(capacidades)) {
        const allKeys = [cap.key, ...(cap.altKeys || [])];
        return capacidades.some((c: string) => {
          const cleanC = c.replace(/#/g, '').trim();
          return allKeys.includes(cleanC) || allKeys.map(k => k.replace(/ /g, '_')).includes(cleanC);
        });
      }
      return capacidades === cap.key;
    });
    const total = filtered.length;
    const implemented = filtered.filter(c => c.status === 'Implementado').length;
    const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
    const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
    const { na = 0 } = filtered.reduce((acc, c) => c.status === 'Não se aplica' ? { na: acc.na + 1 } : acc, { na: 0 });
    const totalValidos = total - na;
    const aderente = totalValidos > 0 ? Math.round((implemented / totalValidos) * 100) : 0;
    const naoAderente = totalValidos > 0 ? Math.round(((partial + notImpl) / totalValidos) * 100) : 0;
    
    console.log(`🔍 Capabilities - ${cap.key}: total=${total}, impl=${implemented}, partial=${partial}, not=${notImpl}`);
    
    return {
      name: cap.label,
      key: cap.key,
      total: totalValidos,
      implemented,
      partial,
      notImpl,
      aderente,
      naoAderente,
    };
  });

  const totals = capData.reduce((acc, c) => ({
    implemented: acc.implemented + c.implemented,
    partial: acc.partial + c.partial,
    notImpl: acc.notImpl + c.notImpl,
    total: acc.total + c.total,
  }), { implemented: 0, partial: 0, notImpl: 0, total: 0 });

  const totalAderente = totals.total > 0 ? Math.round((totals.implemented / totals.total) * 100) : 0;
  const totalNaoAderente = totals.total > 0 ? Math.round(((totals.partial + totals.notImpl) / totals.total) * 100) : 0;

  const radarData = capData.map(c => ({
    subject: c.name.length > 28 ? c.name.substring(0, 28) + '…' : c.name,
    fullLabel: c.name,
    Implementado: c.aderente,
    Recomendado: 100,
  }));

  const attentionPoints = capData.filter(c => c.aderente < 50).sort((a, b) => a.aderente - b.aderente);

  const columns = [
    { key: 'name', label: 'Capacidades Operacionais' },
    { key: 'notImpl', label: 'Não Impl.', align: 'center' as const },
    { key: 'partial', label: 'Parcial', align: 'center' as const },
    { key: 'implemented', label: 'Implementados', align: 'center' as const },
    { key: 'total', label: 'Total', align: 'center' as const },
    { 
      key: 'aderente', 
      label: 'Aderente', 
      align: 'center' as const,
      format: (v: number) => (
        <span className={`font-bold ${v >= 70 ? 'text-emerald-400' : v >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
          {v}%
        </span>
      )
    },
    { 
      key: 'naoAderente', 
      label: 'Não aderente', 
      align: 'center' as const,
      format: (v: number) => <span className="text-red-400 font-medium">{v}%</span>
    },
  ];

  const handleCardClick = (cap: any) => {
    setSelectedCapability(cap);
    setIsModalOpen(true);
  };

  const openControlList = (capKey: string, status: string, statusLabel: string) => {
    const capability = capData.find(c => c.key === capKey);
    const capConfig = CAPABILITIES.find(c => c.key === capKey);
    const allKeys = capConfig ? [capConfig.key, ...(capConfig.altKeys || [])] : [capKey];
    
    const filtered = controls.filter(c => {
      const control = c.control || c;
      const capacidades = control?.capacidadesOperacionais || [];
      const hasCapability = Array.isArray(capacidades) 
        ? capacidades.some((capStr: string) => {
            const cleanStr = capStr.replace(/#/g, '').trim();
            return allKeys.includes(cleanStr) || allKeys.map(k => k.replace(/ /g, '_')).includes(cleanStr);
          })
        : allKeys.includes(capacidades.replace(/#/g, '').trim());
      return hasCapability && c.status === status;
    });
    
    setListModal({
      isOpen: true,
      title: `${statusLabel} - ${capability?.name || capKey}`,
      controls: filtered,
      status: status,
      capKey: capKey,
    });
  };

  const getRecommendations = (cap: any): string[] => {
    const recommendations: string[] = [];
    
    if (cap.aderente === 0) {
      recommendations.push('Nenhum controle implementado. Ação imediata necessária.');
      recommendations.push('Realizar diagnóstico completo da capacidade.');
      recommendations.push('Elaborar plano de ação prioritário.');
    } else if (cap.aderente < 25) {
      recommendations.push('Aderência crítica. Priorize a implementação.');
      recommendations.push('Identificar controles mais simples de implementar.');
      recommendations.push('Estabelecer metas de curto prazo.');
    } else if (cap.aderente < 50) {
      recommendations.push('Aderência abaixo do esperado.');
      recommendations.push('Revisar os controles parciais e não implementados.');
      recommendations.push('Alocar recursos para acelerar a implementação.');
    }
    
    if (cap.partial > 0) {
      recommendations.push(`${cap.partial} controle(s) parcial(is) - revisar e completar.`);
    }
    
    if (cap.notImpl > 0) {
      recommendations.push(`${cap.notImpl} controle(s) não implementado(s) - priorizar.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Capacidade em conformidade. Manter monitoramento.');
    }
    
    return recommendations;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header com Botão da Cartilha */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacidades Operacionais</h1>
          <p className="text-sm text-gray-500 mt-1">
            Análise das 15 capacidades ISO/IEC 27002:2022 com percentual de aderência
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* NOVO BOTÃO: CARTILHA */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">📘 Guia de Interpretação</span>
          </button>
          
          <div className="relative group">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Metodologia de cálculo"
              title="Clique para ver a metodologia"
            >
              <Info className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">📊 Metodologia de Cálculo</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>Aderente:</strong> (Implementados / Total) × 100</li>
                <li>• <strong>Não Aderente:</strong> ((Parciais + Não Implementados) / Total) × 100</li>
                <li>• <strong>Implementado:</strong> Nível de maturidade <strong>2</strong></li>
                <li>• <strong>Parcial:</strong> Nível de maturidade <strong>1</strong></li>
                <li>• <strong>Não Implementado:</strong> Nível de maturidade <strong>0</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-blue-600">{totalAderente}%</div>
          <p className="text-xs text-gray-500">Aderência Global</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-red-400">{totalNaoAderente}%</div>
          <p className="text-xs text-gray-500">Não Aderente</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{totals.total}</div>
          <p className="text-xs text-gray-500">Total de Controles</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-amber-400">{attentionPoints.length}</div>
          <p className="text-xs text-gray-500">Pontos de Atenção</p>
        </div>
      </div>

      {/* DataTable */}
      <DataTable 
        data={capData} 
        columns={columns}
        footer={
          <>
            <td className="px-4 py-3 text-gray-900 font-bold">Total</td>
            <td className="px-3 py-3 text-center text-red-400 font-bold">{totals.notImpl}</td>
            <td className="px-3 py-3 text-center text-amber-400 font-bold">{totals.partial}</td>
            <td className="px-3 py-3 text-center text-emerald-400 font-bold">{totals.implemented}</td>
            <td className="px-3 py-3 text-center text-gray-900 font-bold">{totals.total}</td>
            <td className="px-3 py-3 text-center text-blue-600 font-bold">{totalAderente}%</td>
            <td className="px-3 py-3 text-center text-red-400 font-bold">{totalNaoAderente}%</td>
          </>
        }
      />

      {/* Radar Chart */}
      <RadarChart
        data={radarData}
        title="Radar de Capacidades Operacionais"
        subtitle="Comparação entre o nível implementado e o recomendado (100%) por capacidade"
        height={520}
        colors={RADAR_COLORS}
      />

      {/* Pontos de Atenção */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-gray-900">📋 Plano de Ação Prioritário</h3>
          <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            {attentionPoints.length} capacidades em estado crítico
          </span>
        </div>

        {attentionPoints.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 rounded-lg p-4">
            <CheckCircle className="w-5 h-5" />
            <span>Todas as capacidades operacionais estão com aderência acima de 50%.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {attentionPoints.map((cap, index) => {
              const isCritical = cap.aderente === 0;
              const isHigh = cap.aderente > 0 && cap.aderente < 25;
              const severity = isCritical ? 'critical' : isHigh ? 'high' : 'medium';
              
              const colors = {
                critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-500' },
                high: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-500' },
                medium: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-500' },
              };

              return (
                <motion.div
                  key={cap.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-lg border-2 ${colors[severity].border} ${colors[severity].bg} p-5 hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleCardClick(cap)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[severity].badge}`} />
                        <h4 className="text-sm font-bold text-gray-900">{cap.name}</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 text-gray-700`}>
                          {cap.aderente}% de aderência
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Diagnóstico:</span> 
                        {' '}{cap.implemented} implementados, {cap.partial} parciais, {cap.notImpl} não implementados
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs bg-white/60 px-2 py-1.5 rounded-lg">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openControlList(cap.key, 'Implementado', 'Implementados');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
                        title="Ver controles implementados"
                      >
                        <span className="font-bold text-emerald-600">{cap.implemented}</span>
                        <span className="text-emerald-600">✅</span>
                      </button>
                      <div className="w-px h-4 bg-gray-300" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openControlList(cap.key, 'Parcialmente implementado', 'Parciais');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                        title="Ver controles parciais"
                      >
                        <span className="font-bold text-amber-600">{cap.partial}</span>
                        <span className="text-amber-600">🔄</span>
                      </button>
                      <div className="w-px h-4 bg-gray-300" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openControlList(cap.key, 'Não implementado', 'Não Implementados');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                        title="Ver controles não implementados"
                      >
                        <span className="font-bold text-red-500">{cap.notImpl}</span>
                        <span className="text-red-500">❌</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cap.aderente >= 70 ? 'bg-emerald-500' :
                          cap.aderente >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${cap.aderente}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Lista de Controles por Status */}
      <AnimatePresence>
        {listModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setListModal({ ...listModal, isOpen: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{listModal.title}</h3>
                  <p className="text-sm text-gray-500">{listModal.controls.length} controles encontrados</p>
                </div>
                <button
                  onClick={() => setListModal({ ...listModal, isOpen: false })}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {listModal.controls.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum controle encontrado com este status.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listModal.controls.map((item, idx) => {
                      const control = item.control || item;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                {control?.id || 'N/A'}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {control?.nome || 'Controle sem nome'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>
                                Status: {item.status === 'Implementado' ? '✅' : 
                                         item.status === 'Parcialmente implementado' ? '🔄' : '❌'}
                                {' '}{item.status}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setListModal({ ...listModal, isOpen: false })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Detalhes da Capacidade */}
      <AnimatePresence>
        {isModalOpen && selectedCapability && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCapability.name}</h3>
                  <p className="text-sm text-gray-500">Análise detalhada da capacidade</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedCapability.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{selectedCapability.implemented}</div>
                  <div className="text-xs text-gray-500">Implementados</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">{selectedCapability.partial}</div>
                  <div className="text-xs text-gray-500">Parciais</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedCapability.notImpl}</div>
                  <div className="text-xs text-gray-500">Não Impl.</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Aderência</span>
                  <span className={`text-sm font-bold ${selectedCapability.aderente >= 70 ? 'text-emerald-600' : selectedCapability.aderente >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {selectedCapability.aderente}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${selectedCapability.aderente >= 70 ? 'bg-emerald-500' : selectedCapability.aderente >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${selectedCapability.aderente}%` }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Recomendações</h4>
                </div>
                <ul className="space-y-2">
                  {getRecommendations(selectedCapability).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Próximos Passos</h4>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span>Priorizar controles com maior impacto para esta capacidade.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span>Revisar controles parciais para identificar gargalos.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span>Estabelecer metas de curto, médio e longo prazo.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal da Cartilha */}
      <AnimatePresence>
        {isGuideOpen && (
          <CapabilitiesGuide
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// EXPORTAÇÃO PRINCIPAL
// ============================================

export const Capabilities: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
  let companyId = paramCompanyId;
  
  if (!companyId && user) {
    const userAny = user as any;
    companyId = userAny.companyId || 
                userAny.company?._id || 
                userAny.company || 
                null;
    
    console.log('🔍 Capabilities - user:', user);
    console.log('🔍 Capabilities - companyId obtido:', companyId);
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">ID da empresa não informado</p>
          <p className="text-sm text-gray-500 mt-2">Faça logout e login novamente para atualizar seus dados.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      title="Capacidades Operacionais"
      subtitle="Análise das 15 capacidades ISO/IEC 27002:2022 com percentual de aderência"
      companyId={companyId}
    >
      {(data) => <CapabilitiesContent data={data} />}
    </DashboardPageWrapper>
  );
};