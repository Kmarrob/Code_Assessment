import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, CheckCircle, AlertCircle, 
  Plus, Trash2, GripVertical, Eye, FileText, Download,
  ChevronDown, ChevronRight, Menu, Printer
} from 'lucide-react';
import { useGovernanceDocument, useCreateGovernanceDocument, useUpdateGovernanceDocument } from '../../hooks/useGovernance';
import { CreateProcedureDTO, UpdateGovernanceDocumentDTO, Procedure } from '../../types/governance.types';
import { useAuth } from '../../../../contexts/AuthContext.js';
import { companyService } from '../../../../services/company.service.js';
import { governanceService } from '../../services/governance.service.js';
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
// CONFIGURAÇÃO DAS 10 SEÇÕES DO PROCEDIMENTO
// ============================================================
const SECTIONS_CONFIG = [
  { id: 'objective', title: '1. OBJETIVO' },
  { id: 'scope', title: '2. ESCOPO' },
  { id: 'normativeReferences', title: '3. REFERÊNCIAS NORMATIVAS' },
  { id: 'terms', title: '4. TERMOS E DEFINIÇÕES' },
  { id: 'description', title: '5. DESCRIÇÃO DO PROCEDIMENTO' },
  { id: 'responsibilities', title: '6. RESPONSABILIDADES' },
  { id: 'steps', title: '7. PASSOS DETALHADOS' },
  { id: 'controls', title: '8. CONTROLES E MONITORAMENTO' },
  { id: 'records', title: '9. REGISTROS E EVIDÊNCIAS' },
  { id: 'finalProvisions', title: '10. DISPOSIÇÕES FINAIS' },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function AdminProcedureEditorV2() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditing = !!id && id !== 'new';

  const [companyName, setCompanyName] = useState<string>('<NOME DO CLIENTE>');
  const [standards, setStandards] = useState<Array<{ _id: string; code: string; title: string }>>([]);
  const [isLoadingStandards, setIsLoadingStandards] = useState(false);

  // 🆕 ESTADO PARA SEÇÕES CUSTOMIZADAS
  const [customSections, setCustomSections] = useState<Array<{ id: string; title: string }>>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Buscar nome da empresa
  useEffect(() => {
    const fetchCompanyName = async () => {
      const userRole = (user as any)?.role;
      if (userRole === 'ADMIN' || userRole === 'admin') {
        setCompanyName('<NOME DO CLIENTE>');
        return;
      }

      const companyId = (user as any)?.companyId;
      if (!companyId) return;

      try {
        const company = await companyService.getCompanyById(companyId);
        if (company?.name) {
          setCompanyName(company.name);
        }
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      }
    };

    fetchCompanyName();
  }, [user]);

  // Buscar normas para referência
  useEffect(() => {
    const fetchStandards = async () => {
      try {
        setIsLoadingStandards(true);
        const docs = await governanceService.listStandards();
        setStandards(docs.map((doc: any) => ({
          _id: doc._id || doc.id,
          code: doc.code,
          title: doc.title,
        })));
      } catch (error) {
        console.error('Erro ao buscar normas:', error);
      } finally {
        setIsLoadingStandards(false);
      }
    };

    fetchStandards();
  }, []);

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
    responsibleArea: '',
    standardId: '',
    mandatory: true,
    nonCompliancePenalty: '',
    summary: '',
    keywords: [] as string[],
    inputs: [] as string[],
    outputs: [] as string[],
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
  const [isDownloading, setIsDownloading] = useState(false);

  // Inicializar seções (com suporte a custom sections)
  useEffect(() => {
    const initialSections: Record<string, string> = {};
    const initialTitles: Record<string, string> = {};
    const initialOrder: string[] = [];
    const initialActive: Record<string, boolean> = {};

    // Seções padrão
    SECTIONS_CONFIG.forEach((sec) => {
      initialSections[sec.id] = '';
      initialTitles[sec.id] = sec.title;
      initialOrder.push(sec.id);
      initialActive[sec.id] = true;
    });

    // Seções customizadas
    customSections.forEach((sec) => {
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
  }, [customSections]);

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
        responsibleArea: doc.responsibleArea || '',
        standardId: doc.standardId || '',
        mandatory: doc.mandatory !== undefined ? doc.mandatory : true,
        nonCompliancePenalty: doc.nonCompliancePenalty || '',
        summary: doc.summary || '',
        keywords: doc.keywords || [],
        inputs: doc.inputs || [],
        outputs: doc.outputs || [],
        frameworks: doc.frameworks || { iso27001: [], nist: [], cobit: [], pciDss: [], lgpd: [], bacen: [] },
      });

      // Extrair seções do conteúdo
      if (doc.content) {
        const sectionRegex = /<h2\s+id="section-([^"]+)"[^>]*>([^<]*)<\/h2>/gi;
        const matches = [...doc.content.matchAll(sectionRegex)];
        
        if (matches.length > 0) {
          const extractedSections: Record<string, string> = {};
          const extractedCustomSections: Array<{ id: string; title: string }> = [];
          
          matches.forEach((match) => {
            const sectionId = match[1];
            const sectionTitle = match[2];
            const startIndex = match.index + match[0].length;
            const nextMatch = doc.content.indexOf('<h2 id="section-', startIndex);
            const endIndex = nextMatch !== -1 ? nextMatch : doc.content.length;
            const content = doc.content.substring(startIndex, endIndex).trim();
            extractedSections[sectionId] = content;
            
            const isDefaultSection = SECTIONS_CONFIG.some(s => s.id === sectionId);
            if (!isDefaultSection) {
              extractedCustomSections.push({ id: sectionId, title: sectionTitle });
            }
            
            if (sectionTitle && sectionTitle !== sectionTitles[sectionId]) {
              setSectionTitles(prev => ({ ...prev, [sectionId]: sectionTitle }));
            }
          });
          
          if (extractedCustomSections.length > 0) {
            setCustomSections(extractedCustomSections);
          }
          
          if (Object.keys(extractedSections).length > 0) {
            setSections(prev => ({ ...prev, ...extractedSections }));
          }
        } else {
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
  // 🆕 MANIPULAÇÃO DE SEÇÕES CUSTOMIZADAS
  // ============================================================
  const handleAddCustomSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const id = `custom-${Date.now()}`;
    const title = newSectionTitle.trim();
    
    setCustomSections(prev => [...prev, { id, title }]);
    setSectionOrder(prev => [...prev, id]);
    setActiveSections(prev => ({ ...prev, [id]: true }));
    setSections(prev => ({ ...prev, [id]: '' }));
    setSectionTitles(prev => ({ ...prev, [id]: title }));
    setExpandedSection(id);
    
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  const handleRemoveCustomSection = (id: string) => {
    const isDefaultSection = SECTIONS_CONFIG.some(s => s.id === id);
    if (isDefaultSection) return;
    
    setCustomSections(prev => prev.filter(s => s.id !== id));
    setActiveSections(prev => ({ ...prev, [id]: false }));
    setSectionOrder(prev => prev.filter(s => s.id !== id));
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
  // MANIPULAÇÃO DE INPUTS/OUTPUTS
  // ============================================================
  const handleInputAdd = (input: string) => {
    if (!input.trim()) return;
    setFormData(prev => ({
      ...prev,
      inputs: [...(prev.inputs || []), input.trim()],
    }));
  };

  const handleInputRemove = (input: string) => {
    setFormData(prev => ({
      ...prev,
      inputs: (prev.inputs || []).filter(i => i !== input),
    }));
  };

  const handleOutputAdd = (output: string) => {
    if (!output.trim()) return;
    setFormData(prev => ({
      ...prev,
      outputs: [...(prev.outputs || []), output.trim()],
    }));
  };

  const handleOutputRemove = (output: string) => {
    setFormData(prev => ({
      ...prev,
      outputs: (prev.outputs || []).filter(o => o !== output),
    }));
  };

  // ============================================================
  // SUBSTITUIÇÃO DE PLACEHOLDERS
  // ============================================================
  const replaceAllPlaceholders = (text: string, companyNameParam: string): string => {
    if (!text) return text;
    
    const placeholders = [
      /<NOME DO CLIENTE>/g,
      /&lt;NOME DO CLIENTE&gt;/g,
      /\[NOME DO CLIENTE\]/g,
      /{{NOME_DO_CLIENTE}}/g,
      /NOME_DO_CLIENTE/g,
    ];

    let result = text;
    placeholders.forEach((regex) => {
      result = result.replace(regex, companyNameParam);
    });

    return result;
  };

  // ============================================================
  // GERAÇÃO DO DOCUMENTO COMPLETO
  // ============================================================
  const generateFullDocument = (companyNameParam: string = '<NOME DO CLIENTE>') => {
    const activeSectionIds = sectionOrder.filter(id => activeSections[id]);
    let fullContent = `<div style="text-align: justify; font-family: Arial, sans-serif;">`;

    // Título
    fullContent += `<h1 style="text-align: center; font-size: 24pt; text-transform: uppercase;">${formData.title}</h1>`;
    fullContent += `<p style="text-align: center; font-size: 14pt; margin-bottom: 30px;"><strong>Empresa:</strong> ${companyNameParam}</p>`;

    // Informações do Procedimento
    fullContent += `<table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-bottom: 30px; border: 1px solid #ccc;">`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5; width: 30%;"><strong>Código</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.code}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Versão</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.version}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Data de Efetivação</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.effectiveDate}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Data de Revisão</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.reviewDate}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Responsável</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.responsible}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Área Responsável</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.responsibleArea}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Norma Referenciada</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.standardId || 'Não informada'}</td></tr>`;
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Obrigatório</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.mandatory ? 'Sim' : 'Não'}</td></tr>`;
    if (formData.nonCompliancePenalty) {
      fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Penalidade</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.nonCompliancePenalty}</td></tr>`;
    }
    if (formData.inputs && formData.inputs.length > 0) {
      fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Entradas</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.inputs.join(', ')}</td></tr>`;
    }
    if (formData.outputs && formData.outputs.length > 0) {
      fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; background: #f5f5f5;"><strong>Saídas</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.outputs.join(', ')}</td></tr>`;
    }
    fullContent += `</table>`;

    // Índice
    fullContent += `<h2 style="text-transform: uppercase;">ÍNDICE</h2>`;
    fullContent += `<ul style="list-style: none; padding-left: 0;">`;
    activeSectionIds.forEach((id) => {
      const title = sectionTitles[id] || SECTIONS_CONFIG.find(s => s.id === id)?.title || id;
      fullContent += `<li style="margin-bottom: 4px;"><a href="#section-${id}">${title}</a></li>`;
    });
    fullContent += `</ul>`;

    // Seções
    activeSectionIds.forEach((id) => {
      let content = sections[id] || '';
      content = replaceAllPlaceholders(content, companyNameParam);
      
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
    fullContent += `<tr><td style="padding: 8px; border: 1px solid #ccc;"><strong>Área Responsável</strong></td><td style="padding: 8px; border: 1px solid #ccc;">${formData.responsibleArea}</td></tr>`;
    fullContent += `</table>`;

    fullContent += `</div>`;
    return fullContent;
  };

  // ============================================================
  // GERAÇÃO DE RESUMO AUTOMÁTICO
  // ============================================================
  const generateAutoSummary = useCallback(() => {
    const objectiveContent = sections.objective || '';
    const plainText = objectiveContent.replace(/<[^>]*>/g, '').trim();
    
    if (plainText.length >= 10) {
      return plainText.substring(0, 150) + '...';
    }
    
    if (formData.title && formData.title.length >= 10) {
      return formData.title;
    }
    
    return 'Procedimento - Documento operacional para padronização de processos e atividades.';
  }, [sections.objective, formData.title]);

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================
  const handleDownloadPdf = async () => {
    if (!id) {
      alert('Salve o documento antes de baixar o PDF');
      return;
    }

    try {
      setIsDownloading(true);
      const blob = await governanceService.downloadDocumentPdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.code}_${formData.title.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao baixar PDF. Verifique se o documento foi salvo corretamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================
  // SUBMISSÃO
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const companyNameToUse = companyName || '<NOME DO CLIENTE>';
      const fullContent = generateFullDocument(companyNameToUse);

      const originalSummary = formData.summary || '';
      const autoSummary = generateAutoSummary();
      let finalSummary = originalSummary.trim() || autoSummary;
      if (finalSummary.length > 500) {
        finalSummary = finalSummary.substring(0, 497) + '...';
      }

      const data: CreateProcedureDTO = {
        code: formData.code,
        title: formData.title,
        level: 3,
        category: formData.category,
        content: fullContent,
        summary: finalSummary,
        keywords: formData.keywords,
        effectiveDate: new Date(formData.effectiveDate),
        reviewDate: new Date(formData.reviewDate),
        frameworks: formData.frameworks,
        standardId: formData.standardId,
        steps: [],
        inputs: formData.inputs || [],
        outputs: formData.outputs || [],
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
          versionChanges: 'Atualização via editor estruturado',
          category: formData.category,
          responsible: formData.responsible,
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
            {isEditing ? 'Editar Procedimento (Estruturado)' : 'Novo Procedimento (Estruturado)'}
          </h1>
          <p className="text-gray-500 text-sm">Nível 3 - Documento Operacional com 10 seções</p>
        </div>
        {isEditing && id && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            Baixar PDF
          </button>
        )}
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
                placeholder="Ex: PRC-001"
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
                placeholder="Ex: Procedimento de Concessão de Acesso"
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
                placeholder="Ex: Acessos, Incidentes, Mudanças"
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
                placeholder="Ex: Gestor de Acessos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área Responsável</label>
              <input
                type="text"
                value={formData.responsibleArea}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibleArea: e.target.value }))}
                placeholder="Ex: TI, Segurança, RH"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Relacionamentos e Metadados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Relacionamentos e Metadados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Norma Referenciada</label>
              <select
                value={formData.standardId}
                onChange={(e) => setFormData(prev => ({ ...prev, standardId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione uma norma...</option>
                {standards.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Selecione a norma que este procedimento referencia</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Obrigatório</label>
              <select
                value={formData.mandatory ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, mandatory: e.target.value === 'true' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Penalidade por Não Conformidade</label>
              <input
                type="text"
                value={formData.nonCompliancePenalty || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nonCompliancePenalty: e.target.value }))}
                placeholder="Ex: Advertência por escrito, Suspensão, Multa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Inputs e Outputs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Entradas e Saídas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entradas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.inputs.map((i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {i}
                    <button type="button" onClick={() => handleInputRemove(i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Digite uma entrada e pressione Enter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInputAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <p className="text-xs text-gray-400 mt-1">Ex: Documento de solicitação, Aprovação do gestor</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saídas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.outputs.map((o) => (
                  <span key={o} className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    {o}
                    <button type="button" onClick={() => handleOutputRemove(o)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Digite uma saída e pressione Enter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleOutputAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <p className="text-xs text-gray-400 mt-1">Ex: Usuário criado, Relatório de acesso</p>
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

        {/* Resumo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="Resumo executivo do procedimento..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.summary.length}/500 caracteres
          </p>
        </div>

        {/* Seções do Procedimento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Conteúdo do Procedimento ({activeSectionIds.length} Seções)
            </h2>
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
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: generateFullDocument(companyName)
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row">
              {/* Índice */}
              <div className="lg:w-1/4 border-r border-gray-200 p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    ÍNDICE
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingSection(true)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Seção
                  </button>
                </h3>
                
                {isAddingSection && (
                  <div className="mb-3 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                    <input
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="Título da nova seção..."
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCustomSection();
                        }
                        if (e.key === 'Escape') {
                          setIsAddingSection(false);
                          setNewSectionTitle('');
                        }
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={handleAddCustomSection}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSection(false);
                          setNewSectionTitle('');
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                
                <ul className="space-y-1">
                  {activeSectionIds.map((id) => {
                    const title = sectionTitles[id] || SECTIONS_CONFIG.find(s => s.id === id)?.title || id;
                    const isActive = expandedSection === id;
                    const isCustom = customSections.some(s => s.id === id);
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
                          <div className="flex items-center gap-1">
                            {isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCustomSection(id);
                                }}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                            {isActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
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
                  const isCustom = customSections.some(s => s.id === id);

                  return (
                    <div
                      key={id}
                      className={`mb-4 border border-gray-200 rounded-lg overflow-hidden transition-all ${
                        isExpanded ? 'border-indigo-300 shadow-md' : ''
                      }`}
                    >
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
                          {isCustom && (
                            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              Custom
                            </span>
                          )}
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
                {isEditing ? 'Atualizar Procedimento' : 'Criar Procedimento'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}