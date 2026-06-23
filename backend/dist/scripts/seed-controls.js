"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/seed-controls.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
const Control_js_1 = require("../models/Control.js");
const controlsData = [
    // ============================================
    // CONTROLES ORGANIZACIONAIS (5.1 - 5.37)
    // ============================================
    {
        id: "5.1",
        nome: "Políticas de segurança da informação",
        tipoDeControle: ["Preventivo"],
        controles: "A política de segurança da informação e as políticas específicas por tema devem ser definidas, aprovadas pela direção, publicadas, comunicadas e reconhecidas pelo pessoal pertinente e pelas partes interessadas pertinentes, e analisadas criticamente em intervalos planejados e quando ocorrerem mudanças significativas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Governança"],
        dominioDeSI: ["Governança e ecossistema", "Resiliência"]
    },
    {
        id: "5.2",
        nome: "Funções e responsabilidades de segurança da informação",
        tipoDeControle: ["Preventivo"],
        controles: "Papéis e responsabilidades pela segurança da informação devem ser definidos e alocados de acordo com as necessidades da organização.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Governança"],
        dominioDeSI: ["Governança e ecossistema", "Proteção", "Resiliência"]
    },
    {
        id: "5.3",
        nome: "Segregação de funções",
        tipoDeControle: ["Preventivo"],
        controles: "Funções conflitantes e áreas de responsabilidade devem ser segregadas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Governança", "Gestão de identidade e acesso"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "5.4",
        nome: "Responsabilidades da direção",
        tipoDeControle: ["Preventivo"],
        controles: "A direção deve requerer que todo o pessoal aplique a segurança da informação de acordo com a política da segurança da informação estabelecida, com as políticas específicas por tema e com os procedimentos da organização.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Governança"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "5.5",
        nome: "Contato com autoridades",
        tipoDeControle: ["Preventivo", "Corretivo"],
        controles: "A organização deve estabelecer e manter contato com as autoridades relevantes.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger", "Responder", "Restaurar"],
        capacidadesOperacionais: ["Governança"],
        dominioDeSI: ["Defesa", "Resiliência"]
    },
    {
        id: "5.6",
        nome: "Contato com grupos de interesses especial",
        tipoDeControle: ["Preventivo", "Corretivo"],
        controles: "A organização deve estabelecer e manter contato com grupos de interesse especial ou com outros fóruns de especialistas em segurança e associações profissionais.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Responder", "Restaurar"],
        capacidadesOperacionais: ["Governança"],
        dominioDeSI: ["Defesa"]
    },
    {
        id: "5.7",
        nome: "Inteligência de ameaças",
        tipoDeControle: ["Preventivo", "Detectivo", "Corretivo"],
        controles: "As informações relacionadas a ameaças à segurança da informação devem ser coletadas e analisadas para produzir inteligência de ameaças.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Detectar", "Responder"],
        capacidadesOperacionais: ["Gestão de ameaças e vulnerabilidades"],
        dominioDeSI: ["Defesa", "Resiliência"]
    },
    {
        id: "5.8",
        nome: "Segurança da informação no gerenciamento de projeto",
        tipoDeControle: ["Preventivo"],
        controles: "A segurança da informação deve ser integrada ao gerenciamento de projetos.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger"],
        capacidadesOperacionais: ["Governança"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.9",
        nome: "Inventário de informações e outros ativos associados",
        tipoDeControle: ["Preventivo"],
        controles: "Um inventário de informações e outros ativos associados, incluindo proprietários, deve ser desenvolvido e mantido.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Gestão de ativos"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.10",
        nome: "Uso aceitável de informações e outros ativos associados",
        tipoDeControle: ["Preventivo"],
        controles: "Regras para o uso aceitável e procedimentos para o manuseio de informações e outros ativos associados devem ser identificados, documentados e implementados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de ativos", "Proteção da informação"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.11",
        nome: "Devolução de ativos",
        tipoDeControle: ["Preventivo"],
        controles: "O pessoal e outras partes interessadas, conforme apropriado, devem devolver todos os ativos da organização em sua posse após a mudança ou o encerramento da contratação ou acordo.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de ativos"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "5.12",
        nome: "Classificação das informações",
        tipoDeControle: ["Preventivo"],
        controles: "As informações devem ser classificadas de acordo com as necessidades de segurança da informação da organização, com base na confidencialidade, integridade, disponibilidade e requisitos das partes interessadas relevantes.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Proteção da informação"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "5.13",
        nome: "Rotulagem de informações",
        tipoDeControle: ["Preventivo"],
        controles: "Um conjunto adequado de procedimentos para rotulagem de informações deve ser desenvolvido e implementado de acordo com o esquema de classificação de informações adotado pela organização.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Proteção da informação"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "5.14",
        nome: "Transferência de informações",
        tipoDeControle: ["Preventivo"],
        controles: "Regras, procedimentos ou acordos de transferência de informações devem ser implementados para todos os tipos de recursos de transferência dentro da organização e entre a organização e outras partes.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de ativos", "Proteção da informação"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "5.15",
        nome: "Controle de acesso",
        tipoDeControle: ["Preventivo"],
        controles: "Regras para controlar o acesso físico e lógico às informações e a outros ativos associados devem ser estabelecidas e implementadas com base nos requisitos de segurança da informação e de negócios.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "5.16",
        nome: "Gestão de identidade",
        tipoDeControle: ["Preventivo"],
        controles: "O ciclo de vida completo das identidades deve ser gerenciado.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "5.17",
        nome: "Informações de autenticação",
        tipoDeControle: ["Preventivo"],
        controles: "A alocação e a gestão de informações de autenticação devem ser controladas por uma gestão de processo, incluindo aconselhar o pessoal sobre o manuseio adequado de informações de autenticação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "5.18",
        nome: "Direitos de acesso",
        tipoDeControle: ["Preventivo"],
        controles: "Os direitos de acesso às informações e a outros ativos associados devem ser provisionados, analisados criticamente, modificados e removidos de acordo com a política de tema específico e com as regras da organização para o controle de acesso.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "5.19",
        nome: "Segurança da informação nas relações com fornecedores",
        tipoDeControle: ["Preventivo"],
        controles: "Processos e procedimentos devem ser definidos e implementados para gerenciar a segurança da informação e os riscos associados com o uso dos produtos ou serviços dos fornecedores.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Segurança nas relações com fornecedores"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.20",
        nome: "Abordagem da segurança da informação nos contratos de fornecedores",
        tipoDeControle: ["Preventivo"],
        controles: "Requisitos relevantes de segurança da informação devem ser estabelecidos e acordados com cada fornecedor, com base no tipo de relacionamento com o fornecedor.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Segurança nas relações com fornecedores"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.21",
        nome: "Gestão da segurança da informação na cadeia de fornecimento de TIC",
        tipoDeControle: ["Preventivo"],
        controles: "Processos e procedimentos devem ser definidos e implementados para gerenciar os riscos da segurança da informação associados à cadeia de fornecimento de produtos e serviços de TIC.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Segurança nas relações com fornecedores"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.22",
        nome: "Monitoramento, análise crítica e gestão de mudanças dos serviços de fornecedores",
        tipoDeControle: ["Preventivo"],
        controles: "A organização deve monitorar, analisar criticamente, avaliar e gerenciar regularmente a mudança nas práticas da segurança da informação dos fornecedores e na prestação de serviços.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Segurança nas relações com fornecedores"],
        dominioDeSI: ["Governança e ecossistema", "Proteção", "Defesa", "Garantia de segurança da informação"]
    },
    {
        id: "5.23",
        nome: "Segurança da informação para uso de serviços em nuvem",
        tipoDeControle: ["Preventivo"],
        controles: "Os processos de aquisição, uso, gestão e saída de serviços em nuvem devem ser estabelecidos de acordo com os requisitos da segurança da informação da organização.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança nas relações com fornecedores"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.24",
        nome: "Planejamento e preparação da gestão de incidentes de segurança da informação",
        tipoDeControle: ["Corretivo"],
        controles: "A organização deve planejar e se preparar para gerenciar incidentes da segurança da informação, definindo, estabelecendo e comunicando processos, papéis e responsabilidades de gestão de incidentes da segurança da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Responder", "Restaurar"],
        capacidadesOperacionais: ["Governança", "Gestão de evento de segurança da informação"],
        dominioDeSI: ["Defesa"]
    },
    {
        id: "5.25",
        nome: "Avaliação e decisão sobre eventos de segurança de informação",
        tipoDeControle: ["Detectivo"],
        controles: "A organização deve avaliar os eventos da segurança da informação e decidir se categoriza como incidentes da segurança da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Detectar", "Responder"],
        capacidadesOperacionais: ["Gestão de evento de segurança da informação"],
        dominioDeSI: ["Defesa"]
    },
    {
        id: "5.26",
        nome: "Resposta a incidentes de segurança da informação",
        tipoDeControle: ["Corretivo"],
        controles: "Os incidentes da segurança da informação devem ser respondidos de acordo com os procedimentos documentados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Responder", "Restaurar"],
        capacidadesOperacionais: ["Gestão de evento de segurança da informação"],
        dominioDeSI: ["Defesa"]
    },
    {
        id: "5.27",
        nome: "Aprendizado com incidentes de segurança da informação",
        tipoDeControle: ["Preventivo"],
        controles: "O conhecimento adquirido com incidentes de segurança da informação deve ser usado para fortalecer e melhorar os controles da segurança da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger"],
        capacidadesOperacionais: ["Gestão de evento de segurança da informação"],
        dominioDeSI: ["Defesa"]
    },
    {
        id: "5.28",
        nome: "Coleta de evidências",
        tipoDeControle: ["Corretivo"],
        controles: "A organização deve estabelecer e implementar procedimentos para identificação, coleta, aquisição e preservação de evidências relacionadas a eventos da segurança da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Detectar", "Responder"],
        capacidadesOperacionais: ["Gestão de evento de segurança da informação"],
        dominioDeSI: ["Defesa"]
    },
    {
        id: "5.29",
        nome: "Segurança da informação durante a disrupção",
        tipoDeControle: ["Preventivo", "Corretivo"],
        controles: "A organização deve planejar como manter a segurança da informação em um nível apropriado durante a disrupção.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Responder"],
        capacidadesOperacionais: ["Continuidade"],
        dominioDeSI: ["Resiliência", "Proteção"]
    },
    {
        id: "5.30",
        nome: "Prontidão de TIC para continuidade de negócios",
        tipoDeControle: ["Corretivo"],
        controles: "A prontidão de TIC deve ser planejada, implementada, mantida e testada com base nos objetivos de continuidade de negócios e nos requisitos de continuidade da TIC.",
        propriedadeDeSI: ["Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Responder"],
        capacidadesOperacionais: ["Continuidade"],
        dominioDeSI: ["Resiliência"]
    },
    {
        id: "5.31",
        nome: "Requisitos legais, estatutários, regulamentares e contratuais",
        tipoDeControle: ["Preventivo"],
        controles: "Os requisitos legais, estatutários, regulamentares e contratuais pertinentes à segurança da informação e à abordagem da organização para atender a esses requisitos devem ser identificados, documentados e atualizados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Leis e compliance"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "5.32",
        nome: "Direitos de propriedade intelectual",
        tipoDeControle: ["Preventivo"],
        controles: "A organização deve implementar procedimentos adequados para proteger os direitos de propriedade intelectual.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Leis e compliance"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "5.33",
        nome: "Proteção de registros",
        tipoDeControle: ["Preventivo"],
        controles: "Os registros devem ser protegidos contra perdas, destruição, falsificação, acesso não autorizado e liberação não autorizada.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger"],
        capacidadesOperacionais: ["Leis e compliance", "Gestão de ativos", "Proteção da informação"],
        dominioDeSI: ["Defesa"]
    },
    {
        id: "5.34",
        nome: "Privacidade e proteção de DP",
        tipoDeControle: ["Preventivo"],
        controles: "A organização deve identificar e atender aos requisitos relativos à preservação da privacidade e à proteção de DP, de acordo com as leis e os regulamentos aplicáveis e requisitos contratuais.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger"],
        capacidadesOperacionais: ["Proteção da informação", "Leis e compliance"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "5.35",
        nome: "Análise crítica independente da segurança da informação",
        tipoDeControle: ["Preventivo", "Corretivo"],
        controles: "A abordagem da organização para gerenciar a segurança da informação e sua implementação, incluindo pessoas, processos e tecnologias, deve ser analisada criticamente, de forma independente, a intervalos planejados ou quando ocorrerem mudanças significativas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger"],
        capacidadesOperacionais: ["Garantia de segurança da informação"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "5.36",
        nome: "Conformidade com políticas, regras e normas de segurança da informação",
        tipoDeControle: ["Preventivo"],
        controles: "O compliance da política de segurança da informação da organização, políticas, regras e normas de temas específicos deve ser analisado criticamente a intervalos regulares.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger"],
        capacidadesOperacionais: ["Leis e compliance", "Garantia de segurança da informação"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "5.37",
        nome: "Documentação dos procedimentos de operação",
        tipoDeControle: ["Preventivo", "Corretivo"],
        controles: "Os procedimentos de operação dos recursos de tratamento da informação devem ser documentados e disponibilizados para o pessoal que necessite deles.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Restaurar"],
        capacidadesOperacionais: ["Gestão de ativos", "Segurança física", "Segurança de sistemas e rede", "Segurança de aplicações", "Configuração segura", "Gestão de identidade e acesso", "Gestão de ameaças e vulnerabilidades", "Continuidade", "Gestão de eventos de segurança da informação"],
        dominioDeSI: ["Governança e ecossistema", "Proteção", "Defesa"]
    },
    // ============================================
    // CONTROLES DE PESSOAS (6.1 - 6.8)
    // ============================================
    {
        id: "6.1",
        nome: "Seleção",
        tipoDeControle: ["Preventivo"],
        controles: "Verificações de antecedentes de todos os candidatos a serem contratados devem ser realizadas antes de ingressarem na organização e de modo contínuo, de acordo com as leis, os regulamentos e a ética aplicáveis, e devem ser proporcionais aos requisitos do negócio, à classificação das informações a serem acessadas e aos riscos percebidos.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança em recursos humanos"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "6.2",
        nome: "Termos e condições de contratação",
        tipoDeControle: ["Preventivo"],
        controles: "Os contratos trabalhistas devem declarar as responsabilidades do pessoal e da organização para a segurança da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança em recursos humanos"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "6.3",
        nome: "Conscientização, educação e treinamento em segurança da informação",
        tipoDeControle: ["Preventivo"],
        controles: "O pessoal da organização e partes interessadas relevantes devem receber treinamento, educação e conscientização em segurança da informação apropriados e atualizações regulares da política de segurança da informação da organização, políticas e procedimentos específicas por tema, pertinentes para as suas funções.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança em recursos humanos"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "6.4",
        nome: "Processo disciplinar",
        tipoDeControle: ["Preventivo", "Corretivo"],
        controles: "Um processo disciplinar deve ser formalizado e comunicado, para tomar ações contra pessoal e outras partes interessadas relevantes que tenham cometido uma violação da política da segurança da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Responder"],
        capacidadesOperacionais: ["Segurança em recursos humanos"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "6.5",
        nome: "Responsabilidades após encerramento ou mudança da contratação",
        tipoDeControle: ["Preventivo"],
        controles: "As responsabilidades e funções de segurança da informação que permaneçam válidas após o encerramento ou a mudança da contratação devem ser definidas, aplicadas e comunicadas ao pessoal e a outras partes interessadas pertinentes.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança em recursos humanos", "Gestão de ativos"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "6.6",
        nome: "Acordos de confidencialidade ou não divulgação",
        tipoDeControle: ["Preventivo"],
        controles: "Acordos de confidencialidade ou não divulgação que reflitam as necessidades da organização para a proteção das informações devem ser identificados, documentados, analisados criticamente em intervalos regulares e assinados pelo pessoal e por outras partes interessadas pertinentes.",
        propriedadeDeSI: ["Confidencialidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança em recursos humanos", "Proteção da informação", "Segurança nas relações com fornecedores"],
        dominioDeSI: ["Governança e ecossistema"]
    },
    {
        id: "6.7",
        nome: "Trabalho remoto",
        tipoDeControle: ["Preventivo"],
        controles: "Medidas de segurança devem ser implementadas quando as pessoas estiverem trabalhando remotamente para proteger as informações acessadas, tratadas ou armazenadas fora das instalações da organização.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de ativos", "Proteção da informação", "Segurança física", "Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "6.8",
        nome: "Relatos de eventos de segurança da informação",
        tipoDeControle: ["Detectivo"],
        controles: "A organização deve fornecer um mecanismo para que as pessoas relatem eventos da segurança da informação observados ou suspeitos por meio de canais apropriados em tempo hábil.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Detectar"],
        capacidadesOperacionais: ["Gestão de eventos de segurança da informação"],
        dominioDeSI: ["Defesa"]
    },
    // ============================================
    // CONTROLES FÍSICOS (7.1 - 7.14)
    // ============================================
    {
        id: "7.1",
        nome: "Perímetros de segurança física",
        tipoDeControle: ["Preventivo"],
        controles: "Perímetros de segurança devem ser definidos e usados para proteger áreas que contenham informações e outros ativos associados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.2",
        nome: "Entrada física",
        tipoDeControle: ["Preventivo"],
        controles: "As áreas seguras devem ser protegidas por controles de entrada e pontos de acesso apropriados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física", "Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.3",
        nome: "Segurança de escritórios, salas e instalações",
        tipoDeControle: ["Preventivo"],
        controles: "Segurança física para escritórios, salas e instalações deve ser projetada e implementada.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física", "Gestão de ativos"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.4",
        nome: "Monitoramento de segurança física",
        tipoDeControle: ["Preventivo", "Detectivo"],
        controles: "As instalações devem ser monitoradas continuamente para acesso físico não autorizado.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Detectar"],
        capacidadesOperacionais: ["Segurança física"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "7.5",
        nome: "Proteção contra ameaças físicas e ambientais",
        tipoDeControle: ["Preventivo"],
        controles: "Proteção contra ameaças físicas e ambientais, como desastres naturais e outras ameaças físicas intencionais ou não intencionais à infraestrutura, deve ser projetada e implementada.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.6",
        nome: "Trabalho em áreas seguras",
        tipoDeControle: ["Preventivo"],
        controles: "Medidas de segurança para trabalhar em áreas seguras devem ser projetadas e implementadas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.7",
        nome: "Mesa limpa e tela limpa",
        tipoDeControle: ["Preventivo"],
        controles: "Regras de mesa limpa para documentos impressos e mídia de armazenamento removível e regras de tela limpa para os recursos de tratamento das informações devem ser definidas e adequadamente aplicadas.",
        propriedadeDeSI: ["Confidencialidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.8",
        nome: "Localização e proteção do equipamento",
        tipoDeControle: ["Preventivo"],
        controles: "Os equipamentos devem ser posicionados com segurança e proteção.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física", "Gestão de ativos"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.9",
        nome: "Segurança de ativos fora das dependências da organização",
        tipoDeControle: ["Preventivo"],
        controles: "Os ativos fora das instalações da organização devem ser protegidos.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física", "Gestão de ativos"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.10",
        nome: "Mídia de armazenamento",
        tipoDeControle: ["Preventivo"],
        controles: "As mídias de armazenamento devem ser gerenciadas por seu ciclo de vida de aquisição, uso, transporte e descarte, de acordo com o esquema de classificação e com os requisitos de manuseio da organização.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física", "Gestão de ativos"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.11",
        nome: "Serviços de infraestrutura",
        tipoDeControle: ["Preventivo", "Detectivo"],
        controles: "As instalações de tratamento de informações devem ser protegidas contra falhas de energia e outras disrupções causadas por falhas nos serviços de infraestrutura.",
        propriedadeDeSI: ["Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Detectar"],
        capacidadesOperacionais: ["Segurança física"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.12",
        nome: "Segurança do cabeamento",
        tipoDeControle: ["Preventivo"],
        controles: "Os cabos que transportam energia ou dados, ou que sustentam serviços de informação, devem ser protegidos contra interceptação, interferência ou danos.",
        propriedadeDeSI: ["Confidencialidade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "7.13",
        nome: "Manutenção de equipamentos",
        tipoDeControle: ["Preventivo"],
        controles: "Os equipamentos devem ser mantidos corretamente para assegurar a disponibilidade, integridade e confidencialidade da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física", "Gestão de ativos"],
        dominioDeSI: ["Proteção", "Resiliência"]
    },
    {
        id: "7.14",
        nome: "Descarte seguro ou reutilização de equipamentos",
        tipoDeControle: ["Preventivo"],
        controles: "Os itens dos equipamentos que contenham mídia de armazenamento devem ser verificados para assegurar que quaisquer dados confidenciais e software licenciado tenham sido removidos ou substituídos com segurança antes do descarte ou reutilização.",
        propriedadeDeSI: ["Confidencialidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança física", "Gestão de ativos"],
        dominioDeSI: ["Proteção"]
    },
    // ============================================
    // CONTROLES TECNOLÓGICOS (8.1 - 8.34)
    // ============================================
    {
        id: "8.1",
        nome: "Dispositivos endpoint do usuário",
        tipoDeControle: ["Preventivo"],
        controles: "As informações armazenadas, tratadas ou acessíveis por meio de dispositivos endpoint do usuário devem ser protegidas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de ativos", "Proteção da informação"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.2",
        nome: "Direitos de acessos privilegiados",
        tipoDeControle: ["Preventivo"],
        controles: "A atribuição e o uso de direitos de acessos privilegiados devem ser restritos e gerenciados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.3",
        nome: "Restrição de acesso à informação",
        tipoDeControle: ["Preventivo"],
        controles: "O acesso às informações e a outros ativos associados deve ser restrito de acordo com a política específica por tema sobre controle de acesso.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.4",
        nome: "Acesso ao código-fonte",
        tipoDeControle: ["Preventivo"],
        controles: "Os acessos de leitura e escrita ao código-fonte, ferramentas de desenvolvimento e bibliotecas de software devem ser adequadamente gerenciados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso", "Segurança de aplicações", "Configuração segura"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.5",
        nome: "Autenticação segura",
        tipoDeControle: ["Preventivo"],
        controles: "Tecnologias e procedimentos de autenticação seguros devem ser implementados, com base em restrições de acesso à informação e à política específica por tema de controle de acesso.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de identidade e acesso"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.6",
        nome: "Gestão de capacidade",
        tipoDeControle: ["Preventivo", "Detectivo"],
        controles: "O uso dos recursos deve ser monitorado e ajustado de acordo com os requisitos atuais e esperados de capacidade.",
        propriedadeDeSI: ["Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger", "Detectar"],
        capacidadesOperacionais: ["Continuidade"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "8.7",
        nome: "Proteção contra malware",
        tipoDeControle: ["Preventivo", "Detectivo", "Corretivo"],
        controles: "Proteção contra malware deve ser implementada e apoiada pela conscientização adequada do usuário.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Detectar"],
        capacidadesOperacionais: ["Segurança de sistemas e rede", "Proteção da informação"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "8.8",
        nome: "Gestão de vulnerabilidades técnicas",
        tipoDeControle: ["Preventivo"],
        controles: "Informações sobre vulnerabilidades técnicas dos sistemas de informação em uso devem ser obtidas; a exposição da organização a tais vulnerabilidades deve ser avaliada e medidas apropriadas devem ser tomadas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger"],
        capacidadesOperacionais: ["Gestão de ameaças e vulnerabilidades"],
        dominioDeSI: ["Governança e ecossistema", "Proteção", "Defesa"]
    },
    {
        id: "8.9",
        nome: "Gestão de configuração",
        tipoDeControle: ["Preventivo"],
        controles: "As configurações, incluindo configurações de segurança, de hardware, software, serviços e redes, devem ser estabelecidas, documentadas, implementadas, monitoradas e analisadas criticamente.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Configuração segura"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.10",
        nome: "Exclusão de informações",
        tipoDeControle: ["Preventivo"],
        controles: "As informações armazenadas em sistemas de informação, dispositivos ou em qualquer outra mídia de armazenamento devem ser excluídas quando não forem mais necessárias.",
        propriedadeDeSI: ["Confidencialidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Proteção da informação", "Leis e compliance"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.11",
        nome: "Mascaramento de dados",
        tipoDeControle: ["Preventivo"],
        controles: "O mascaramento de dados deve ser usado de acordo com a política específica por tema da organização sobre o controle de acesso e outros requisitos específicos por tema relacionados e requisitos de negócios, levando em consideração a legislação aplicável.",
        propriedadeDeSI: ["Confidencialidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Proteção da informação"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.12",
        nome: "Prevenção de vazamento de dados",
        tipoDeControle: ["Preventivo", "Detectivo"],
        controles: "As medidas de prevenção de vazamento de dados devem ser aplicadas a sistemas, redes e quaisquer outros dispositivos que tratem, armazenem ou transmitam informações sensíveis.",
        propriedadeDeSI: ["Confidencialidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Detectar"],
        capacidadesOperacionais: ["Proteção da informação"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "8.13",
        nome: "Backup das informações",
        tipoDeControle: ["Corretivo"],
        controles: "Cópias de backup de informações, software e sistemas devem ser mantidas e testadas regularmente de acordo com a política específica por tema acordada sobre backup.",
        propriedadeDeSI: ["Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Restaurar"],
        capacidadesOperacionais: ["Continuidade"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.14",
        nome: "Redundância dos recursos de tratamento de informações",
        tipoDeControle: ["Preventivo"],
        controles: "Os recursos de tratamento de informações devem ser implementados com redundância suficiente para atender aos requisitos de disponibilidade.",
        propriedadeDeSI: ["Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Continuidade", "Gestão de ativos"],
        dominioDeSI: ["Proteção", "Resiliência"]
    },
    {
        id: "8.15",
        nome: "Log",
        tipoDeControle: ["Detectivo"],
        controles: "Logs que registrem atividades, exceções, falhas e outros eventos relevantes devem ser produzidos, armazenados, protegidos e analisados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Detectar"],
        capacidadesOperacionais: ["Gestão de eventos de segurança da informação"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "8.16",
        nome: "Atividades de monitoramento",
        tipoDeControle: ["Detectivo", "Corretivo"],
        controles: "As redes, sistemas e aplicações devem ser monitorados por comportamentos anômalos e por ações apropriadas, tomadas para avaliar possíveis incidentes de segurança da informação.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Detectar", "Responder"],
        capacidadesOperacionais: ["Gestão de eventos de segurança da informação"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.17",
        nome: "Sincronização do relógio",
        tipoDeControle: ["Detectivo"],
        controles: "Os relógios dos sistemas de tratamento de informações utilizados pela organização devem ser sincronizados com fontes de tempo aprovadas.",
        propriedadeDeSI: ["Integridade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Gestão de eventos de segurança da informação"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "8.18",
        nome: "Uso de programas utilitários privilegiados",
        tipoDeControle: ["Preventivo"],
        controles: "O uso de programas utilitários que possam ser capazes de substituir os controles de sistema e as aplicações deve ser restrito e rigorosamente controlado.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de sistemas e rede", "Configuração segura", "Segurança de aplicações"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.19",
        nome: "Instalação de software em sistemas operacionais",
        tipoDeControle: ["Preventivo"],
        controles: "Procedimentos e medidas devem ser implementados para gerenciar com segurança a instalação de software em sistemas operacionais.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Configuração segura", "Segurança de aplicações"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.20",
        nome: "Segurança de redes",
        tipoDeControle: ["Preventivo", "Detectivo"],
        controles: "Redes e dispositivos de rede devem ser protegidos, gerenciados e controlados para proteger as informações em sistemas e aplicações.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger", "Detectar"],
        capacidadesOperacionais: ["Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.21",
        nome: "Segurança dos serviços de rede",
        tipoDeControle: ["Preventivo"],
        controles: "Mecanismos de segurança, níveis de serviço e requisitos de serviços de rede devem ser identificados, implementados e monitorados.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.22",
        nome: "Segregação de redes",
        tipoDeControle: ["Preventivo"],
        controles: "Grupos de serviços de informação, usuários e sistemas de informação devem ser segregados nas redes da organização.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.23",
        nome: "Filtragem da web",
        tipoDeControle: ["Preventivo"],
        controles: "O acesso a sites externos deve ser gerenciado para reduzir a exposição a conteúdo malicioso.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.24",
        nome: "Uso de criptografia",
        tipoDeControle: ["Preventivo"],
        controles: "Regras para o uso efetivo da criptografia, incluindo o gerenciamento de chaves criptográfica devem ser definidas e implementadas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Configuração segura"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.25",
        nome: "Ciclo de vida de desenvolvimento seguro",
        tipoDeControle: ["Preventivo"],
        controles: "Regras para o desenvolvimento seguro de software e sistemas devem ser estabelecidas e aplicadas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de aplicações", "Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.26",
        nome: "Requisitos de segurança da aplicação",
        tipoDeControle: ["Preventivo"],
        controles: "Requisitos de segurança da informação devem ser identificados, especificados e aprovados ao desenvolver ou adquirir aplicações.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de aplicações", "Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção", "Defesa"]
    },
    {
        id: "8.27",
        nome: "Princípios de arquitetura e engenharia de sistemas seguros",
        tipoDeControle: ["Preventivo"],
        controles: "Princípios de engenharia de sistemas seguros devem ser estabelecidos, documentados, mantidos e aplicados a qualquer atividade de desenvolvimento de sistemas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de aplicações", "Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.28",
        nome: "Codificação segura",
        tipoDeControle: ["Preventivo"],
        controles: "Princípios de codificação segura devem ser aplicados ao desenvolvimento de software.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de aplicações", "Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.29",
        nome: "Testes de segurança em desenvolvimento e aceitação",
        tipoDeControle: ["Preventivo"],
        controles: "Processos de teste de segurança devem ser definidos e implementados no ciclo de vida do desenvolvimento.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar"],
        capacidadesOperacionais: ["Segurança de aplicações", "Garantia de segurança da informação", "Segurança de sistemas e rede"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.30",
        nome: "Desenvolvimento terceirizado",
        tipoDeControle: ["Preventivo", "Detectivo"],
        controles: "A organização deve dirigir, monitorar e analisar criticamente as atividades relacionadas à terceirização de desenvolvimento de sistemas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Identificar", "Proteger", "Detectar"],
        capacidadesOperacionais: ["Segurança de aplicações", "Segurança de sistemas e rede", "Segurança nas relações com fornecedores"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    },
    {
        id: "8.31",
        nome: "Separação dos ambientes de desenvolvimento, teste e de produção",
        tipoDeControle: ["Preventivo"],
        controles: "Ambientes de desenvolvimento, testes e produção devem ser separados e protegidos.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de sistemas e rede", "Segurança de aplicações"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.32",
        nome: "Gestão de mudanças",
        tipoDeControle: ["Preventivo"],
        controles: "Mudanças nos recursos de tratamento de informações e sistemas de informação devem estar sujeitas a procedimentos de gestão de mudanças.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de sistemas e rede", "Segurança de aplicações"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.33",
        nome: "Informações de testes",
        tipoDeControle: ["Preventivo"],
        controles: "Informações de teste devem ser adequadamente selecionadas, protegidas e gerenciadas.",
        propriedadeDeSI: ["Confidencialidade", "Integridade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Proteção da informação"],
        dominioDeSI: ["Proteção"]
    },
    {
        id: "8.34",
        nome: "Proteção de sistemas de informação durante testes de auditoria",
        tipoDeControle: ["Preventivo"],
        controles: "Testes de auditoria e outras atividades de garantia envolvendo a avaliação de sistemas operacionais devem ser planejados e acordados entre o testador e a gestão apropriada.",
        propriedadeDeSI: ["Confidencialidade", "Integridade", "Disponibilidade"],
        conceitoDeSegurancaCibernetica: ["Proteger"],
        capacidadesOperacionais: ["Segurança de sistemas e rede", "Proteção da informação"],
        dominioDeSI: ["Governança e ecossistema", "Proteção"]
    }
];
async function seedControls() {
    try {
        await mongoose_1.default.connect(env_js_1.config.MONGODB_URI, {
            dbName: env_js_1.config.MONGODB_DB_NAME,
        });
        logger_js_1.logger.info('📦 Conectado ao MongoDB');
        // Limpar dados existentes
        await Control_js_1.Control.deleteMany({});
        logger_js_1.logger.info('🗑️ Controles existentes removidos');
        // Inserir novos controles
        const result = await Control_js_1.Control.insertMany(controlsData);
        logger_js_1.logger.info(`✅ ${result.length} controles inseridos com sucesso`);
        process.exit(0);
    }
    catch (error) {
        logger_js_1.logger.error('❌ Erro ao popular controles:', error);
        process.exit(1);
    }
}
seedControls();
//# sourceMappingURL=seed-controls.js.map