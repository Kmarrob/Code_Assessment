// backend/src/services/ReportResultService.ts
import mongoose from 'mongoose';
import { Control } from '../models/Control.js';
import { Response } from '../models/Response.js';
import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { UserRole } from '../types/index.js';

// ============================================
// CONSTANTES
// ============================================

// Categorias de controles (4 temas)
const CATEGORIES = [
  { key: 'Controles Organizacionais', label: 'Controles Organizacionais', altKeys: ['Organizacionais'] },
  { key: 'Controles de Pessoas', label: 'Controles de Pessoas', altKeys: ['Pessoas'] },
  { key: 'Controles Físicos', label: 'Controles Físicos', altKeys: ['Físicos'] },
  { key: 'Controles Tecnológicos', label: 'Controles Tecnológicos', altKeys: ['Tecnológicos'] },
];

// Capacidades Operacionais (15 capacidades)
const CAPABILITIES = [
  { key: 'Governança', label: 'Governança', altKeys: ['Governança', 'Governança_e_ecossistema'] },
  { key: 'Gestão de ativos', label: 'Gestão de Ativos', altKeys: ['Gestão de ativos', 'Gestão_de_ativos'] },
  { key: 'Proteção da informação', label: 'Proteção da Informação', altKeys: ['Proteção da informação', 'Proteção_da_informação'] },
  { key: 'Gestão de identidade e acesso', label: 'Gestão de Identidade e Acesso', altKeys: ['Gestão de identidade e acesso', 'Gestão_de_identidade_e_acesso'] },
  { key: 'Segurança nas relações com fornecedores', label: 'Segurança nas Relações com Fornecedores', altKeys: ['Segurança nas relações com fornecedores', 'Segurança_nas_relações_com_fornecedores'] },
  { key: 'Gestão de evento de segurança da informação', label: 'Gestão de Eventos de SI', altKeys: ['Gestão de incidentes', 'Gestão de eventos de SI', 'Gestão_de_evento_de_segurança_da_informação'] },
  { key: 'Gestão de ameaças e vulnerabilidades', label: 'Gestão de Ameaças e Vulnerabilidades', altKeys: ['Gestão de ameaças e vulnerabilidades', 'Gestão_de_ameaças_e_vulnerabilidades'] },
  { key: 'Gestão de continuidade do negócio', label: 'Gestão de Continuidade do Negócio', altKeys: ['Gestão de continuidade', 'Continuidade', 'Gestão_de_continuidade_do_negócio'] },
  { key: 'Segurança física', label: 'Segurança Física', altKeys: ['Segurança física', 'Segurança_física'] },
  { key: 'Desenvolvimento seguro', label: 'Desenvolvimento Seguro', altKeys: ['Desenvolvimento seguro', 'Segurança de aplicações', 'Segurança_de_aplicações'] },
  { key: 'Segurança de redes', label: 'Segurança de Redes', altKeys: ['Gestão de redes', 'Segurança de sistemas e rede', 'Segurança_de_sistemas_e_rede', 'Segurança de sistemas'] },
  { key: 'Monitoramento e análise', label: 'Monitoramento e Análise', altKeys: ['Monitoramento e análise', 'Monitoramento_e_análise'] },
  { key: 'Gestão de pessoas', label: 'Segurança em Recursos Humanos', altKeys: ['Gestão de pessoas', 'Segurança em recursos humanos', 'Segurança_em_recursos_humanos'] },
  { key: 'Gestão de criptografia', label: 'Gestão de Criptografia', altKeys: ['Gestão de criptografia', 'Gestão_de_criptografia'] },
  { key: 'Garantia de segurança da informação', label: 'Garantia de SI', altKeys: ['Garantia de SI', 'Garantia de segurança da informação', 'Garantia_de_segurança_da_informação'] },
];

// Mapeamento de status para nível de maturidade
const STATUS_MAP: Record<string, number> = {
  'Implementado': 2,
  'Parcialmente implementado': 1,
  'Não implementado': 0,
  'Não se aplica': -1,
};

// ============================================
// TIPOS
// ============================================

export interface CategoryData {
  name: string;
  total: number;
  implemented: number;
  partial: number;
  notImpl: number;
  na: number;
  pImpl: number;
  pPartial: number;
  pNot: number;
  pNa: number;
}

export interface CategoryResult {
  categories: CategoryData[];
  totals: {
    implemented: number;
    partial: number;
    notImpl: number;
    na: number;
    total: number;
  };
}

export interface CapabilityData {
  name: string;
  key: string;
  total: number;
  implemented: number;
  partial: number;
  notImpl: number;
  aderente: number;
  naoAderente: number;
}

export interface CapabilityResult {
  capabilities: CapabilityData[];
  totals: {
    implemented: number;
    partial: number;
    notImpl: number;
    total: number;
  };
  totalAderente: number;
  totalNaoAderente: number;
  radarData: Array<{
    subject: string;
    fullLabel: string;
    Implementado: number;
    Recomendado: number;
  }>;
}

export interface ResultadosData {
  categorizacao: CategoryResult;
  capacidades: CapabilityResult;
}

