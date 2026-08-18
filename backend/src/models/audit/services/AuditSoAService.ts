import { AuditSoA, IAuditSoA, IAuditSoAControl } from '../models/AuditSoA';
import { AuditQuestion } from '../models/AuditQuestion';

export class AuditSoAService {
  /**
   * Criar nova Declaração de Aplicabilidade
   */
  async create(data: Partial<IAuditSoA>): Promise<IAuditSoA> {
    const soa = new AuditSoA(data);
    
    // Inicializar controles a partir das perguntas existentes
    if (!data.controls || data.controls.length === 0) {
      const questions = await AuditQuestion.find().distinct('controlId');
      const controls = questions.map((controlId: string) => ({
        clause: controlId,
        title: this.getControlTitle(controlId),
        objective: this.getControlObjective(controlId),
        motivators: {
          business: false,
          risk: false,
          legal: false,
          contract: false,
        },
        applicable: true,
        implemented: false,
      }));
      soa.controls = controls;
    }
    
    // ✅ CORREÇÃO: Verificar se o método existe antes de chamar
    if (typeof soa.updateStatistics === 'function') {
      soa.updateStatistics();
    }
    return await soa.save();
  }

  /**
   * Buscar SoA por ID
   */
  async findById(id: string): Promise<IAuditSoA | null> {
    return await AuditSoA.findById(id).lean();
  }

  /**
   * Buscar SoA por empresa
   */
  async findByCompany(companyId: string, options?: { status?: string }): Promise<IAuditSoA[]> {
    const query: any = { companyId };
    if (options?.status) {
      query.status = options.status;
    }
    return await AuditSoA.find(query).sort({ version: -1 }).lean();
  }

  /**
   * Buscar SoA ativa por empresa
   */
  async findActiveByCompany(companyId: string): Promise<IAuditSoA | null> {
    return await AuditSoA.findOne({ companyId, status: 'approved' })
      .sort({ version: -1 })
      .lean();
  }

  /**
   * Atualizar SoA
   */
  async update(id: string, data: Partial<IAuditSoA>): Promise<IAuditSoA | null> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    Object.assign(soa, data);
    // ✅ CORREÇÃO: Verificar se o método existe antes de chamar
    if (typeof soa.updateStatistics === 'function') {
      soa.updateStatistics();
    }
    soa.updatedAt = new Date();
    await soa.save();
    
