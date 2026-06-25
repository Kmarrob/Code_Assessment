// frontend/src/pages/dashboard/CyberConcepts.tsx
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../../components/dashboard/DashboardPageWrapper.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
import { PieChart } from '../../components/dashboard/PieChart.js';
import { BarChart } from '../../components/dashboard/BarChart.js';
import { DashboardData } from '../../services/dashboard.service.js';
import { Info, BookOpen, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// CYBERCONCEPTS GUIDE - DADOS DA CARTILHA
// ============================================

const CYBERCONCEPTS_GUIDE_DATA = {
  title: '📘 Guia de Interpretação - Conceitos de Segurança Cibernética',
  description: 'Entenda os 5 conceitos do NIST Cybersecurity Framework aplicados à ISO 27001.',
  sections: [
    {
      id: 'introduction',
      title: '🎯 O que são os Conceitos de Segurança Cibernética?',
      content: [
        'Os conceitos de segurança cibernética são baseados no NIST Cybersecurity Framework e foram incorporados à ISO/IEC 27002:2022.',
        'Eles representam as cinco funções principais que uma organização deve desempenhar para gerenciar riscos de segurança cibernética:',
        '• **Identificar:** Entender o contexto, ativos e riscos.',
        '• **Proteger:** Implementar salvaguardas para garantir a entrega de serviços.',
        '• **Detectar:** Identificar a ocorrência de eventos de segurança.',
        '• **Responder:** Tomar ações sobre um incidente detectado.',
        '• **Restaurar:** Manter planos de resiliência e recuperar capacidades.'
      ]
    },
    {
      id: 'definition',
      title: '📋 Definição dos Conceitos',
      content: [
        'Cada conceito representa uma função essencial na gestão de segurança cibernética:'
      ],
      table: {
        headers: ['Conceito', 'Função', 'Exemplo de Controle', 'Momento de Atuação'],
        rows: [
          ['Identificar', 'Conhecer os ativos e riscos', 'Inventário de ativos, Análise de riscos', 'Antes do evento'],
          ['Proteger', 'Implementar salvaguardas', 'Controle de acesso, Criptografia, Políticas', 'Durante a operação normal'],
          ['Detectar', 'Identificar eventos suspeitos', 'Monitoramento de logs, SIEM, Alarmes', 'Durante o evento'],
          ['Responder', 'Agir sobre incidentes', 'Plano de resposta a incidentes, Equipe de resposta', 'Imediatamente após o evento'],
          ['Restaurar', 'Recuperar operações normais', 'Backup, Plano de continuidade, Recuperação', 'Após o evento']
        ]
      }
    },
    {
      id: 'importance',
      title: '🎯 Por que esta Análise é Importante?',
      content: [
        'Os cinco conceitos formam um ciclo contínuo de melhoria da segurança cibernética:',
        '1. **Identificar** → 2. **Proteger** → 3. **Detectar** → 4. **Responder** → 5. **Restaurar** → (volta ao passo 1)',
        'Uma organização com boa maturidade deve ter controles implementados em todas as cinco funções.',
        'A ausência ou baixa implementação em uma das funções pode indicar uma vulnerabilidade crítica.'
      ]
    },
    {
      id: 'actions',
      title: '🎯 Ações Recomendadas por Conceito',
      content: [
        'Com base nos dados de implementação, você pode tomar as seguintes ações:'
      ],
      scenarios: [
        {
          condition: 'Identificar < 50%',
          title: '🔴 Baixa implementação em Identificar',
          action: 'Priorize a realização de inventário de ativos e análise de riscos. Sem entender o que precisa ser protegido, os demais conceitos ficam comprometidos.'
        },
        {
          condition: 'Proteger < 50%',
          title: '🟠 Baixa implementação em Proteger',
          action: 'Fortalecer controles de acesso, criptografia e políticas de segurança. Esta é a camada mais crítica de defesa.'
        },
        {
          condition: 'Detectar < 50%',
          title: '🟡 Baixa implementação em Detectar',
          action: 'Investir em monitoramento, logs e sistemas de detecção. Quanto mais rápido um incidente é detectado, menor o dano.'
        },
        {
          condition: 'Responder < 50%',
          title: '🟠 Baixa implementação em Responder',
          action: 'Revisar e testar o plano de resposta a incidentes. A preparação é fundamental para uma resposta eficaz.'
        },
        {
          condition: 'Restaurar < 50%',
          title: '🟡 Baixa implementação em Restaurar',
          action: 'Fortalecer backups e planos de continuidade. A capacidade de recuperação determina o tempo de inatividade após um incidente.'
        }
      ]
    }
  ]
};

// ============================================
// COMPONENTE DA CARTILHA
// ============================================

interface CyberConceptsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CyberConceptsGuide: React.FC<CyberConceptsGuideProps> = ({ isOpen, onClose }) => {
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
              <title>Guia - Conceitos de Segurança Cibernética</title>
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
                .header-left .logo span { color: #2563eb; }
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
                .header-right .user-name { font-weight: 600; color: #1e293b; }
                .header-right .print-date { font-size: 11px; color: #94a3b8; }
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
                .description-box p { color: #1e40af; font-weight: 500; margin: 0; }
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
                .scenario-card .title { font-weight: 600; font-size: 14px; color: #1e293b; }
                .scenario-card .action { font-size: 12px; color: #64748b; margin-top: 4px; }
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
              ${contentRef.current.innerHTML}
              <div class="footer">
                <span>ISO/IEC 27001:2022 · Análise de Conceitos de Segurança Cibernética</span>
                <span>Página 1 de 1</span>
              </div>
              <script>window.onload = function() { window.print(); };</script>
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{CYBERCONCEPTS_GUIDE_DATA.title}</h2>
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

        <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)]" ref={contentRef}>
          <div className="prose prose-sm max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm font-medium">{CYBERCONCEPTS_GUIDE_DATA.description}</p>
            </div>

            {CYBERCONCEPTS_GUIDE_DATA.sections.map((section) => (
              <div key={section.id} className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h3>
                {section.content && (
                  <div className="space-y-2">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-sm text-gray-700 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                )}

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
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const CONCEPTS = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'];
const STATUS_COLORS = {
  'Implementado': 'hsl(142,70%,45%)',
  'Parcialmente implementado': 'hsl(38,92%,50%)',
  'Não implementado': 'hsl(0,72%,51%)',
  'Não se aplica': 'hsl(215,20%,55%)',
};

const CyberConceptsContent: React.FC<{ data: DashboardData }> = ({ data }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  console.log('🔍 CyberConcepts - data recebido:', data);
  console.log('🔍 CyberConcepts - controls:', data?.controls);

  const controls = data?.controls || [];

  const conceptData = CONCEPTS.map(concept => {
    const filtered = controls.filter(c => {
      const control = c.control || c;
      const conceitos = control?.conceitoDeSegurancaCibernetica || [];
      if (Array.isArray(conceitos)) {
        return conceitos.includes(concept);
      }
      return conceitos === concept;
    });
    const total = filtered.length;
    const implemented = filtered.filter(c => c.status === 'Implementado').length;
    const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
    const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
    const na = filtered.filter(c => c.status === 'Não se aplica').length;
    
    console.log(`🔍 CyberConcepts - ${concept}: total=${total}, impl=${implemented}, partial=${partial}, not=${notImpl}, na=${na}`);
    
    return {
      name: concept,
      total,
      implemented,
      partial,
      notImpl,
      na,
      pImpl: total > 0 ? Math.round((implemented / total) * 100) : 0,
      pPartial: total > 0 ? Math.round((partial / total) * 100) : 0,
      pNot: total > 0 ? Math.round((notImpl / total) * 100) : 0,
      pNa: total > 0 ? Math.round((na / total) * 100) : 0,
    };
  });

  const totals = conceptData.reduce((acc, c) => ({
    implemented: acc.implemented + c.implemented,
    partial: acc.partial + c.partial,
    notImpl: acc.notImpl + c.notImpl,
    na: acc.na + c.na,
    total: acc.total + c.total,
  }), { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 });

  const columns = [
    { key: 'name', label: 'Conceitos Cibernéticos' },
    { key: 'implemented', label: 'Implementados', align: 'center' as const },
    { key: 'partial', label: 'Parciais', align: 'center' as const },
    { key: 'notImpl', label: 'Não Implementados', align: 'center' as const },
    { key: 'na', label: 'Não se aplica', align: 'center' as const },
    { key: 'total', label: 'Total', align: 'center' as const },
    { 
      key: 'pImpl', 
      label: 'Implementados %', 
      align: 'center' as const,
      format: (v: number) => <span className="text-emerald-400 font-bold">{v}%</span>
    },
    { 
      key: 'pPartial', 
      label: 'Parcial %', 
      align: 'center' as const,
      format: (v: number) => <span className="text-amber-400">{v}%</span>
    },
    { 
      key: 'pNot', 
      label: 'Não Impl. %', 
      align: 'center' as const,
      format: (v: number) => <span className="text-red-400">{v}%</span>
    },
  ];

  const totalPieData = [
    { name: 'Implementado', value: totals.implemented, color: STATUS_COLORS['Implementado'] },
    { name: 'Parcial', value: totals.partial, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementado', value: totals.notImpl, color: STATUS_COLORS['Não implementado'] },
    { name: 'Não se aplica', value: totals.na, color: STATUS_COLORS['Não se aplica'] },
  ].filter(d => d.value > 0);

  const totalBarData = [
    { name: 'Implementados', value: totals.implemented, color: STATUS_COLORS['Implementado'] },
    { name: 'Parciais', value: totals.partial, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementados', value: totals.notImpl, color: STATUS_COLORS['Não implementado'] },
  ].filter(d => d.value > 0);

  return (
    <>
      {/* Header com Botão da Cartilha */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Análise por Conceitos Cibernéticos</h2>
          <p className="text-sm text-gray-500">Distribuição dos controles por conceito da ISO 27002</p>
        </div>
        <div className="flex items-center gap-3">
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
                <li>• <strong>Implementado:</strong> Nível de maturidade <strong>2</strong></li>
                <li>• <strong>Parcial:</strong> Nível de maturidade <strong>1</strong></li>
                <li>• <strong>Não Implementado:</strong> Nível de maturidade <strong>0</strong></li>
                <li>• <strong>Não se Aplica:</strong> Nível <strong>N/A</strong></li>
                <li>• <strong>Conceitos:</strong> Identificar, Proteger, Detectar, Responder, Restaurar</li>
                <li className="mt-2 text-gray-400 text-[10px] border-t border-gray-200 pt-2">
                  ⚠️ Um mesmo controle pode ser classificado em mais de um conceito. 
                  Por isso, a soma dos totais por conceito pode ser maior que o total de controles únicos (93).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Nota explicativa sobre dupla contagem */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-blue-700">
          <span className="font-medium">ℹ️ Sobre os totais:</span> 
          Um mesmo controle pode ser classificado em <strong>mais de um conceito</strong> 
          (Identificar, Proteger, Detectar, Responder ou Restaurar). 
          Por isso, a soma dos totais por conceito pode ser <strong>maior que o total de controles únicos (93)</strong>.
          Isso é esperado e reflete a natureza dos controles da ISO 27001.
        </p>
      </div>

      <DataTable 
        data={conceptData} 
        columns={columns}
        footer={
          <>
            <td className="px-4 py-3 text-gray-900 font-bold">Total</td>
            <td className="px-3 py-3 text-center text-emerald-400 font-bold">{totals.implemented}</td>
            <td className="px-3 py-3 text-center text-amber-400 font-bold">{totals.partial}</td>
            <td className="px-3 py-3 text-center text-red-400 font-bold">{totals.notImpl}</td>
            <td className="px-3 py-3 text-center text-gray-500">{totals.na}</td>
            <td className="px-3 py-3 text-center text-gray-900 font-bold">{totals.total}</td>
            <td className="px-3 py-3 text-center text-emerald-400 font-bold">{totals.total > 0 ? Math.round((totals.implemented/totals.total)*100) : 0}%</td>
            <td className="px-3 py-3 text-center text-amber-400">{totals.total > 0 ? Math.round((totals.partial/totals.total)*100) : 0}%</td>
            <td className="px-3 py-3 text-center text-red-400">{totals.total > 0 ? Math.round((totals.notImpl/totals.total)*100) : 0}%</td>
          </>
        }
      />

      {/* Gráficos Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <PieChart
          data={totalPieData}
          title="Distribuição por Status"
          subtitle={`${totals.total} controles analisados`}
        />
        <BarChart
          data={totalBarData}
          title="Contagem por Status"
          subtitle="Total absoluto de controles por status"
        />
      </div>

      {conceptData.map((row, index) => {
        const pieData = [
          { name: 'Implementado', value: row.implemented, color: STATUS_COLORS['Implementado'] },
          { name: 'Parcial', value: row.partial, color: STATUS_COLORS['Parcialmente implementado'] },
          { name: 'Não Implementado', value: row.notImpl, color: STATUS_COLORS['Não implementado'] },
          { name: 'Não se aplica', value: row.na, color: STATUS_COLORS['Não se aplica'] },
        ].filter(d => d.value > 0);

        const barData = [
          { name: 'Implementados', value: row.implemented, color: STATUS_COLORS['Implementado'] },
          { name: 'Parciais', value: row.partial, color: STATUS_COLORS['Parcialmente implementado'] },
          { name: 'Não Implementados', value: row.notImpl, color: STATUS_COLORS['Não implementado'] },
        ].filter(d => d.value > 0);

        return (
          <div key={row.name} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <PieChart
              data={pieData}
              title={`Gráficos — ${row.name}`}
              subtitle={`${row.total} controles · ${row.pImpl}% implementados · ${row.pPartial}% parciais · ${row.pNot}% não implementados`}
            />
            <BarChart
              data={barData}
              title="Quantidade por Status"
              subtitle={`Distribuição dos controles ${row.name}`}
            />
          </div>
        );
      })}

      {/* Modal da Cartilha */}
      <AnimatePresence>
        {isGuideOpen && (
          <CyberConceptsGuide
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const CyberConcepts: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
  let companyId = paramCompanyId;
  
  if (!companyId && user) {
    const userAny = user as any;
    companyId = userAny.companyId || 
                userAny.company?._id || 
                userAny.company || 
                null;
    
    console.log('🔍 CyberConcepts - user:', user);
    console.log('🔍 CyberConcepts - companyId obtido:', companyId);
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
      title="Conceitos de Segurança Cibernética"
      subtitle="Análise dos 5 conceitos cibernéticos da ISO/IEC 27002:2022"
      companyId={companyId}
    >
      {(data) => <CyberConceptsContent data={data} />}
    </DashboardPageWrapper>
  );
};