import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { db } from '../config/database.js';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { Control } from '../models/Control.js';
import { Question } from '../models/Question.js';
import { AuditProgram } from '../models/audit/models/AuditProgram.js';
import { AuditPlan } from '../models/audit/models/AuditPlan.js';
import { AuditSoA } from '../models/audit/models/AuditSoA.js';
import { AuditRisk } from '../models/audit/models/AuditRisk.js';
import { AuditChecklist } from '../models/audit/models/AuditChecklist.js';
import { AuditFinding } from '../models/audit/models/AuditFinding.js';
import { AuditDocumentReview } from '../models/audit/models/AuditDocumentReview.js';

// ============================================================
// DADOS DE EXEMPLO PARA O SEED
// ============================================================

// Setores/Áreas típicas para uma empresa de TI
const SECTOR_TEMPLATES = [
  {
    name: 'Direção',
    processes: ['Gestão Estratégica', 'Governança Corporativa'],
    importance: 'critical' as const,
    frequency: 'annual' as const,
  },
  {
    name: 'Desenvolvimento de Software',
    processes: ['Desenvolvimento', 'Manutenção', 'DevOps'],
    importance: 'critical' as const,
    frequency: 'semiannual' as const,
  },
  {
    name: 'Suporte ao Cliente',
    processes: ['Atendimento', 'Resolução de Problemas'],
    importance: 'critical' as const,
    frequency: 'semiannual' as const,
  },
  {
    name: 'Recursos Humanos',
    processes: ['Recrutamento', 'Treinamento', 'Folha de Pagamento'],
    importance: 'standard' as const,
    frequency: 'annual' as const,
  },
  {
    name: 'Vendas e Marketing',
    processes: ['Vendas', 'Marketing', 'CRM'],
    importance: 'standard' as const,
    frequency: 'annual' as const,
  },
  {
    name: 'Infraestrutura de TI',
    processes: ['Rede', 'Servidores', 'Segurança'],
    importance: 'critical' as const,
    frequency: 'quarterly' as const,
  },
];

// Riscos de exemplo
const RISK_TEMPLATES = [
  {
    description: 'Acesso não autorizado a dados sensíveis',
    eventOrAsset: 'Sistemas de produção',
    threat: 'Ataques cibernéticos, funcionários mal-intencionados',
    vulnerability: 'Senhas fracas, falta de MFA',
    existingControl: 'Política de senhas, firewall',
    riskClassification: 'Alto',
    treatment: 'mitigate' as const,
    treatmentPlan: 'Implementar MFA, revisar política de senhas',
  },
  {
    description: 'Perda de dados por falha de hardware',
    eventOrAsset: 'Servidores de produção',
    threat: 'Falha de disco, desastre natural',
    vulnerability: 'Falta de redundância',
    existingControl: 'Backup diário',
    riskClassification: 'Médio',
    treatment: 'mitigate' as const,
    treatmentPlan: 'Implementar RAID, replicação em tempo real',
  },
  {
    description: 'Vazamento de dados de clientes',
    eventOrAsset: 'Base de dados de clientes',
    threat: 'Ataques externos, erro humano',
    vulnerability: 'Falta de criptografia em repouso',
    existingControl: 'Firewall, antivírus',
    riskClassification: 'Crítico',
    treatment: 'mitigate' as const,
    treatmentPlan: 'Criptografar dados em repouso, DLP',
  },
  {
    description: 'Indisponibilidade de sistemas críticos',
    eventOrAsset: 'Sistemas de produção',
    threat: 'Ataques DDoS, falha de energia',
    vulnerability: 'Falta de redundância',
    existingControl: 'Backup, gerador',
    riskClassification: 'Alto',
    treatment: 'mitigate' as const,
    treatmentPlan: 'Implementar infraestrutura de alta disponibilidade',
  },
];