    return soa.toObject();
  }

  /**
   * Atualizar um controle específico da SoA
   */
  async updateControl(
    id: string,
    clause: string,
    data: Partial<IAuditSoAControl>
  ): Promise<IAuditSoA | null> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    const controlIndex = soa.controls.findIndex(c => c.clause === clause);
    if (controlIndex === -1) {
      throw new Error(`Controle ${clause} não encontrado`);
    }
    
    Object.assign(soa.controls[controlIndex], data);
    soa.markModified('controls');
    // ✅ CORREÇÃO: Verificar se o método existe antes de chamar
    if (typeof soa.updateStatistics === 'function') {
      soa.updateStatistics();
    }
    soa.updatedAt = new Date();
    await soa.save();
    
    return soa.toObject();
  }

  /**
   * Aprovar SoA
   */
  async approve(id: string, approvedBy: string): Promise<IAuditSoA | null> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    soa.status = 'approved';
    soa.approvedBy = approvedBy;
    soa.approvedAt = new Date();
    soa.updatedAt = new Date();
    await soa.save();
    
    return soa.toObject();
  }

  /**
   * Arquivar SoA
   */
  async archive(id: string): Promise<IAuditSoA | null> {
    return await AuditSoA.findByIdAndUpdate(
      id,
      {
        status: 'archived',
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Excluir SoA (soft delete)
   */
  async delete(id: string): Promise<IAuditSoA | null> {
    return await AuditSoA.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Obter estatísticas da SoA
   */
  async getStatistics(id: string): Promise<any> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    return {
      total: soa.statistics?.total || 0,
      applicable: soa.statistics?.applicable || 0,
      notApplicable: soa.statistics?.notApplicable || 0,
      implemented: soa.statistics?.implemented || 0,
      notImplemented: soa.statistics?.notImplemented || 0,
      byCategory: soa.statistics?.byCategory || { organizational: 0, people: 0, physical: 0, technological: 0 },
      implementationRate: soa.statistics?.applicable > 0 
        ? (soa.statistics.implemented / soa.statistics.applicable) * 100 
        : 0,
    };
  }

  /**
   * Exportar SoA para formato de planilha
   */
  async exportToSpreadsheet(id: string): Promise<any> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    return soa.controls.map(control => ({
      'Cláusula ISO 27002': control.clause,
      'Título': control.title,
      'Objetivo de controle': control.objective,
      'Motivador - Negócio': control.motivators.business ? 'Sim' : 'Não',
      'Motivador - Risco': control.motivators.risk ? 'Sim' : 'Não',
      'Motivador - Jurídico': control.motivators.legal ? 'Sim' : 'Não',
      'Motivador - Contrato': control.motivators.contract ? 'Sim' : 'Não',
      'É aplicável?': control.applicable ? 'Sim' : 'Não',
      'Data da última avaliação': control.lastAssessmentDate?.toLocaleDateString() || '',
      'Por que não é aplicável?': control.justification || '',
      'Implementado?': control.implemented ? 'Sim' : 'Não',
      'Data de implementação': control.implementationDate?.toLocaleDateString() || '',
      'Responsável': control.responsible || '',
      'Evidência': control.evidence || '',
    }));
  }

  /**
   * Obter título do controle (auxiliar)
   */
  private getControlTitle(clause: string): string {
    const titles: Record<string, string> = {
      '5.1': 'Políticas de segurança da informação',
      '5.2': 'Papéis e responsabilidades pela segurança da informação',
      '5.3': 'Segregação de funções',
      '5.4': 'Responsabilidades da direção',
      '5.5': 'Contato com autoridades',
      '5.6': 'Contato com grupos de interesse especial',
      '5.7': 'Inteligência de ameaças',
      '5.8': 'Segurança da informação no gerenciamento de projetos',
      '5.9': 'Inventário de informações e outros ativos associados',
      '5.10': 'Uso aceitável de informações e outros ativos associados',
      '5.11': 'Devolução de ativos',
      '5.12': 'Classificação das informações',
      '5.13': 'Rotulagem de informações',
      '5.14': 'Transferência de informação',
      '5.15': 'Controle de acesso',
      '5.16': 'Gestão de identidade',
      '5.17': 'Informações de autenticação',
      '5.18': 'Direitos de acesso',
      '5.19': 'Segurança da informação no relacionamento com fornecedores',
      '5.20': 'Abordando a segurança da informação nos acordos de fornecedores',
      '5.21': 'Gerenciando a segurança da informação na cadeia de suprimentos de TIC',
      '5.22': 'Monitoramento, revisão e gerenciamento de mudanças de serviços de fornecedores',
      '5.23': 'Segurança da informação para uso de serviços em nuvem',
      '5.24': 'Planejamento e preparação de gerenciamento de incidentes',
      '5.25': 'Avaliação e decisão sobre eventos de segurança da informação',
      '5.26': 'Resposta a incidentes de segurança da informação',
      '5.27': 'Aprendendo com incidentes de segurança da informação',
      '5.28': 'Coleta de provas',
      '5.29': 'Segurança da informação durante a interrupção',
      '5.30': 'Prontidão de TIC para continuidade de negócios',
      '5.31': 'Requisitos legais, estatutários, regulamentares e contratuais',
      '5.32': 'Direito de propriedade intelectual',
      '5.33': 'Proteção de registros',
      '5.34': 'Privacidade e proteção de PII',
      '5.35': 'Revisão independente de segurança da informação',
      '5.36': 'Conformidade com políticas, regras e padrões',
      '5.37': 'Procedimentos operacionais documentados',
      '6.1': 'Seleção',
      '6.2': 'Termos e condições de contratação',
      '6.3': 'Conscientização, educação e treinamento',
      '6.4': 'Processo disciplinar',
      '6.5': 'Responsabilidades após encerramento ou mudança da contratação',
      '6.6': 'Acordos de confidencialidade ou não divulgação',
      '6.7': 'Trabalho remoto',
      '6.8': 'Relato de eventos de segurança da informação',
      '7.1': 'Perímetros de segurança física',
      '7.2': 'Entrada física',
      '7.3': 'Segurança de escritórios, salas e instalações',
      '7.4': 'Monitoramento de segurança física',
      '7.5': 'Proteção contra ameaças físicas e ambientais',
      '7.6': 'Trabalho em áreas seguras',
      '7.7': 'Mesa limpa e tela limpa',
      '7.8': 'Localização e proteção de equipamentos',
      '7.9': 'Segurança de ativos fora das instalações',
      '7.10': 'Mídia de armazenamento',
      '7.11': 'Serviços de infraestrutura',
      '7.12': 'Segurança do cabeamento',
      '7.13': 'Manutenção de equipamentos',
      '7.14': 'Descarte seguro ou reutilização de equipamentos',
      '8.1': 'Dispositivos endpoint do usuário',
      '8.2': 'Direitos de acesso privilegiado',
      '8.3': 'Restrição de acesso à informação',
      '8.4': 'Acesso ao código-fonte',
      '8.5': 'Autenticação segura',
      '8.6': 'Gestão de capacidade',
      '8.7': 'Proteção contra malware',
      '8.8': 'Gestão de vulnerabilidades técnicas',
      '8.9': 'Gestão de configuração',
      '8.10': 'Exclusão de informações',
      '8.11': 'Mascaramento de dados',
      '8.12': 'Prevenção de vazamento de dados',
      '8.13': 'Backup das informações',
      '8.14': 'Redundância dos recursos de processamento',
      '8.15': 'Log',
      '8.16': 'Atividades de monitoramento',
      '8.17': 'Sincronização do relógio',
      '8.18': 'Uso de programas utilitários privilegiados',
      '8.19': 'Instalação de software em sistemas operacionais',
      '8.20': 'Segurança de redes',
      '8.21': 'Segurança dos serviços de rede',
      '8.22': 'Segregação de redes',
      '8.23': 'Filtragem da web',
      '8.24': 'Uso de criptografia',
      '8.25': 'Ciclo de vida de desenvolvimento seguro',
      '8.26': 'Requisitos de segurança da aplicação',
      '8.27': 'Princípios de arquitetura e engenharia de sistemas seguros',
      '8.28': 'Codificação segura',
      '8.29': 'Testes de segurança em desenvolvimento e aceitação',
      '8.30': 'Desenvolvimento terceirizado',
      '8.31': 'Separação dos ambientes de desenvolvimento, teste e produção',
      '8.32': 'Gestão de mudanças',
      '8.33': 'Informações de teste',
      '8.34': 'Proteção de sistemas de informação durante os testes de auditoria',
    };
    return titles[clause] || clause;
  }

  /**
   * Obter objetivo do controle (auxiliar)
   */
  private getControlObjective(clause: string): string {
    const objectives: Record<string, string> = {
      // ============================================================
      // 5. CONTROLES ORGANIZACIONAIS
      // ============================================================
      '5.1': 'A política de segurança da informação e as políticas específicas de tópicos devem ser definidas, aprovadas pela administração, publicadas, comunicadas e reconhecidas pelo pessoal relevante e pelas partes interessadas relevantes e revisadas em intervalos planejados e se ocorrerem mudanças significativas.',
      '5.2': 'As funções e responsabilidades de segurança da informação devem ser definidas e alocadas de acordo com as necessidades da organização.',
      '5.3': 'Deveres conflitantes e áreas de responsabilidade conflitantes devem ser segregados.',
      '5.4': 'A administração deve exigir que todo o pessoal aplique a segurança da informação de acordo com a política de segurança da informação estabelecida, políticas e procedimentos específicos de tópicos da organização.',
      '5.5': 'A organização deve estabelecer e manter contato com as autoridades relevantes.',
      '5.6': 'A organização deve estabelecer e manter contato com grupos de interesse especial ou outros fóruns especializados em segurança e associações profissionais.',
      '5.7': 'As informações relacionadas às ameaças à segurança da informação devem ser coletadas e analisadas para produzir inteligência sobre ameaças.',
      '5.8': 'A segurança da informação deve ser integrada ao gerenciamento de projetos.',
      '5.9': 'Um inventário de informações e outros ativos associados, incluindo proprietários, deve ser desenvolvido e mantido.',
      '5.10': 'Regras para o uso aceitável e procedimentos para lidar com informações e outros ativos associados devem ser identificados, documentados e implementados.',
      '5.11': 'O pessoal e outras partes interessadas, conforme apropriado, devem devolver todos os ativos da organização em sua posse após a mudança ou rescisão de seu emprego, contrato ou acordo.',
      '5.12': 'As informações devem ser classificadas de acordo com as necessidades de segurança da informação da organização com base na confidencialidade, integridade, disponibilidade e requisitos relevantes das partes interessadas.',
      '5.13': 'Convém que um conjunto apropriado de procedimentos para rotulagem de informações seja desenvolvido e implementado de acordo com o esquema de classificação de informações adotado pela organização.',
      '5.14': 'Regras, procedimentos ou acordos de transferência de informações devem estar em vigor para todos os tipos de instalações de transferência dentro da organização e entre a organização e outras partes.',
      '5.15': 'As regras para controlar o acesso físico e lógico às informações e outros ativos associados devem ser estabelecidas e implementadas com base nos requisitos de segurança do negócio e da informação.',
      '5.16': 'O ciclo de vida completo das identidades deve ser gerenciado.',
      '5.17': 'A alocação e o gerenciamento das informações de autenticação devem ser controlados por um processo de gerenciamento, incluindo o aconselhamento do pessoal sobre o manuseio adequado das informações de autenticação.',
      '5.18': 'Os direitos de acesso a informações e outros ativos associados devem ser provisionados, revisados, modificados e removidos de acordo com a política de tópicos específicos da organização e as regras de controle de acesso.',
      '5.19': 'Processos e procedimentos devem ser definidos e implementados para gerenciar os riscos de segurança da informação associados ao uso de produtos ou serviços do fornecedor.',
      '5.20': 'Requisitos relevantes de segurança da informação devem ser estabelecidos e acordados com cada fornecedor com base no tipo de relacionamento com o fornecedor.',
      '5.21': 'Processos e procedimentos devem ser definidos e implementados para gerenciar os riscos de segurança da informação associados à cadeia de fornecimento de produtos e serviços de TIC.',
      '5.22': 'A organização deve monitorar, revisar, avaliar e gerenciar regularmente as mudanças nas práticas de segurança da informação do fornecedor e na prestação de serviços.',
      '5.23': 'Os processos de aquisição, uso, gerenciamento e saída dos serviços em nuvem devem ser estabelecidos de acordo com os requisitos de segurança da informação da organização.',
      '5.24': 'Convém que a organização planeje e se prepare para gerenciar incidentes de segurança da informação, definindo, estabelecendo e comunicando processos, funções e responsabilidades de gerenciamento de incidentes de segurança da informação.',
      '5.25': 'A organização deve avaliar os eventos de segurança da informação e decidir se eles devem ser categorizados como incidentes de segurança da informação.',
      '5.26': 'Os incidentes de segurança da informação devem ser respondidos de acordo com os procedimentos documentados.',
      '5.27': 'O conhecimento adquirido com os incidentes de segurança da informação deve ser usado para fortalecer e melhorar os controles de segurança da informação.',
      '5.28': 'A organização deve estabelecer e implementar procedimentos para a identificação, coleta, aquisição e preservação de evidências relacionadas a eventos de segurança da informação.',
      '5.29': 'A organização deve planejar como manter a segurança da informação em um nível apropriado durante a interrupção.',
      '5.30': 'A prontidão de TIC deve ser planejada, implementada, mantida e testada com base nos objetivos de continuidade de negócios e nos requisitos de continuidade de TIC.',
      '5.31': 'Os requisitos legais, estatutários, regulamentares e contratuais relevantes para a segurança da informação e a abordagem da organização para atender a esses requisitos devem ser identificados, documentados e mantidos atualizados.',
      '5.32': 'A organização deve implementar procedimentos apropriados para proteger os direitos de propriedade intelectual.',
      '5.33': 'Os registros devem ser protegidos contra perda, destruição, falsificação, acesso não autorizado e liberação não autorizada.',
      '5.34': 'A organização deve identificar e atender aos requisitos relativos à preservação da privacidade e proteção de PII de acordo com as leis e regulamentos aplicáveis e os requisitos contratuais.',
      '5.35': 'A abordagem da organização para gerenciar a segurança da informação e sua implementação, incluindo pessoas, processos e tecnologias, deve ser revisada de forma independente em intervalos planejados ou quando ocorrerem mudanças significativas.',
      '5.36': 'A conformidade com a política de segurança da informação da organização, políticas específicas de tópicos, regras e padrões deve ser revisada regularmente.',
      '5.37': 'Os procedimentos operacionais para instalações de processamento de informações devem ser documentados e disponibilizados ao pessoal que deles necessita.',

      // ============================================================
      // 6. CONTROLES DE PESSOAS
      // ============================================================
      '6.1': 'As verificações de antecedentes de todos os candidatos a se tornarem funcionários devem ser realizadas antes de ingressar na organização e de forma contínua, levando em consideração as leis, regulamentos e ética aplicáveis, e ser proporcionais aos requisitos do negócio, à classificação das informações a serem acessadas e aos riscos percebidos.',
      '6.2': 'Os acordos contratuais de trabalho devem indicar as responsabilidades do pessoal e da organização pela segurança da informação.',
      '6.3': 'O pessoal da organização e as partes interessadas relevantes devem receber conscientização, educação e treinamento de segurança da informação apropriados e atualizações regulares da política de segurança da informação da organização, políticas e procedimentos específicos de tópicos, conforme relevante para sua função de trabalho.',
      '6.4': 'Um processo disciplinar deve ser formalizado e comunicado para tomar medidas contra o pessoal e outras partes interessadas relevantes que cometeram uma violação da política de segurança da informação.',
      '6.5': 'As responsabilidades e deveres de segurança da informação que permanecem válidos após a rescisão ou mudança de emprego devem ser definidas, aplicadas e comunicadas ao pessoal relevante e outras partes interessadas.',
      '6.6': 'Convém que os acordos de confidencialidade ou não divulgação que reflitam as necessidades da organização para a proteção de informações sejam identificados, documentados, revisados regularmente e assinados pelo pessoal e outras partes interessadas relevantes.',
      '6.7': 'As medidas de segurança devem ser implementadas quando o pessoal estiver trabalhando remotamente para proteger as informações acessadas, processadas ou armazenadas fora das instalações da organização.',
      '6.8': 'Convém que a organização forneça um mecanismo para o pessoal relatar eventos de segurança da informação observados ou suspeitos por meio de canais apropriados em tempo hábil.',

      // ============================================================
      // 7. CONTROLES FÍSICOS
      // ============================================================
      '7.1': 'Os perímetros de segurança devem ser definidos e usados para proteger as áreas que contêm informações e outros ativos associados.',
      '7.2': 'As áreas seguras devem ser protegidas por controles de entrada e pontos de acesso apropriados.',
      '7.3': 'A segurança física para escritórios, salas e instalações deve ser projetada e implementada.',
      '7.4': 'As instalações devem ser continuamente monitoradas para acesso físico não autorizado.',
      '7.5': 'A proteção contra ameaças físicas e ambientais, como desastres naturais e outras ameaças físicas intencionais ou não intencionais à infraestrutura, deve ser projetada e implementada.',
      '7.6': 'Medidas de segurança para trabalhar em áreas seguras devem ser projetadas e implementadas.',
      '7.7': 'Regras claras de mesa para papéis e mídia de armazenamento removível e regras de tela clara para instalações de processamento de informações devem ser definidas e aplicadas de forma adequada.',
      '7.8': 'Os equipamentos devem estar localizados de forma segura e protegida.',
      '7.9': 'Os ativos externos devem ser protegidos.',
      '7.10': 'A mídia de armazenamento deve ser gerenciada ao longo de seu ciclo de vida de aquisição, uso, transporte e descarte de acordo com o esquema de classificação da organização e os requisitos de manuseio.',
      '7.11': 'As instalações de processamento de informações devem ser protegidas contra falhas de energia e outras interrupções causadas por falhas nas concessionárias de suporte.',
      '7.12': 'Os cabos que transportam energia, dados ou serviços de informação de suporte devem ser protegidos contra interceptação, interferência ou danos.',
      '7.13': 'Os equipamentos devem ser mantidos de forma correta para garantir a disponibilidade, integridade e confidencialidade das informações.',
      '7.14': 'Os itens do equipamento contendo mídia de armazenamento devem ser verificados para garantir que quaisquer dados confidenciais e software licenciado tenham sido removidos ou substituídos com segurança antes do descarte ou reutilização.',

      // ============================================================
      // 8. CONTROLES TECNOLÓGICOS
      // ============================================================
      '8.1': 'As informações armazenadas, processadas ou acessíveis por meio de dispositivos terminais do usuário devem ser protegidas.',
      '8.2': 'A alocação e uso de direitos de acesso privilegiado devem ser restritos e gerenciados.',
      '8.3': 'O acesso a informações e outros ativos associados deve ser restrito de acordo com a política específica de tópico estabelecida sobre controle de acesso.',
      '8.4': 'O acesso de leitura e gravação ao código-fonte, ferramentas de desenvolvimento e bibliotecas de software deve ser gerenciado adequadamente.',
      '8.5': 'Tecnologias e procedimentos de autenticação segura devem ser implementados com base nas restrições de acesso às informações e na política específica do tópico sobre controle de acesso.',
      '8.6': 'O uso de recursos deve ser monitorado e ajustado de acordo com os requisitos de capacidade atuais e esperados.',
      '8.7': 'A proteção contra malware deve ser implementada e suportada pela conscientização apropriada do usuário.',
      '8.8': 'Informações sobre vulnerabilidades técnicas dos sistemas de informação em uso devem ser obtidas, a exposição da organização a tais vulnerabilidades deve ser avaliada e medidas apropriadas devem ser tomadas.',
      '8.9': 'Configurações, incluindo configurações de segurança, de hardware, software, serviços e redes devem ser estabelecidas, documentadas, implementadas, monitoradas e revisadas.',
      '8.10': 'As informações armazenadas em sistemas de informação, dispositivos ou em qualquer outro meio de armazenamento devem ser excluídas quando não forem mais necessárias.',
      '8.11': 'O mascaramento de dados deve ser usado de acordo com a política específica de tópico da organização sobre controle de acesso e outras políticas específicas de tópico relacionadas e requisitos de negócios, levando em consideração a legislação aplicável.',
      '8.12': 'As medidas de prevenção de vazamento de dados devem ser aplicadas a sistemas, redes e quaisquer outros dispositivos que processem, armazenem ou transmitam informações confidenciais.',
      '8.13': 'Cópias de backup de informações, software e sistemas devem ser mantidas e testadas regularmente de acordo com a política de backup específica do tópico acordada.',
      '8.14': 'As facilidades de processamento de informações devem ser implementadas com redundância suficiente para atender aos requisitos de disponibilidade.',
      '8.15': 'Logs que registram atividades, exceções, falhas e outros eventos relevantes devem ser produzidos, armazenados, protegidos e analisados.',
      '8.16': 'Redes, sistemas e aplicativos devem ser monitorados quanto a comportamento anômalo e ações apropriadas devem ser tomadas para avaliar possíveis incidentes de segurança da informação.',
      '8.17': 'Os relógios dos sistemas de processamento de informações usados pela organização devem ser sincronizados com as fontes de tempo aprovadas.',
      '8.18': 'O uso de programas utilitários que podem ser capazes de substituir os controles do sistema e do aplicativo deve ser restrito e rigidamente controlado.',
      '8.19': 'Procedimentos e medidas devem ser implementados para gerenciar com segurança a instalação de software em sistemas operacionais.',
      '8.20': 'Redes e dispositivos de rede devem ser protegidos, gerenciados e controlados para proteger as informações em sistemas e aplicativos.',
      '8.21': 'Mecanismos de segurança, níveis de serviço e requisitos de serviço de serviços de rede devem ser identificados, implementados e monitorados.',
      '8.22': 'Grupos de serviços de informação, usuários e sistemas de informação devem ser segregados nas redes da organização.',
      '8.23': 'O acesso a sites externos deve ser gerenciado para reduzir a exposição a conteúdo malicioso.',
      '8.24': 'As regras para o uso efetivo da criptografia, incluindo o gerenciamento de chaves criptográficas, devem ser definidas e implementadas.',
      '8.25': 'Regras para o desenvolvimento seguro de software e sistemas devem ser estabelecidas e aplicadas.',
      '8.26': 'Os requisitos de segurança da informação devem ser identificados, especificados e aprovados ao desenvolver ou adquirir aplicativos.',
      '8.27': 'Princípios para engenharia de sistemas seguros devem ser estabelecidos, documentados, mantidos e aplicados a quaisquer atividades de desenvolvimento de sistemas de informação.',
      '8.28': 'Princípios de codificação segura devem ser aplicados ao desenvolvimento de software.',
      '8.29': 'Os processos de teste de segurança devem ser definidos e implementados no ciclo de vida do desenvolvimento.',
      '8.30': 'A organização deve dirigir, monitorar e revisar as atividades relacionadas ao desenvolvimento de sistemas terceirizados.',
      '8.31': 'Os ambientes de desenvolvimento, teste e produção devem ser separados e protegidos.',
      '8.32': 'As mudanças nas instalações de processamento de informações e nos sistemas de informação devem estar sujeitas a procedimentos de gerenciamento de mudanças.',
      '8.33': 'As informações de teste devem ser adequadamente selecionadas, protegidas e gerenciadas.',
      '8.34': 'Testes de auditoria e outras atividades de garantia envolvendo avaliação de sistemas operacionais devem ser planejados e acordados entre o testador e a gerência apropriada.',
    };
    return objectives[clause] || 'Controle ISO 27001:2022';
  }
}

export const auditSoAService = new AuditSoAService();