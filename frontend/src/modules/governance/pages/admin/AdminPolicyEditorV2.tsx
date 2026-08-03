import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, CheckCircle, AlertCircle, 
  Plus, Trash2, GripVertical, Eye, FileText,
  ChevronDown, ChevronRight, Menu
} from 'lucide-react';
import { useGovernanceDocument, useCreateGovernanceDocument, useUpdateGovernanceDocument } from '../../hooks/useGovernance';
import { CreatePolicyDTO, UpdateGovernanceDocumentDTO } from '../../types/governance.types';
import { useAuth } from '../../../../contexts/AuthContext.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ============================================================
// CONFIGURAÇÃO DO EDITOR QUILL
// ============================================================
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'check',
  'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video',
];

// ============================================================
// CONFIGURAÇÃO DAS 47 SEÇÕES
// ============================================================
const SECTIONS_CONFIG = [
  { id: 'objective', title: '1. OBJETIVO' },
  { id: 'scope', title: '2. ESCOPO' },
  { id: 'normativeReferences', title: '3. REFERÊNCIAS NORMATIVAS E FRAMEWORKS' },
  { id: 'principles', title: '4. PRINCÍPIOS DE SEGURANÇA DA INFORMAÇÃO' },
  { id: 'governance', title: '5. GOVERNANÇA DE SEGURANÇA DA INFORMAÇÃO' },
  { id: 'roles', title: '6. PAPÉIS E RESPONSABILIDADES' },
  { id: 'committee', title: '7. COMITÊ DE SEGURANÇA DA INFORMAÇÃO' },
  { id: 'riskManagement', title: '8. GESTÃO DE RISCOS DE SEGURANÇA DA INFORMAÇÃO' },
  { id: 'classification', title: '9. CLASSIFICAÇÃO E TRATAMENTO DA INFORMAÇÃO' },
  { id: 'accessControl', title: '10. CONTROLE DE ACESSO' },
  { id: 'identityManagement', title: '11. GESTÃO DE IDENTIDADES E ACESSOS (IAM)' },
  { id: 'authentication', title: '12. AUTENTICAÇÃO E CONTROLE DE CREDENCIAIS' },
  { id: 'privilegedAccess', title: '13. ACESSO PRIVILEGIADO (PAM)' },
  { id: 'segregation', title: '14. SEGREGAÇÃO DE FUNÇÕES' },
  { id: 'assetSecurity', title: '15. SEGURANÇA DE ATIVOS DE INFORMAÇÃO' },
  { id: 'assetLifecycle', title: '16. GESTÃO DO CICLO DE VIDA DOS ATIVOS' },
  { id: 'acceptableUse', title: '17. USO ACEITÁVEL DOS RECURSOS CORPORATIVOS' },
  { id: 'endpointSecurity', title: '18. SEGURANÇA DE DISPOSITIVOS ENDPOINT' },
  { id: 'networkSecurity', title: '19. SEGURANÇA DE REDES E COMUNICAÇÕES' },
  { id: 'zeroTrust', title: '20. ARQUITETURA DE SEGURANÇA E ZERO TRUST' },
  { id: 'cloudSecurity', title: '21. SEGURANÇA EM AMBIENTES CLOUD' },
  { id: 'applicationSecurity', title: '22. SEGURANÇA DE APLICAÇÕES E DESENVOLVIMENTO SEGURO' },
  { id: 'vulnerabilityManagement', title: '23. GESTÃO DE VULNERABILIDADES' },
  { id: 'patchManagement', title: '24. GESTÃO DE PATCHES E ATUALIZAÇÕES' },
  { id: 'malwareProtection', title: '25. PROTEÇÃO CONTRA MALWARE' },
  { id: 'monitoring', title: '26. MONITORAMENTO, LOGS E DETECÇÃO DE EVENTOS' },
  { id: 'soc', title: '27. CENTRO DE OPERAÇÕES DE SEGURANÇA (SOC)' },
  { id: 'incidentManagement', title: '28. GESTÃO DE INCIDENTES DE SEGURANÇA' },
  { id: 'businessContinuity', title: '29. CONTINUIDADE DE NEGÓCIOS E RECUPERAÇÃO DE DESASTRES' },
  { id: 'backup', title: '30. GESTÃO DE BACKUP E RESTAURAÇÃO' },
  { id: 'cryptography', title: '31. CRIPTOGRAFIA E PROTEÇÃO DE DADOS' },
  { id: 'keyManagement', title: '32. GESTÃO DE CHAVES CRIPTOGRÁFICAS' },
  { id: 'physicalSecurity', title: '33. SEGURANÇA FÍSICA E AMBIENTAL' },
  { id: 'thirdParty', title: '34. SEGURANÇA DE TERCEIROS E FORNECEDORES' },
  { id: 'thirdPartyServices', title: '35. GESTÃO DE SERVIÇOS TERCEIRIZADOS' },
  { id: 'systemDevelopment', title: '36. SEGURANÇA NO DESENVOLVIMENTO E AQUISIÇÃO DE SISTEMAS' },
  { id: 'privacy', title: '37. PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS' },
  { id: 'remoteWork', title: '38. SEGURANÇA PARA TRABALHO REMOTO' },
  { id: 'awareness', title: '39. CONSCIENTIZAÇÃO E TREINAMENTO DE SEGURANÇA' },
  { id: 'aiSecurity', title: '40. USO SEGURO DE INTELIGÊNCIA ARTIFICIAL' },
  { id: 'changeManagement', title: '41. GESTÃO DE MUDANÇAS' },
  { id: 'audit', title: '42. AUDITORIA, MONITORAMENTO E CONFORMIDADE' },
  { id: 'metrics', title: '43. MÉTRICAS E INDICADORES DE SEGURANÇA' },
  { id: 'exceptions', title: '44. EXCEÇÕES À POLÍTICA' },
  { id: 'violations', title: '45. VIOLAÇÕES E MEDIDAS DISCIPLINARES' },
  { id: 'review', title: '46. REVISÃO E APROVAÇÃO DA POLÍTICA' },
  { id: 'documentControl', title: '47. CONTROLE DE DOCUMENTOS' },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function AdminPolicyEditorV2() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditing = !!id && id !== 'new';

  const { data: existingDoc, isLoading: isLoadingDoc } = useGovernanceDocument(id || '');
  const createMutation = useCreateGovernanceDocument();
  const updateMutation = useUpdateGovernanceDocument();

  // Estado do formulário
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    category: '',
    version: 'v1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    responsible: '',
    strategicObjective: '',
    summary: '',
    keywords: [] as string[],
    frameworks: {
      iso27001: [] as string[],
      nist: [] as string[],
      cobit: [] as string[],
      pciDss: [] as string[],
      lgpd: [] as string[],
      bacen: [] as string[],
    },
  });

  // Estado das seções
  const [sections, setSections] = useState<Record<string, string>>({});
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Inicializar seções
  useEffect(() => {
    const initialSections: Record<string, string> = {};
    const initialTitles: Record<string, string> = {};
    const initialOrder: string[] = [];
    const initialActive: Record<string, boolean> = {};

    SECTIONS_CONFIG.forEach((sec) => {
      initialSections[sec.id] = '';
      initialTitles[sec.id] = sec.title;
      initialOrder.push(sec.id);
      initialActive[sec.id] = true;
    });

    setSections(initialSections);
    setSectionTitles(initialTitles);
    setSectionOrder(initialOrder);
    setActiveSections(initialActive);
    setExpandedSection(initialOrder[0] || null);
  }, []);

  // Carregar documento existente
  useEffect(() => {
    if (existingDoc && isEditing) {
      const doc = existingDoc as any;
      setFormData({
        code: doc.code || '',
        title: doc.title || '',
        category: doc.category || '',
        version: doc.version || 'v1.0',
        effectiveDate: doc.effectiveDate ? new Date(doc.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reviewDate: doc.reviewDate ? new Date(doc.reviewDate).toISOString().split('T')[0] : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        responsible: doc.responsible || '',
        strategicObjective: doc.strategicObjective || '',
        summary: doc.summary || '',
        keywords: doc.keywords || [],
        frameworks: doc.frameworks || { iso27001: [], nist: [], cobit: [], pciDss: [], lgpd: [], bacen: [] },
      });

      // Tentar extrair seções do conteúdo
      if (doc.content) {
        // Tentar parsear o conteúdo para extrair seções
        // Se for um conteúdo estruturado, separar por seções
        const contentParts = doc.content.split(/\n## \d+\./);
        if (contentParts.length > 1) {
          // Conteúdo estruturado - extrair seções
          const extractedSections: Record<string, string> = {};
          SECTIONS_CONFIG.forEach((sec, idx) => {
            const partIndex = idx + 1;
            if (partIndex < contentParts.length) {
              extractedSections[sec.id] = contentParts[partIndex]?.trim() || '';
            }
          });
          if (Object.values(extractedSections).some(v => v)) {
            setSections(prev => ({ ...prev, ...extractedSections }));
          }
        } else {
          // Conteúdo não estruturado - colocar na primeira seção
          setSections(prev => ({ ...prev, objective: doc.content || '' }));
        }
      }
    }
  }, [existingDoc, isEditing]);

  // ============================================================
  // MANIPULAÇÃO DE SEÇÕES
  // ============================================================
  const handleSectionChange = (id: string, value: string) => {
    setSections(prev => ({ ...prev, [id]: value }));
  };

  const handleSectionTitleChange = (id: string, title: string) => {
    setSectionTitles(prev => ({ ...prev, [id]: title }));
  };

  const handleSectionDelete = (id: string) => {
    setActiveSections(prev => ({ ...prev, [id]: false }));
  };

  const handleSectionRestore = (id: string) => {
    setActiveSections(prev => ({ ...prev, [id]: true }));
  };

  const handleSectionMove = (id: string, direction: 'up' | 'down') => {
    const index = sectionOrder.indexOf(id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const toggleSectionExpand = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  // ============================================================
  // MANIPULAÇÃO DE FRAMEWORKS
  // ============================================================
  const handleFrameworkAdd = (framework: string, value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      frameworks: {
        ...prev.frameworks,
        [framework]: [...(prev.frameworks[framework as keyof typeof prev.frameworks] || []), value.trim()],
      },
    }));
  };

  const handleFrameworkRemove = (framework: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      frameworks: {
        ...prev.frameworks,
        [framework]: (prev.frameworks[framework as keyof typeof prev.frameworks] || []).filter(v => v !== value),
      },
    }));
  };

  // ============================================================
  // MANIPULAÇÃO DE KEYWORDS
  // ============================================================
  const handleKeywordAdd = (keyword: string) => {
    if (!keyword.trim()) return;
    setFormData(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), keyword.trim()],
    }));
  };

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: (prev.keywords || []).filter(k => k !== keyword),
    }));
  };

  // ============================================================
  // GERAÇÃO DO DOCUMENTO COMPLETO
  // ============================================================
  const generateFullPolicy = (companyName: string = '<NOME DO CLIENTE>') => {
    const activeSectionIds = sectionOrder.filter(id => activeSections[id]);
    let fullContent = `<div style="text-align: justify; font-family: Arial, sans-serif;">`;

    // Título principal
    fullContent += `<h1 style="text-align: center; font-size: 24pt; text-transform: uppercase;">POLÍTICA DE SEGURANÇA DA INFORMAÇÃO</h1>`;
    fullContent += `<p style="text-align: center; font-size: 14pt; margin-bottom: 30px;"><strong>Empresa:</strong> ${companyName}</p>`;

    // Índice
    fullContent += `<h2 style="text-transform: uppercase;">ÍNDICE</h2>`;
    fullContent += `<ul style="list-style: none; padding-left: 0;">`;
    activeSectionIds.forEach((id, index) => {
      const title = sectionTitles[id] || SECTIONS_CONFIG.find(s => s.id === id)?.title || id;
      fullContent += `<li style="margin-bottom: 4px;"><a href="#section-${id}">${title}</a></li>`;
    });
    fullContent += `</ul>`;

    // Seções
    activeSectionIds.forEach((id) => {
      const content = sections[id] || '';
      const title = sectionTitles[id] || SECTIONS_CONFIG.find(s => s.id === id)?.title || id;
      fullContent += `<h2 id="section-${id}" style="text-transform: uppercase; margin-top: 30px; border-bottom: 2px solid #333; padding-bottom: 8px;">${title}</h2>`;
      fullContent += `<div style="text-align: justify;">${content}</div>`;
    });

    // Controle de documentos
    fullContent += `<hr style="margin-top: 40px; border: 1px solid #ccc;" />`;
    fullContent += `<h2 style="text-transform: uppercase;">CONTROLE DE DOCUMENTOS</h2>`;
    fullContent += `<table style="width: 100%; border-collapse: collapse; font-size: 11pt; text-align: left;">`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc;"><strong>Código</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.code}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc;"><strong>Versão</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.version}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc;"><strong>Data de Efetivação</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.effectiveDate}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc;"><strong>Data de Revisão</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.reviewDate}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc;"><strong>Responsável</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.responsible}</td></tr>`;
    fullContent += `</table>`;

    fullContent += `</div>`;
    return fullContent;
  };

  // ============================================================
  // SUBMISSÃO
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const companyName = (user as any)?.companyName || 'NOME DA EMPRESA';
      const fullContent = generateFullPolicy(companyName);

      const data: CreatePolicyDTO = {
        code: formData.code,
        title: formData.title,
        level: 1,
        category: formData.category,
        content: fullContent,
        summary: formData.summary || sections.objective?.substring(0, 200) || '',
        keywords: formData.keywords,
        effectiveDate: new Date(formData.effectiveDate),
        reviewDate: new Date(formData.reviewDate),
        frameworks: formData.frameworks,
        scope: 'all',
        strategicObjective: formData.strategicObjective,
        responsible: formData.responsible,
      };

      if (isEditing && id) {
        const updateData: UpdateGovernanceDocumentDTO = {
          title: data.title,
          content: data.content,
          summary: data.summary,
          keywords: data.keywords,
          effectiveDate: data.effectiveDate,
          reviewDate: data.reviewDate,
          frameworks: data.frameworks,
          version: formData.version,
        };
        await updateMutation.mutateAsync({ id, data: updateData });
      } else {
        await createMutation.mutateAsync(data);
      }

      navigate('/admin/governance');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (isLoadingDoc && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeSectionIds = sectionOrder.filter(id => activeSections[id]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/governance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Política (Estruturada)' : 'Nova Política (Estruturada)'}
          </h1>
          <p className="text-gray-500 text-sm">Nível 1 - Documento Estratégico com 47 seções</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Erro ao salvar</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Ex: POL-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Política de Segurança da Informação"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Estratégia, Acessos, Riscos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Versão</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="v1.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <input
                type="text"
                value={formData.responsible}
                onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                placeholder="Ex: Diretoria de Segurança"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Estratégico</label>
              <input
                type="text"
                value={formData.strategicObjective}
                onChange={(e) => setFormData(prev => ({ ...prev, strategicObjective: e.target.value }))}
                placeholder="Ex: Garantir a proteção das informações"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Efetivação</label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Revisão</label>
              <input
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Resumo executivo da política..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Frameworks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frameworks de Referência</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['iso27001', 'nist', 'lgpd'].map((fw) => (
              <div key={fw}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fw === 'iso27001' ? 'ISO 27001' : fw === 'nist' ? 'NIST CSF' : 'LGPD'}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.frameworks[fw as keyof typeof formData.frameworks] || []).map((f) => (
                    <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {f}
                      <button type="button" onClick={() => handleFrameworkRemove(fw, f)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={`Ex: ${fw === 'iso27001' ? 'A.5.1' : fw === 'nist' ? 'ID.AM' : 'Art. 6'}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFrameworkAdd(fw, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Palavras-chave</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.keywords.map((k) => (
              <span key={k} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {k}
                <button type="button" onClick={() => handleKeywordRemove(k)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Digite uma palavra-chave e pressione Enter"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleKeywordAdd((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>

        {/* Seções da Política */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Conteúdo da Política (47 Seções)</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Editar' : 'Pré-visualizar'}
              </button>
            </div>
          </div>

          {previewMode ? (
            // MODO PREVIEW
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: generateFullPolicy((user as any)?.companyName || '<NOME DO CLIENTE>')
                }}
              />
            </div>
          ) : (
            // MODO EDIÇÃO
            <div className="flex flex-col lg:flex-row">
              {/* Índice (Sidebar) */}
              <div className="lg:w-1/4 border-r border-gray-200 p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Menu className="w-4 h-4" />
                  ÍNDICE
                </h3>
                <ul className="space-y-1">
                  {activeSectionIds.map((id) => {
                    const title = sectionTitles[id] || SECTIONS_CONFIG.find(s => s.id === id)?.title || id;
                    const isActive = expandedSection === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => toggleSectionExpand(id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                            isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="truncate">{title}</span>
                          {isActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Editor das Seções */}
              <div className="lg:w-3/4 p-4 max-h-[600px] overflow-y-auto">
                {activeSectionIds.map((id) => {
                  const isExpanded = expandedSection === id;
                  const title = sectionTitles[id] || SECTIONS_CONFIG.find(s => s.id === id)?.title || id;

                  return (
                    <div
                      key={id}
                      className={`mb-4 border border-gray-200 rounded-lg overflow-hidden transition-all ${
                        isExpanded ? 'border-indigo-300 shadow-md' : ''
                      }`}
                    >
                      {/* Cabeçalho da seção */}
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSectionExpand(id)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => handleSectionTitleChange(id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-sm bg-transparent border border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 w-full max-w-md"
                          />
                          <span className="text-xs text-gray-400 ml-2">
                            {sections[id]?.length || 0} caracteres
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSectionMove(id, 'up');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            disabled={sectionOrder.indexOf(id) === 0}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSectionMove(id, 'down');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            disabled={sectionOrder.indexOf(id) === sectionOrder.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSectionDelete(id);
                            }}
                            className="p-1 hover:bg-red-100 text-red-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Conteúdo da seção */}
                      {isExpanded && (
                        <div className="p-3">
                          <ReactQuill
                            theme="snow"
                            value={sections[id] || ''}
                            onChange={(value) => handleSectionChange(id, value)}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder={`Digite o conteúdo de "${title}"...`}
                            className="bg-white rounded-lg"
                            style={{ minHeight: '200px' }}
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const content = sections[id] || '';
                                const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
                                alert(`Seção: ${title}\nCaracteres: ${content.length}\nPalavras: ${wordCount}`);
                              }}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              📊 Estatísticas
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/governance')}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Atualizar Política' : 'Criar Política'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}