// Não conformidades de exemplo
const FINDING_TEMPLATES = [
  {
    type: 'NC_A' as const,
    title: 'Política de segurança não aprovada pela alta direção',
    description: 'A política de segurança da informação não foi formalmente aprovada pela alta direção, conforme exigido pela cláusula 5.2 da ISO 27001:2022.',
    area: 'Direção',
    process: 'Governança',
    clause: '5.2',
  },
  {
    type: 'NC_B' as const,
    title: 'Inventário de ativos incompleto',
    description: 'O inventário de ativos não inclui todos os ativos de informação, conforme exigido pela cláusula 5.9 da ISO 27001:2022.',
    area: 'Infraestrutura',
    process: 'Gestão de Ativos',
    clause: '5.9',
  },
  {
    type: 'CM' as const,
    title: 'Revisão de acesso pendente',
    description: 'A revisão periódica de direitos de acesso não foi realizada nos últimos 6 meses.',
    area: 'Infraestrutura',
    process: 'Controle de Acesso',
    clause: '5.18',
  },
  {
    type: 'OM' as const,
    title: 'Potencial de melhoria no treinamento',
    description: 'Sugere-se a implementação de um programa de treinamento contínuo em segurança da informação para todos os funcionários.',
    area: 'RH',
    process: 'Treinamento',
    clause: '6.3',
  },
  {
    type: 'AP' as const,
    title: 'Boa prática: Backups automatizados',
    description: 'A equipe de infraestrutura implementou backups automatizados com verificação de integridade diária.',
    area: 'Infraestrutura',
    process: 'Backup',
    clause: '8.13',
  },
];

// ============================================================
// FUNÇÕES AUXILIARES (CORRIGIDAS)
// ============================================================