// ============================================
// SERVIÇO
// ============================================

export class ReportResultService {
  /**
   * Obter todos os dados de resultados consolidados
   */
  static async getResultadosData(companyId: string): Promise<ResultadosData> {
    try {
      logger.info(`📊 Buscando dados de resultados para empresa: ${companyId}`);

      // Buscar todos os controles da empresa
      const controls = await Control.find({ companyId }).lean();
      logger.info(`📊 Total de controles encontrados: ${controls.length}`);

      // Buscar respostas da empresa
      const responses = await Response.find({ companyId }).lean();
      logger.info(`📊 Total de respostas encontradas: ${responses.length}`);

      // Buscar atribuições da empresa
      const assignments = await Assignment.find({ companyId }).lean();
      logger.info(`📊 Total de atribuições encontradas: ${assignments.length}`);

      // Buscar usuários da empresa
      const users = await User.find({ companyId, isActive: true }).select('_id');
      const userIds = users.map(u => u._id);

      // Construir mapa de respostas por controlId
      const responseMap = new Map<string, any>();
      responses.forEach(r => {
        const controlId = r.controlId?.toString();
        if (controlId) {
          responseMap.set(controlId, r);
        }
      });

      // Construir dados dos controles com status
      const controlsWithStatus = controls.map(control => {
        const response = responseMap.get(control._id.toString());
        let status = 'Não implementado';
        let maturityLevel = 0;

        if (response) {
          maturityLevel = response.maturityLevel;
          if (maturityLevel === 2) status = 'Implementado';
          else if (maturityLevel === 1) status = 'Parcialmente implementado';
          else if (maturityLevel === 0) status = 'Não implementado';
          else if (maturityLevel === -1) status = 'Não se aplica';
        }

        return {
          ...control,
          status,
          maturityLevel,
          response,
        };
      });

      // Calcular categorização
      const categorizacao = await this.calculateCategorization(controlsWithStatus);

      // Calcular capacidades operacionais
      const capacidades = await this.calculateCapabilities(controlsWithStatus);

      logger.info(`✅ Dados de resultados calculados com sucesso`);

      return {
        categorizacao,
        capacidades,
      };

    } catch (error) {
      logger.error('❌ Erro ao buscar dados de resultados:', error);
      throw error;
    }
  }

  /**
   * Calcular dados de categorização (4 temas)
   */
  private static async calculateCategorization(
    controls: any[]
  ): Promise<CategoryResult> {
    const categoryData = CATEGORIES.map(cat => {
      // Filtrar controles que pertencem à categoria
      const filtered = controls.filter(c => {
        const tipos = c.tiposDeControles || c.tipoDeControle || [];
        let tiposArray = Array.isArray(tipos) ? tipos : [tipos];
        const allKeys = [cat.key, ...(cat.altKeys || [])];
        return tiposArray.some((t: string) => allKeys.includes(t));
      });

      const total = filtered.length;
      const implemented = filtered.filter(c => c.status === 'Implementado').length;
      const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
      const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
      const na = filtered.filter(c => c.status === 'Não se aplica').length;

      return {
        name: cat.label,
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

    const totals = categoryData.reduce((acc, c) => ({
      implemented: acc.implemented + c.implemented,
      partial: acc.partial + c.partial,
      notImpl: acc.notImpl + c.notImpl,
      na: acc.na + c.na,
      total: acc.total + c.total,
    }), { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 });

    return { categories: categoryData, totals };
  }

  /**
   * Calcular dados de capacidades operacionais (15 capacidades)
   */
  private static async calculateCapabilities(
    controls: any[]
  ): Promise<CapabilityResult> {
    const capData = CAPABILITIES.map(cap => {
      // Filtrar controles que pertencem à capacidade
      const filtered = controls.filter(c => {
        const capacidades = c.capacidadesOperacionais || [];
        if (!Array.isArray(capacidades)) return false;
        
        const allKeys = [cap.key, ...(cap.altKeys || [])];
        return capacidades.some((capStr: string) => {
          const cleanStr = capStr.replace(/#/g, '').trim();
          return allKeys.includes(cleanStr) || 
                 allKeys.map(k => k.replace(/ /g, '_')).includes(cleanStr);
        });
      });

      const total = filtered.length;
      const implemented = filtered.filter(c => c.status === 'Implementado').length;
      const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
      const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
      const na = filtered.filter(c => c.status === 'Não se aplica').length;
      const totalValidos = total - na;
      const aderente = totalValidos > 0 ? Math.round((implemented / totalValidos) * 100) : 0;
      const naoAderente = totalValidos > 0 ? Math.round(((partial + notImpl) / totalValidos) * 100) : 0;

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

    // Dados para o gráfico Radar
    const radarData = capData.map(c => ({
      subject: c.name.length > 28 ? c.name.substring(0, 28) + '…' : c.name,
      fullLabel: c.name,
      Implementado: c.aderente,
      Recomendado: 100,
    }));

    return {
      capabilities: capData,
      totals,
      totalAderente,
      totalNaoAderente,
      radarData,
    };
  }
}

export default ReportResultService;