import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { Response } from '../models/Response.js';
import { Control } from '../models/Control.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export class DashboardService {
  /**
   * Obter dados de maturidade de uma empresa
   */
  static async getCompanyMaturity(
    companyId: string,
    filters?: {
      userId?: string;
    }
  ) {
    // Verificar se a empresa existe
    const company = await Company.findById(companyId);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    // Buscar usuários da empresa
    const userFilter: any = { companyId, isActive: true };
    if (filters?.userId) {
      userFilter._id = new mongoose.Types.ObjectId(filters.userId);
    }

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    if (userIds.length === 0) {
      return this.getEmptyMaturityData();
    }

    // Buscar todas as atribuições dos usuários
    const assignments = await Assignment.find({
      userId: { $in: userIds }
    }).populate('controlId').lean();

    // Buscar todas as respostas dos usuários
    const responses = await Response.find({
      userId: { $in: userIds }
    }).lean();

    // Criar mapa de respostas por assignmentId
    const responseMap = new Map();
    responses.forEach(r => {
      responseMap.set(r.assignmentId.toString(), r);
    });

    // Mapear status de cada controle com base no maturityLevel
    const controlsWithStatus = assignments.map(a => {
      const response = responseMap.get(a._id.toString());
      const control = a.controlId as any;

      // Mapear maturityLevel para status
      let status = 'Não implementado';
      if (response) {
        switch (response.maturityLevel) {
          case '2':
            status = 'Implementado';
            break;
          case '1':
            status = 'Parcialmente implementado';
            break;
          case '0':
            status = 'Não implementado';
            break;
          case 'N/A':
            status = 'Não se aplica';
            break;
          default:
            status = 'Não implementado';
        }
      }

      return {
        controlId: control?._id,
        control: control,
        status: status,
        maturityLevel: response?.maturityLevel || null,
        response: response || null,
        assignedBy: a.assignedBy,
        assignedAt: a.assignedAt,
      };
    });

    // Buscar todos os controles da empresa (atribuídos ou não)
    const allControls = await Control.find({
      _id: { $in: company.assignedControls || [] }
    }).lean();

    // Mapear status para todos os controles
    const controlStatusMap = new Map();
    allControls.forEach(c => {
      const assigned = controlsWithStatus.find(
        a => a.controlId?.toString() === c._id.toString()
      );
      controlStatusMap.set(c._id.toString(), {
        control: c,
        status: assigned?.status || 'Não implementado',
        maturityLevel: assigned?.maturityLevel || null,
        response: assigned?.response || null,
      });
    });

    const controls = Array.from(controlStatusMap.values());

    // CORREÇÃO: Calcular summary com base nos controles
    const summary = this.calculateMaturityStats({ controls });

    return {
      company: {
        id: company._id,
        name: company.name,
      },
      summary: {
        totalControls: controls.length,
        Implementado: summary.statusCounts.Implementado || 0,
        Parcialmente: summary.statusCounts['Parcialmente implementado'] || 0,
        NaoImplementado: summary.statusCounts['Não implementado'] || 0,
        NaoSeAplica: summary.statusCounts['Não se aplica'] || 0,
      },
      totalControls: controls.length,
      controls: controls,
      assignments: controlsWithStatus,
      users: users.length,
    };
  }

  /**
   * Obter dados vazios (quando não há usuários)
   */
  private static getEmptyMaturityData() {
    return {
      company: { id: null, name: null },
      summary: {
        totalControls: 0,
        Implementado: 0,
        Parcialmente: 0,
        NaoImplementado: 0,
        NaoSeAplica: 0,
      },
      totalControls: 0,
      controls: [],
      assignments: [],
      users: 0,
    };
  }

  /**
   * Calcular estatísticas de maturidade
   */
  static calculateMaturityStats(maturityData: any) {
    const controls = maturityData.controls || [];
    const total = controls.length;

    const statusCounts = {
      Implementado: 0,
      'Parcialmente implementado': 0,
      'Não implementado': 0,
      'Não se aplica': 0,
    };

    controls.forEach((c: any) => {
      const status = c.status || 'Não implementado';
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    const percentages = {
      Implementado: total > 0 ? Math.round((statusCounts.Implementado / total) * 100) : 0,
      Parcialmente: total > 0 ? Math.round((statusCounts['Parcialmente implementado'] / total) * 100) : 0,
      NaoImplementado: total > 0 ? Math.round((statusCounts['Não implementado'] / total) * 100) : 0,
      NaoSeAplica: total > 0 ? Math.round((statusCounts['Não se aplica'] / total) * 100) : 0,
    };

    return {
      total,
      statusCounts,
      percentages,
      maturityLevels: this.calculateMaturityLevels(controls),
    };
  }

  /**
   * Calcular níveis de maturidade
   */
  private static calculateMaturityLevels(controls: any[]) {
    const levels = {
      'N/A': 0,
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    controls.forEach(c => {
      const level = c.maturityLevel || 'N/A';
      if (level in levels) {
        levels[level as keyof typeof levels]++;
      }
    });

    return levels;
  }

  /**
   * Agrupar controles por domínio
   */
  static groupByDomain(controls: any[]) {
    const domains = ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'];
    const result: any = {};

    domains.forEach(d => {
      const filtered = controls.filter(c => {
        const control = c.control || c;
        const dominios = control?.dominioDeSI || [];
        if (Array.isArray(dominios)) {
          return dominios.includes(d);
        }
        return dominios === d;
      });
      result[d] = {
        total: filtered.length,
        implemented: filtered.filter(c => c.status === 'Implementado').length,
        partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
        notImpl: filtered.filter(c => c.status === 'Não implementado').length,
        na: filtered.filter(c => c.status === 'Não se aplica').length,
      };
    });

    return result;
  }

  /**
   * Agrupar controles por categoria - CORRIGIDO
   */
  static groupByCategory(controls: any[]) {
    const categories = [
      'Controles Organizacionais',
      'Controles de Pessoas',
      'Controles Físicos',
      'Controles Tecnológicos'
    ];
    const result: any = {};

    categories.forEach(cat => {
      const filtered = controls.filter(c => {
        const control = c.control || c;
        const tipos = control?.tiposDeControles || control?.tipoDeControle || [];
        if (Array.isArray(tipos)) {
          return tipos.includes(cat);
        }
        return tipos === cat;
      });
      result[cat] = {
        total: filtered.length,
        implemented: filtered.filter(c => c.status === 'Implementado').length,
        partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
        notImpl: filtered.filter(c => c.status === 'Não implementado').length,
        na: filtered.filter(c => c.status === 'Não se aplica').length,
      };
    });

    return result;
  }

  /**
   * Agrupar controles por tipo - CORRIGIDO (evita dupla contagem)
   */
  static groupByType(controls: any[]) {
    const types = ['Preventivo', 'Detectivo', 'Corretivo'];
    const result: any = {};

    types.forEach(t => {
      // CORREÇÃO: Usar Set para garantir contagem única
      const uniqueControlIds = new Set();
      
      controls.forEach(c => {
        const control = c.control || c;
        const tipoDeControle = control?.tipoDeControle || [];
        
        let hasType = false;
        if (Array.isArray(tipoDeControle)) {
          hasType = tipoDeControle.includes(t);
        } else {
          hasType = tipoDeControle === t;
        }
        
        if (hasType) {
          const id = control?._id?.toString() || c.controlId?.toString();
          if (id) {
            uniqueControlIds.add(id);
          }
        }
      });

      const filtered = controls.filter(c => {
        const control = c.control || c;
        const id = control?._id?.toString() || c.controlId?.toString();
        return uniqueControlIds.has(id);
      });

      result[t] = {
        total: filtered.length,
        implemented: filtered.filter(c => c.status === 'Implementado').length,
        partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
        notImpl: filtered.filter(c => c.status === 'Não implementado').length,
        na: filtered.filter(c => c.status === 'Não se aplica').length,
      };
    });

    return result;
  }

  /**
   * Agrupar controles por conceito cibernético
   */
  static groupByCyberConcept(controls: any[]) {
    const concepts = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'];
    const result: any = {};

    concepts.forEach(concept => {
      const filtered = controls.filter(c => {
        const control = c.control || c;
        const conceitos = control?.conceitoDeSegurancaCibernetica || [];
        if (Array.isArray(conceitos)) {
          return conceitos.includes(concept);
        }
        return conceitos === concept;
      });
      result[concept] = {
        total: filtered.length,
        implemented: filtered.filter(c => c.status === 'Implementado').length,
        partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
        notImpl: filtered.filter(c => c.status === 'Não implementado').length,
        na: filtered.filter(c => c.status === 'Não se aplica').length,
      };
    });

    return result;
  }

  /**
   * Agrupar controles por capacidade operacional
   */
  static groupByCapability(controls: any[]) {
    const capabilities = [
      'Governança',
      'Gestão de ativos',
      'Proteção da informação',
      'Gestão de identidade e acesso',
      'Segurança nas relações com fornecedores',
      'Gestão de evento de segurança da informação',
      'Gestão de ameaças e vulnerabilidades',
      'Gestão de continuidade do negócio',
      'Segurança física',
      'Desenvolvimento seguro',
      'Gestão de redes',
      'Monitoramento e análise',
      'Gestão de pessoas',
      'Gestão de criptografia',
      'Garantia de segurança da informação',
    ];
    const result: any = {};

    capabilities.forEach(cap => {
      const filtered = controls.filter(c => {
        const control = c.control || c;
        const capacidades = control?.capacidadesOperacionais || [];
        if (Array.isArray(capacidades)) {
          return capacidades.includes(cap);
        }
        return capacidades === cap;
      });
      result[cap] = {
        total: filtered.length,
        implemented: filtered.filter(c => c.status === 'Implementado').length,
        partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
        notImpl: filtered.filter(c => c.status === 'Não implementado').length,
        na: filtered.filter(c => c.status === 'Não se aplica').length,
        aderente: filtered.length > 0 
          ? Math.round((filtered.filter(c => c.status === 'Implementado').length / filtered.length) * 100)
          : 0,
      };
    });

    return result;
  }
}