function getRandomItems<T>(array: T[], count: number): T[] {
  if (!array || array.length === 0) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getRandomItem<T>(array: T[]): T | undefined {
  if (!array || array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

function generateAuditCode(companyName: string, year: number, index: number): string {
  const prefix = companyName ? companyName.substring(0, 4).toUpperCase() : 'AUD';
  return `AUD-${prefix}-${year}-${String(index).padStart(3, '0')}`;
}

function generateFindingNumber(planCode: string, index: number): string {
  return `NC-${planCode}-${String(index).padStart(3, '0')}`;
}

// ============================================================
// FUNÇÃO PRINCIPAL DO SEED
// ============================================================

async function seedAuditData() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await db.connect();

    console.log('📋 Buscando dados existentes...');

    // 1. Buscar empresas com plano Enterprise (ou todas se não houver Enterprise)
    let companies = await Company.find({});
    if (companies.length === 0) {
      console.log('⚠️ Nenhuma empresa encontrada. Crie empresas primeiro.');
      await db.disconnect();
      return;
    }

    // Filtrar apenas empresas com plano Enterprise ou ADMIN
    const enterpriseCompanies = companies.filter(c => c.plan === 'enterprise');
    const targetCompanies = enterpriseCompanies.length > 0 ? enterpriseCompanies : companies;

    console.log(`📊 Encontradas ${targetCompanies.length} empresas para seed`);

    // 2. Buscar usuários
    const users = await User.find({});
    console.log(`👤 Encontrados ${users.length} usuários`);

    // 3. Buscar controles
    const controls = await Control.find({});
    console.log(`📋 Encontrados ${controls.length} controles`);

    // 4. Buscar perguntas
    const questions = await Question.find({});
    console.log(`❓ Encontradas ${questions.length} perguntas`);

    if (controls.length === 0) {
      console.log('⚠️ Nenhum controle encontrado. Execute seed-controls.ts primeiro.');
      await db.disconnect();
      return;
    }

    // ============================================================
    // LIMPAR DADOS EXISTENTES DE AUDITORIA (opcional - comentar se não quiser)
    // ============================================================
    console.log('🗑️ Removendo dados de auditoria existentes...');
    await AuditDocumentReview.deleteMany({});
    await AuditFinding.deleteMany({});
    await AuditChecklist.deleteMany({});
    await AuditRisk.deleteMany({});
    await AuditSoA.deleteMany({});
    await AuditPlan.deleteMany({});
    await AuditProgram.deleteMany({});
    console.log('✅ Dados de auditoria removidos');

    // ============================================================
    // CRIAR DADOS PARA CADA EMPRESA
    // ============================================================
    
    let totalPrograms = 0;
    let totalPlans = 0;
    let totalSoAs = 0;
    let totalRisks = 0;
    let totalChecklists = 0;
    let totalFindings = 0;
    let totalDocReviews = 0;

    for (let companyIndex = 0; companyIndex < targetCompanies.length; companyIndex++) {
      const company = targetCompanies[companyIndex];
      if (!company) continue; // ✅ CORREÇÃO: verificar se company existe
      
      console.log(`\n🏢 Processando empresa: ${company.name} (${companyIndex + 1}/${targetCompanies.length})`);

      // Encontrar usuários da empresa
      const companyId = company._id;
      const companyUsers = users.filter(u => {
        const userCompanyId = u.companyId ? u.companyId.toString() : '';
        const targetCompanyId = companyId ? companyId.toString() : '';
        return userCompanyId === targetCompanyId;
      });
      
      const rep = companyUsers.find(u => u.role === 'rep');
      const admin = companyUsers.find(u => u.role === 'admin');
      const auditor = companyUsers.find(u => u.role === 'user') || companyUsers[0];
      const responsibleUser = rep || admin || companyUsers[0];

      if (!responsibleUser) {
        console.log(`⚠️ Nenhum usuário encontrado para empresa ${company.name}. Pulando...`);
        continue;
      }

      console.log(`👤 Responsável: ${responsibleUser.name} (${responsibleUser.role})`);

      const currentYear = 2026;
      const planIndex = companyIndex + 1;

      // ============================================================
      // 1. CRIAR PROGRAMA DE AUDITORIA
      // ============================================================
      console.log(`  📋 Criando programa de auditoria para ${currentYear}...`);

      const program = await AuditProgram.create({
        companyId: company._id,
        year: currentYear,
        status: 'approved',
        sectors: SECTOR_TEMPLATES.map((sector, idx) => ({
          ...sector,
          scoreA: Math.floor(Math.random() * 3), // 0-2
          scoreB: sector.importance === 'critical' ? 1 : 0,
          totalScore: (Math.floor(Math.random() * 3)) + (sector.importance === 'critical' ? 1 : 0),
          status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'scheduled',
          lastAuditDate: idx === 0 ? new Date(2026, 0, 15) : undefined,
          nextAuditDate: new Date(2026, 6 + idx, 1),
        })),
        supplierAudits: [
          {
            supplierName: 'Cloud Provider Inc.',
            auditDate: new Date(2026, 5, 15),
            scope: 'Serviços de infraestrutura em nuvem',
            status: 'scheduled',
          },
          {
            supplierName: 'Security Solutions Ltd.',
            auditDate: new Date(2026, 8, 20),
            scope: 'Soluções de segurança',
            status: 'scheduled',
          },
        ],
        externalAudit: {
          plannedDate: new Date(2026, 10, 10),
          certificationBody: 'Certificação ISO 27001:2022',
          scope: 'Sistema de Gestão de Segurança da Informação',
          status: 'scheduled',
        },
        otherActivities: [
          {
            name: 'Reciclagem de Auditores Internos',
            description: 'Treinamento de atualização para auditores internos',
            scheduledDate: new Date(2026, 1, 15),
            status: 'completed',
            completedAt: new Date(2026, 1, 16),
          },
          {
            name: 'Acompanhamento de NCs',
            description: 'Verificação de eficácia das ações corretivas',
            scheduledDate: new Date(2026, 3, 20),
            status: 'in_progress',
          },
          {
            name: 'Avaliação de Desempenho de Auditores',
            description: 'Avaliação dos auditores internos',
            scheduledDate: new Date(2026, 6, 1),
            status: 'pending',
          },
        ],
        createdBy: responsibleUser._id,
        approvedBy: admin?._id || responsibleUser._id,
        approvedAt: new Date(2026, 0, 10),
        observations: 'Programa de auditorias para o ano de 2026',
      });

      totalPrograms++;
      console.log(`  ✅ Programa criado: ${program._id}`);

      // ============================================================
      // 2. CRIAR PLANO DE AUDITORIA
      // ============================================================
      console.log(`  📋 Criando plano de auditoria...`);

      // Selecionar controles para escopo (30-40% dos controles)
      const selectedControls = getRandomItems(controls, Math.floor(controls.length * 0.35));
      
      // ✅ CORREÇÃO: Extrair IDs corretamente usando _id
      const controlIds = selectedControls.map(c => c._id ? c._id.toString() : c.id);

      // Selecionar áreas do escopo
      const scopeAreas = ['Desenvolvimento', 'Infraestrutura', 'Governança', 'RH'];

      const plan = await AuditPlan.create({
        title: `Auditoria SGSI - ${company.name} - ${currentYear}`,
        description: `Plano de auditoria para o SGSI da ${company.name} conforme ISO 27001:2022`,
        code: generateAuditCode(company.name, currentYear, planIndex),
        companyId: company._id,
        programId: program._id,
        scope: {
          controls: controlIds,
          processes: ['Desenvolvimento de Software', 'Gestão de Ativos', 'Controle de Acesso', 'Gestão de Incidentes'],
          areas: scopeAreas,
        },
        team: {
          leadAuditor: auditor?._id || responsibleUser._id,
          auditors: companyUsers.slice(0, 2).map(u => u._id),
          observers: companyUsers.slice(2, 4).map(u => u._id),
          specialists: [],
        },
        period: {
          startDate: new Date(2026, 2, 1),
          endDate: new Date(2026, 2, 15),
          estimatedDays: 10,
        },
        criteria: [
          'ISO/IEC 27001:2022 - Cláusulas 4 a 10',
          'ISO/IEC 27002:2022 - Anexo A',
          'Legislação aplicável (LGPD, GDPR)',
        ],
        status: 'approved',
        createdBy: responsibleUser._id,
        approvedBy: admin?._id || responsibleUser._id,
        approvedAt: new Date(2026, 1, 20),
      });

      totalPlans++;
      console.log(`  ✅ Plano criado: ${plan.code}`);

      // ============================================================
      // 3. CRIAR DECLARAÇÃO DE APLICABILIDADE (SoA)
      // ============================================================
      console.log(`  📋 Criando Declaração de Aplicabilidade...`);

      // ✅ CORREÇÃO: Acessar campos corretos do Control
      const soaControls = controls.map((control) => {
        const controlId = control._id ? control._id.toString() : control.id;
        const controlTitle = control.nome || control.title || `Controle ${controlId}`;
        const controlDesc = control.descricao || control.description || `Implementar controle ${controlId} conforme ISO 27001:2022`;
        
        return {
          clause: controlId,
          title: controlTitle,
          objective: controlDesc,
          motivators: {
            business: Math.random() > 0.3,
            risk: Math.random() > 0.2,
            legal: Math.random() > 0.4,
            contract: Math.random() > 0.5,
          },
          applicable: Math.random() > 0.15,
          justification: Math.random() > 0.85 ? 'Controle não aplicável devido à natureza do negócio' : '',
          lastAssessmentDate: new Date(2026, 0, 15),
          implemented: Math.random() > 0.4,
          implementationDate: Math.random() > 0.4 ? new Date(2026, 0, 1) : undefined,
          responsible: responsibleUser.name,
          evidence: Math.random() > 0.5 ? 'Implementado conforme política interna' : '',
        };
      });

      const soa = new AuditSoA({
        companyId: company._id,
        version: '1.0',
        status: 'approved',
        controls: soaControls,
        createdBy: responsibleUser._id,
        approvedBy: admin?._id || responsibleUser._id,
        approvedAt: new Date(2026, 0, 20),
        nextReviewDate: new Date(2027, 0, 20),
      });

      // ✅ CORREÇÃO: Usar instanceof ou verificar método
      if (typeof soa.updateStatistics === 'function') {
        soa.updateStatistics();
      }
      await soa.save();

      totalSoAs++;
      console.log(`  ✅ SoA criada: ${soa._id}`);

      // ============================================================
      // 4. CRIAR RISCOS
      // ============================================================
      console.log(`  📋 Criando riscos...`);

      const riskPromises = RISK_TEMPLATES.map(async (template, idx) => {
        const probability = Math.floor(Math.random() * 4) + 2; // 2-5
        const impact = Math.floor(Math.random() * 4) + 2; // 2-5
        const probAfter = Math.max(1, probability - Math.floor(Math.random() * 2));
        const impactAfter = Math.max(1, impact - Math.floor(Math.random() * 2));

        const risk = await AuditRisk.create({
          companyId: company._id,
          auditPlanId: plan._id,
          id: `R-${String(companyIndex + 1).padStart(3, '0')}-${String(idx + 1).padStart(3, '0')}`,
          description: template.description,
          eventOrAsset: template.eventOrAsset,
          owner: responsibleUser.name,
          threat: template.threat,
          vulnerability: template.vulnerability,
          existingControl: template.existingControl,
          probability,
          impact,
          riskClassification: template.riskClassification,
          treatment: template.treatment,
          treatmentPlan: template.treatmentPlan,
          probabilityAfter: probAfter,
          impactAfter: impactAfter,
          status: idx < 3 ? 'treated' : 'identified',
          treatmentDeadline: idx < 3 ? new Date(2026, 5, 1) : undefined,
          treatedAt: idx < 3 ? new Date(2026, 3, 15) : undefined,
          treatedBy: responsibleUser._id,
          createdBy: responsibleUser._id,
          updatedBy: responsibleUser._id,
        });

        return risk;
      });

      const risks = await Promise.all(riskPromises);
      totalRisks += risks.length;
      console.log(`  ✅ ${risks.length} riscos criados`);

      // ============================================================
      // 5. CRIAR CHECKLISTS
      // ============================================================
      console.log(`  📋 Criando checklists...`);

      const checklistPromises = controlIds.map(async (controlId) => {
        // ✅ CORREÇÃO: Acessar question corretamente
        const controlQuestions = questions.filter(q => {
          const qControlId = q.controlId ? q.controlId.toString() : '';
          return qControlId === controlId;
        });
        
        // Se não houver perguntas, criar perguntas genéricas
        const questionList = controlQuestions.length > 0 
          ? controlQuestions.slice(0, 3).map(q => ({
              // ✅ CORREÇÃO: Acessar o campo 'question' ou 'pergunta'
              question: (q as any).question || (q as any).pergunta || `Pergunta para controle ${controlId}`,
              answer: 'NA' as const,
              observations: '',
              evidenceIds: [],
              responsible: responsibleUser.name,
            }))
          : [
              {
                question: `Implementação do controle ${controlId} está conforme?`,
                answer: 'NA' as const,
                observations: '',
                evidenceIds: [],
                responsible: responsibleUser.name,
              },
              {
                question: `Documentação do controle ${controlId} está adequada?`,
                answer: 'NA' as const,
                observations: '',
                evidenceIds: [],
                responsible: responsibleUser.name,
              },
            ];

        // Marcar algumas perguntas como respondidas
        const answeredQuestions = questionList.map((q, idx) => {
          if (idx === 0) {
            return {
              ...q,
              answer: Math.random() > 0.6 ? 'C' as const : 'NA' as const,
              observations: Math.random() > 0.7 ? 'Verificado durante auditoria' : '',
              answeredAt: new Date(2026, 2, 5),
              answeredBy: auditor?._id || responsibleUser._id,
            };
          }
          if (idx === 1 && Math.random() > 0.7) {
            return {
              ...q,
              answer: 'NC' as const,
              observations: 'Não conformidade identificada durante auditoria',
              answeredAt: new Date(2026, 2, 5),
              answeredBy: auditor?._id || responsibleUser._id,
            };
          }
          return q;
        });

        const checklist = new AuditChecklist({
          auditPlanId: plan._id,
          controlId: controlId,
          questions: answeredQuestions,
          status: 'in_progress',
          createdBy: responsibleUser._id,
          updatedBy: responsibleUser._id,
        });

        // ✅ CORREÇÃO: Verificar se método existe
        if (typeof checklist.updateStatistics === 'function') {
          checklist.updateStatistics();
        }
        await checklist.save();
        return checklist;
      });

      const checklists = await Promise.all(checklistPromises);
      totalChecklists += checklists.length;
      console.log(`  ✅ ${checklists.length} checklists criados`);

      // ============================================================
      // 6. CRIAR NÃO CONFORMIDADES
      // ============================================================
      console.log(`  📋 Criando não conformidades...`);

      // Selecionar alguns checklists para criar NCs
      const selectedChecklists = getRandomItems(checklists, Math.min(3, checklists.length));
      
      const findingPromises = selectedChecklists.map(async (checklist, idx) => {
        const template = FINDING_TEMPLATES[idx % FINDING_TEMPLATES.length];
        if (!template) return null; // ✅ CORREÇÃO: verificar template
        const control = controls.find(c => {
          const cId = c._id ? c._id.toString() : c.id;
          return cId === checklist.controlId;
        });

        const finding = await AuditFinding.create({
          auditPlanId: plan._id,
          checklistId: checklist._id,
          number: generateFindingNumber(plan.code, idx + 1),
          type: template.type,
          title: template.title,
          description: template.description,
          area: template.area,
          process: template.process,
          clause: template.clause,
          controlId: checklist.controlId,
          evidenceIds: [],
          deadline: new Date(2026, 5, 30),
          status: idx === 0 ? 'pending_validation' : 'open',
          createdBy: responsibleUser._id,
          validatedBy: idx === 0 ? admin?._id : undefined,
          validatedAt: idx === 0 ? new Date(2026, 3, 1) : undefined,
          validationComment: idx === 0 ? 'Aguardando plano de ação' : '',
        });

        return finding;
      });

      const findings = await Promise.all(findingPromises);
      const validFindings = findings.filter(f => f !== null);
      totalFindings += validFindings.length;
      console.log(`  ✅ ${validFindings.length} não conformidades criadas`);

      // ============================================================
      // 7. CRIAR REVISÃO DE DOCUMENTAÇÃO
      // ============================================================
      console.log(`  📋 Criando revisão de documentação...`);

      const clauses = [
        { clause: '4.1', requirement: 'Compreender a organização e seu contexto' },
        { clause: '4.2', requirement: 'Compreender as necessidades das partes interessadas' },
        { clause: '4.3', requirement: 'Determinar o escopo do SGSI' },
        { clause: '5.1', requirement: 'Liderança e comprometimento' },
        { clause: '5.2', requirement: 'Política' },
        { clause: '6.1.2', requirement: 'Avaliação de risco' },
        { clause: '6.1.3', requirement: 'Tratamento de risco' },
        { clause: '7.1', requirement: 'Recursos' },
        { clause: '7.2', requirement: 'Competência' },
        { clause: '7.3', requirement: 'Conscientização' },
        { clause: '7.4', requirement: 'Comunicação' },
        { clause: '7.5', requirement: 'Informação documentada' },
        { clause: '8.1', requirement: 'Planejamento operacional' },
        { clause: '9.1', requirement: 'Monitoramento e medição' },
        { clause: '9.2', requirement: 'Auditoria interna' },
        { clause: '9.3', requirement: 'Análise crítica pela direção' },
        { clause: '10.1', requirement: 'Melhoria contínua' },
        { clause: '10.2', requirement: 'Não conformidade e ação corretiva' },
      ];

      const documentItems = clauses.map((c) => ({
        clause: c.clause,
        requirement: c.requirement,
        status: ['OK', 'OK', 'OK', 'OK', 'NC_B', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK'][Math.floor(Math.random() * 3)] as 'OK' | 'NC_A' | 'NC_B' | 'PI' | 'GP' | 'CM' | '--',
        observations: Math.random() > 0.8 ? 'Revisão pendente' : '',
        reviewer: responsibleUser.name,
        reviewDate: new Date(2026, 2, 1),
      }));

      const docReview = new AuditDocumentReview({
        companyId: company._id,
        auditPlanId: plan._id,
        documents: documentItems,
        createdBy: responsibleUser._id,
        reviewedBy: admin?._id || responsibleUser._id,
        reviewedAt: new Date(2026, 2, 10),
        observations: 'Revisão da documentação do SGSI concluída',
      });

      // ✅ CORREÇÃO: Verificar se método existe
      if (typeof docReview.updateSummary === 'function') {
        docReview.updateSummary();
      }
      await docReview.save();

      totalDocReviews++;
      console.log(`  ✅ Revisão de documentação criada`);

    } // Fim do loop de empresas

    // ============================================================
    // RESUMO FINAL
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DO SEED DE AUDITORIA');
    console.log('='.repeat(60));
    console.log(`🏢 Empresas processadas: ${targetCompanies.length}`);
    console.log(`📋 Programas de auditoria: ${totalPrograms}`);
    console.log(`📋 Planos de auditoria: ${totalPlans}`);
    console.log(`📋 Declarações de Aplicabilidade: ${totalSoAs}`);
    console.log(`📋 Riscos criados: ${totalRisks}`);
    console.log(`📋 Checklists criados: ${totalChecklists}`);
    console.log(`📋 Não conformidades criadas: ${totalFindings}`);
    console.log(`📋 Revisões de documentação: ${totalDocReviews}`);
    console.log('='.repeat(60));
    console.log('✅ SEED CONCLUÍDO COM SUCESSO!');

    await db.disconnect();
    console.log('🔌 Desconectado do MongoDB.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao executar seed:', error);
    await db.disconnect();
    process.exit(1);
  }
}

// Executar o seed
seedAuditData();