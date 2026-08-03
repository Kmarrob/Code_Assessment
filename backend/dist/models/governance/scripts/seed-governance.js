"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const GovernanceDocument_js_1 = require("../models/GovernanceDocument.js");
const Policy_js_1 = require("../models/Policy.js");
const Standard_js_1 = require("../models/Standard.js");
const Procedure_js_1 = require("../models/Procedure.js");
const WorkInstruction_js_1 = require("../models/WorkInstruction.js");
dotenv_1.default.config();
/**
 * Usuário admin padrão para criação dos documentos
 * Será substituído pelo primeiro admin encontrado
 */
const ADMIN_USER_ID = '000000000000000000000000';
/**
 * Mapeamento de códigos de Políticas para IDs
 * Será preenchido após a inserção das Políticas
 */
const policyIdMap = {};
/**
 * Dados das Políticas (Nível 1)
 * 8 Políticas corporativas baseadas em ISO 27001, NIST, COBIT, PCI DSS, LGPD e BACEN
 */
const policiesData = [
    {
        code: 'POL-001',
        title: 'Política de Segurança da Informação',
        level: 1,
        category: 'Estratégia',
        summary: 'Estabelece as diretrizes estratégicas para a proteção das informações da empresa',
        content: `# POL-001 - Política de Segurança da Informação

## 1. OBJETIVO
Estabelecer as diretrizes estratégicas para a proteção das informações da **[NOME DA EMPRESA]** , garantindo confidencialidade, integridade e disponibilidade.

## 2. ABRANGÊNCIA
Aplica-se a todos os colaboradores, prestadores de serviços, estagiários e terceiros que tenham acesso a informações da **[NOME DA EMPRESA]**.

## 3. REFERÊNCIAS
- ISO/IEC 27001:2022
- ISO/IEC 27002:2022
- NIST CSF
- LGPD (Lei 13.709/2018)
- Resolução BACEN 4.658

## 4. PRINCÍPIOS
1. **Confidencialidade**: Acesso restrito a quem necessita
2. **Integridade**: Dados precisos e não modificados indevidamente
3. **Disponibilidade**: Acesso quando necessário
4. **Responsabilidade**: Todos são responsáveis pela segurança
5. **Transparência**: Comunicação clara sobre práticas de segurança

## 5. DIRETRIZES ESTRATÉGICAS
### 5.1 Gestão de Riscos
A **[NOME DA EMPRESA]** adota uma abordagem baseada em risco para a segurança da informação.

### 5.2 Controles de Acesso
O acesso à informação será concedido com base no princípio do menor privilégio.

### 5.3 Continuidade de Negócios
A **[NOME DA EMPRESA]** manterá planos de continuidade para garantir a disponibilidade dos serviços críticos.

## 6. RESPONSABILIDADES
| Cargo | Responsabilidade |
|-------|------------------|
| Diretoria | Aprovação da política |
| Gestor de SI | Implementação e monitoramento |
| Colaboradores | Cumprimento das diretrizes |

## 7. SANÇÕES
O descumprimento desta política sujeitará o infrator às sanções previstas no código de ética da **[NOME DA EMPRESA]**.

## 8. VERSÃO E CONTROLE
| Versão | Data | Alterações | Aprovador |
|--------|------|------------|-----------|
| v1.0 | 01/01/2024 | Criação do documento | Diretoria |

## 9. REVISÃO
Este documento será revisado anualmente ou sempre que houver mudanças significativas.

---
**Documento oficial da [NOME DA EMPRESA]**`,
        keywords: ['segurança da informação', 'confidencialidade', 'integridade', 'disponibilidade'],
        frameworks: {
            iso27001: ['A.5.1', 'A.5.2'],
            nist: ['ID.AM', 'ID.RA', 'PR.AC'],
            cobit: ['APO01', 'APO12'],
            lgpd: ['Art. 6', 'Art. 46'],
            bacen: ['Cap. I'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'all',
        strategicObjective: 'Garantir a proteção das informações da empresa',
        responsible: 'Diretoria',
    },
    {
        code: 'POL-002',
        title: 'Política de Gestão de Riscos',
        level: 1,
        category: 'Riscos',
        summary: 'Define a abordagem da empresa para identificação, análise e tratamento de riscos',
        content: `# POL-002 - Política de Gestão de Riscos

## 1. OBJETIVO
Estabelecer a metodologia para identificação, análise, avaliação e tratamento dos riscos de segurança da informação na **[NOME DA EMPRESA]** .

## 2. ABRANGÊNCIA
Aplica-se a todos os processos, sistemas e atividades que envolvem informações da **[NOME DA EMPRESA]**.

## 3. REFERÊNCIAS
- ISO/IEC 27001:2022 (Anexo A.8)
- ISO 31000:2018
- NIST SP 800-30

## 4. METODOLOGIA
### 4.1 Identificação
Identificação sistemática de ativos, ameaças e vulnerabilidades.

### 4.2 Análise
Análise qualitativa e quantitativa dos riscos identificados.

### 4.3 Avaliação
Comparação dos riscos com os critérios de aceitação da **[NOME DA EMPRESA]**.

### 4.4 Tratamento
Seleção de controles para mitigar, transferir ou aceitar os riscos.

## 5. NÍVEIS DE RISCO
| Nível | Impacto | Probabilidade | Ação |
|-------|---------|---------------|------|
| Crítico | Alto | Alta | Ação imediata |
| Alto | Alto | Média | Plano de ação |
| Médio | Médio | Média | Monitoramento |
| Baixo | Baixo | Baixa | Aceitar |

## 6. APROVAÇÃO DE RISCOS
Riscos críticos devem ser aprovados pela Diretoria da **[NOME DA EMPRESA]**.

## 7. REVISÃO
A matriz de riscos deve ser revisada trimestralmente.`,
        keywords: ['risco', 'gestão de riscos', 'análise de riscos', 'tratamento de riscos'],
        frameworks: {
            iso27001: ['A.8.1', 'A.8.2'],
            nist: ['ID.RA', 'ID.RM'],
            cobit: ['APO12'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'all',
        strategicObjective: 'Gerenciar proativamente os riscos de segurança da informação',
        responsible: 'Comitê de Riscos',
    },
    {
        code: 'POL-003',
        title: 'Política de Controle de Acesso',
        level: 1,
        category: 'Acessos',
        summary: 'Define as regras para concessão, alteração e revogação de acessos',
        content: `# POL-003 - Política de Controle de Acesso

## 1. OBJETIVO
Estabelecer os princípios e regras para o controle de acesso aos recursos de informação da **[NOME DA EMPRESA]**.

## 2. ABRANGÊNCIA
Aplica-se a todos os sistemas, aplicações e dados da **[NOME DA EMPRESA]**.

## 3. PRINCÍPIOS
### 3.1 Menor Privilégio
Os usuários terão apenas as permissões necessárias para suas funções.

### 3.2 Segregação de Funções
Tarefas críticas serão divididas entre diferentes pessoas.

### 3.3 Revisão Periódica
Acessos serão revisados periodicamente.

### 3.4 Registro de Acessos
Todos os acessos serão registrados e auditados.

## 4. TIPOS DE ACESSO
| Tipo | Descrição | Autorização |
|------|-----------|-------------|
| Acesso Físico | Acesso a instalações | Segurança |
| Acesso Lógico | Acesso a sistemas | Gestor de Acesso |
| Acesso Remoto | Acesso externo | Segurança da Informação |

## 5. PROCESSO DE CONCESSÃO
1. Solicitação formal
2. Aprovação do gestor
3. Concessão do acesso
4. Registro no sistema

## 6. RESPONSABILIDADES
- **Usuário**: Utilizar acessos de forma adequada
- **Gestor**: Aprovar acessos e revisar periodicamente
- **Segurança**: Monitorar e auditar acessos

## 7. REVISÃO
Acessos devem ser revisados a cada 90 dias.`,
        keywords: ['acesso', 'controle de acesso', 'privilégio', 'permissão'],
        frameworks: {
            iso27001: ['A.9.1', 'A.9.2', 'A.9.3', 'A.9.4'],
            nist: ['PR.AC'],
            cobit: ['DSS05'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'all',
        strategicObjective: 'Garantir que apenas pessoas autorizadas tenham acesso',
        responsible: 'Gestor de SI',
    },
    {
        code: 'POL-004',
        title: 'Política de Gestão de Identidades',
        level: 1,
        category: 'Identidade',
        summary: 'Define a gestão do ciclo de vida das identidades digitais',
        content: `# POL-004 - Política de Gestão de Identidades

## 1. OBJETIVO
Estabelecer as diretrizes para o gerenciamento do ciclo de vida das identidades digitais.

## 2. ABRANGÊNCIA
Aplica-se a todos os usuários, sistemas e serviços.

## 3. CICLO DE VIDA DA IDENTIDADE
### 3.1 Criação
Criação de identidades com dados verificados.

### 3.2 Manutenção
Atualização de dados e credenciais.

### 3.3 Desativação
Desativação em até 24 horas após desligamento.

## 4. TIPOS DE IDENTIDADES
| Tipo | Descrição |
|------|-----------|
| Colaborador | Funcionários da empresa |
| Prestador | Terceiros com contrato |
| Sistema | Serviços e aplicações |

## 5. RESPONSABILIDADES
- **RH**: Comunicar desligamentos
- **TI**: Gerenciar identidades
- **Usuário**: Manter dados atualizados`,
        keywords: ['identidade', 'gestão de identidades', 'IAM', 'ciclo de vida'],
        frameworks: {
            iso27001: ['A.9.2'],
            nist: ['PR.AC'],
            cobit: ['DSS05'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'all',
        strategicObjective: 'Gerenciar identidades digitais de forma segura',
        responsible: 'Gestor de SI',
    },
    {
        code: 'POL-005',
        title: 'Política de Gestão de Ativos',
        level: 1,
        category: 'Ativos',
        summary: 'Define a gestão do inventário e proteção dos ativos de informação',
        content: `# POL-005 - Política de Gestão de Ativos

## 1. OBJETIVO
Estabelecer as diretrizes para a gestão, classificação e proteção dos ativos de informação.

## 2. ABRANGÊNCIA
Aplica-se a todos os ativos de informação, hardware e software.

## 3. CLASSIFICAÇÃO DE ATIVOS
| Categoria | Exemplos |
|-----------|----------|
| Hardware | Servidores, estações, dispositivos |
| Software | Sistemas operacionais, aplicações |
| Dados | Bancos de dados, documentos, arquivos |
| Serviços | Aplicações, APIs, conexões |

## 4. INVENTÁRIO
Todos os ativos devem ser registrados no inventário da **[NOME DA EMPRESA]**.

## 5. PROPRIEDADE
Cada ativo deve ter um proprietário designado.

## 6. REVISÃO
Inventário deve ser revisado anualmente.`,
        keywords: ['ativo', 'inventário', 'classificação', 'propriedade'],
        frameworks: {
            iso27001: ['A.8.1'],
            nist: ['ID.AM'],
            cobit: ['APO03'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'all',
        strategicObjective: 'Manter controle sobre todos os ativos de informação',
        responsible: 'Gestor de Ativos',
    },
    {
        code: 'POL-006',
        title: 'Política de Classificação da Informação',
        level: 1,
        category: 'Classificação',
        summary: 'Define a classificação da informação conforme sua criticidade e confidencialidade',
        content: `# POL-006 - Política de Classificação da Informação

## 1. OBJETIVO
Estabelecer critérios para classificar informações conforme seu nível de confidencialidade.

## 2. NÍVEIS DE CLASSIFICAÇÃO
| Nível | Descrição | Exemplos |
|-------|-----------|----------|
| Pública | Informações de domínio público | Site, material marketing |
| Interna | Uso interno da empresa | E-mails internos, relatórios internos |
| Confidencial | Restrito a grupos específicos | Dados financeiros, estratégias |
| Restrita | Altamente confidencial | Segredos comerciais, propriedade intelectual |

## 3. TRATAMENTO POR NÍVEL
Cada nível define requisitos de segurança, acesso, armazenamento e descarte.

## 4. RESPONSABILIDADES
- **Proprietário**: Classificar a informação
- **Usuário**: Respeitar a classificação
- **Segurança**: Auditar a classificação

## 5. REVISÃO
Classificação deve ser revisada anualmente.`,
        keywords: ['classificação', 'confidencialidade', 'segredo', 'informação'],
        frameworks: {
            iso27001: ['A.8.2'],
            nist: ['ID.AM', 'PR.DS'],
            cobit: ['DSS01'],
            lgpd: ['Art. 6'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'all',
        strategicObjective: 'Proteger informações conforme sua criticidade',
        responsible: 'Comitê de Segurança da Informação',
    },
    {
        code: 'POL-007',
        title: 'Política de Backup e Recuperação',
        level: 1,
        category: 'Backup',
        summary: 'Define as diretrizes para realização de backups e recuperação de dados',
        content: `# POL-007 - Política de Backup e Recuperação

## 1. OBJETIVO
Garantir a disponibilidade e integridade dos dados através de backups regulares.

## 2. ABRANGÊNCIA
Aplica-se a todos os dados críticos da **[NOME DA EMPRESA]**.

## 3. FREQUÊNCIA DE BACKUP
| Tipo | Frequência | Retenção |
|------|------------|----------|
| Banco de Dados | Diário | 30 dias |
| Arquivos | Diário | 30 dias |
| Sistemas | Semanal | 90 dias |

## 4. POLÍTICA DE RETENÇÃO
- Backups diários: 7 dias
- Backups semanais: 4 semanas
- Backups mensais: 12 meses

## 5. TESTE DE RECUPERAÇÃO
Testes de recuperação devem ser realizados trimestralmente.

## 6. RESPONSABILIDADES
- **TI**: Executar backups e testar recuperação
- **Gestor**: Aprovar plano de backup
- **Segurança**: Auditar processo

## 7. REVISÃO
Política deve ser revisada anualmente.`,
        keywords: ['backup', 'recuperação', 'restauração', 'retenção'],
        frameworks: {
            iso27001: ['A.8.13'],
            nist: ['PR.IP'],
            cobit: ['DSS04'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'it',
        strategicObjective: 'Garantir recuperação de dados em caso de desastre',
        responsible: 'Coordenador de Infraestrutura',
    },
    {
        code: 'POL-008',
        title: 'Política de Continuidade de Negócios',
        level: 1,
        category: 'Continuidade',
        summary: 'Estabelece os requisitos para garantir a continuidade dos negócios',
        content: `# POL-008 - Política de Continuidade de Negócios

## 1. OBJETIVO
Garantir a continuidade das operações críticas da **[NOME DA EMPRESA]**.

## 2. ABRANGÊNCIA
Aplica-se a todos os processos críticos da **[NOME DA EMPRESA]**.

## 3. PLANO DE CONTINUIDADE
### 3.1 Análise de Impacto
Identificação de processos críticos e seus impactos.

### 3.2 Estratégias de Continuidade
Definição de estratégias para manter operações.

### 3.3 Testes
Testes anuais do plano de continuidade.

## 4. RECUPERAÇÃO DE DESASTRES (DRP)
| Objetivo | Prazo |
|----------|-------|
| RTO (Tempo de Recuperação) | 4 horas |
| RPO (Ponto de Recuperação) | 1 hora |

## 5. RESPONSABILIDADES
- **Diretoria**: Aprovar plano
- **Gestor de Continuidade**: Executar plano
- **TI**: Recuperar sistemas`,
        keywords: ['continuidade', 'BCM', 'recuperação', 'desastre'],
        frameworks: {
            iso27001: ['A.8.13'],
            nist: ['RC.RP'],
            cobit: ['DSS04'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        scope: 'all',
        strategicObjective: 'Assegurar a continuidade das operações em situações de crise',
        responsible: 'Comitê de Continuidade de Negócios',
    },
];
/**
 * Dados das Normas (Nível 2)
 * 15 Normas corporativas com referência às Políticas
 */
const standardsData = [
    {
        code: 'NOR-001',
        title: 'Norma de Senhas',
        level: 2,
        category: 'Senhas',
        summary: 'Define regras para criação, uso e gerenciamento de senhas',
        content: `# NOR-001 - Norma de Senhas

## 1. OBJETIVO
Estabelecer os requisitos para criação, uso e gerenciamento de senhas.

## 2. REQUISITOS MÍNIMOS
- Comprimento mínimo: 12 caracteres
- Complexidade: maiúsculas, minúsculas, números, especiais
- Troca: a cada 90 dias
- Histórico: 5 senhas anteriores

## 3. PROIBIÇÕES
- Senhas reutilizadas
- Senhas que contenham nome do usuário
- Senhas com sequências simples
- Compartilhamento de senhas

## 4. ARMAZENAMENTO
- Hash criptográfico
- Salt aleatório
- Algoritmo: Argon2id ou bcrypt`,
        keywords: ['senha', 'password', 'complexidade', 'troca de senha'],
        frameworks: {
            iso27001: ['A.9.2', 'A.9.3'],
            nist: ['PR.AC'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-003', // Referência à Política de Controle de Acesso
    },
    {
        code: 'NOR-002',
        title: 'Norma de Controle de Acesso',
        level: 2,
        category: 'Acessos',
        summary: 'Define os requisitos técnicos para controle de acesso',
        content: `# NOR-002 - Norma de Controle de Acesso

## 1. OBJETIVO
Estabelecer requisitos técnicos para implementação de controle de acesso.

## 2. AUTENTICAÇÃO
- MFA obrigatória para acesso remoto
- MFA para acessos administrativos

## 3. PERMISSÕES
- Princípio do menor privilégio
- Revisão de permissões a cada 90 dias

## 4. REGISTRO DE ACESSOS
- Log de todos os acessos
- Retenção de logs: 12 meses`,
        keywords: ['acesso', 'autenticação', 'MFA', 'permissão'],
        frameworks: {
            iso27001: ['A.9.2', 'A.9.4'],
            nist: ['PR.AC'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-003', // Referência à Política de Controle de Acesso
    },
    {
        code: 'NOR-003',
        title: 'Norma de Classificação da Informação',
        level: 2,
        category: 'Classificação',
        summary: 'Define os critérios técnicos para classificação de informações',
        content: `# NOR-003 - Norma de Classificação da Informação

## 1. OBJETIVO
Estabelecer os critérios técnicos para classificação de informações.

## 2. CRITÉRIOS DE CLASSIFICAÇÃO
- Impacto na confidencialidade
- Impacto na integridade
- Impacto na disponibilidade

## 3. ROTULAGEM
- Documentos devem conter rótulo de classificação
- E-mails devem conter cabeçalho de classificação

## 4. TRATAMENTO POR NÍVEL
| Nível | Tratamento |
|-------|------------|
| Pública | Sem restrições |
| Interna | Uso interno |
| Confidencial | Criptografia |
| Restrita | Criptografia + controle de acesso`,
        keywords: ['classificação', 'rotulagem', 'confidencialidade'],
        frameworks: {
            iso27001: ['A.8.2'],
            nist: ['ID.AM'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-006', // Referência à Política de Classificação da Informação
    },
    {
        code: 'NOR-004',
        title: 'Norma de Hardening',
        level: 2,
        category: 'Segurança',
        summary: 'Define requisitos para hardening de sistemas',
        content: `# NOR-004 - Norma de Hardening

## 1. OBJETIVO
Estabelecer requisitos mínimos para hardening de sistemas.

## 2. COMPONENTES
- Sistema operacional
- Serviços de rede
- Firewall

## 3. POLÍTICAS DE HARDENING
- Remover serviços desnecessários
- Configurar logs de segurança
- Aplicar políticas de acesso`,
        keywords: ['hardening', 'segurança', 'configuração segura'],
        frameworks: {
            iso27001: ['A.8.7', 'A.8.8'],
            nist: ['PR.IP'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-005',
        title: 'Norma de Desenvolvimento Seguro',
        level: 2,
        category: 'Desenvolvimento',
        summary: 'Define requisitos para desenvolvimento seguro de software',
        content: `# NOR-005 - Norma de Desenvolvimento Seguro

## 1. OBJETIVO
Estabelecer requisitos para desenvolvimento seguro.

## 2. ETAPAS
- Análise de requisitos
- Design seguro
- Implementação
- Testes de segurança

## 3. CONTROLES
- SAST (Análise estática)
- DAST (Análise dinâmica)
- Revisão de código`,
        keywords: ['desenvolvimento seguro', 'segurança', 'SDLC'],
        frameworks: {
            iso27001: ['A.8.25'],
            nist: ['PR.IP'],
            cobit: ['APO11'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-006',
        title: 'Norma de Criptografia',
        level: 2,
        category: 'Criptografia',
        summary: 'Define requisitos para uso de criptografia',
        content: `# NOR-006 - Norma de Criptografia

## 1. OBJETIVO
Estabelecer requisitos para uso de criptografia.

## 2. ALGORITMOS PERMITIDOS
- AES-256 para dados em repouso
- TLS 1.2+ para dados em trânsito

## 3. GESTÃO DE CHAVES
- Armazenamento seguro
- Rotação periódica
- Backup de chaves`,
        keywords: ['criptografia', 'cripto', 'chave', 'TLS', 'AES'],
        frameworks: {
            iso27001: ['A.8.24'],
            nist: ['PR.DS'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-007',
        title: 'Norma de Retenção de Logs',
        level: 2,
        category: 'Logs',
        summary: 'Define política de retenção de logs',
        content: `# NOR-007 - Norma de Retenção de Logs

## 1. OBJETIVO
Estabelecer requisitos de retenção de logs.

## 2. RETENÇÃO POR TIPO
| Tipo | Retenção |
|------|----------|
| Segurança | 12 meses |
| Sistema | 6 meses |
| Aplicação | 3 meses |

## 3. ARMAZENAMENTO
- Logs críticos em armazenamento imutável
- Backup de logs mensal`,
        keywords: ['log', 'retenção', 'armazenamento', 'segurança'],
        frameworks: {
            iso27001: ['A.8.15'],
            nist: ['PR.PT'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-008',
        title: 'Norma de Backup',
        level: 2,
        category: 'Backup',
        summary: 'Define requisitos técnicos para backup',
        content: `# NOR-008 - Norma de Backup

## 1. OBJETIVO
Estabelecer requisitos técnicos para realização de backups.

## 2. FREQUÊNCIA
- Dados transacionais: Diário
- Dados estáticos: Semanal

## 3. ARMAZENAMENTO
- 3 cópias
- 2 mídias diferentes
- 1 offsite`,
        keywords: ['backup', 'recuperação', 'armazenamento'],
        frameworks: {
            iso27001: ['A.8.13'],
            nist: ['PR.IP'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-007', // Referência à Política de Backup e Recuperação
    },
    {
        code: 'NOR-009',
        title: 'Norma de Monitoramento',
        level: 2,
        category: 'Monitoramento',
        summary: 'Define requisitos para monitoramento de sistemas',
        content: `# NOR-009 - Norma de Monitoramento

## 1. OBJETIVO
Estabelecer requisitos para monitoramento contínuo.

## 2. INDICADORES
- Disponibilidade
- Performance
- Eventos de segurança

## 3. ALERTAS
- Alertas em tempo real para incidentes
- Notificações automáticas`,
        keywords: ['monitoramento', 'alerta', 'segurança', 'desempenho'],
        frameworks: {
            iso27001: ['A.8.15', 'A.8.16'],
            nist: ['DE.AE'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-010',
        title: 'Norma de Gestão de Mudanças',
        level: 2,
        category: 'Mudanças',
        summary: 'Define requisitos para gestão de mudanças',
        content: `# NOR-010 - Norma de Gestão de Mudanças

## 1. OBJETIVO
Estabelecer requisitos para gestão de mudanças.

## 2. CLASSIFICAÇÃO
| Tipo | Descrição |
|------|-----------|
| Crítica | Mudança com alto impacto |
| Normal | Mudança com impacto médio |
| Padrão | Mudança com baixo impacto |

## 3. PROCESSO
- Solicitação formal
- Avaliação de riscos
- Aprovação
- Execução
- Verificação`,
        keywords: ['mudança', 'gestão de mudanças', 'impacto', 'aprovação'],
        frameworks: {
            iso27001: ['A.8.19'],
            cobit: ['APO11'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-011',
        title: 'Norma de Gestão de Vulnerabilidades',
        level: 2,
        category: 'Vulnerabilidades',
        summary: 'Define requisitos para gestão de vulnerabilidades',
        content: `# NOR-011 - Norma de Gestão de Vulnerabilidades

## 1. OBJETIVO
Estabelecer requisitos para gestão de vulnerabilidades.

## 2. PRAZOS
| Severidade | Prazo | Crítico |
|------------|-------|---------|
| Crítica | 24h | Imediato |
| Alta | 72h | Imediato |
| Média | 7 dias | Planejado |
| Baixa | 30 dias | Planejado |

## 3. PROCESSO
- Detecção
- Classificação
- Remediação
- Verificação`,
        keywords: ['vulnerabilidade', 'severidade', 'remediação', 'CVE'],
        frameworks: {
            iso27001: ['A.8.8'],
            nist: ['ID.RA'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-012',
        title: 'Norma de Gestão de Riscos',
        level: 2,
        category: 'Riscos',
        summary: 'Define a metodologia de gestão de riscos',
        content: `# NOR-012 - Norma de Gestão de Riscos

## 1. OBJETIVO
Estabelecer a metodologia de gestão de riscos.

## 2. MATRIZ DE RISCO
- Probabilidade: Baixa, Média, Alta
- Impacto: Baixo, Médio, Alto, Crítico

## 3. APETITE DE RISCO
- Aceitar riscos baixos
- Tratar riscos médios
- Evitar riscos altos e críticos`,
        keywords: ['risco', 'matriz de risco', 'apetite de risco', 'tratamento'],
        frameworks: {
            iso27001: ['A.8.1'],
            nist: ['ID.RA'],
            cobit: ['APO12'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-002', // Referência à Política de Gestão de Riscos
    },
    {
        code: 'NOR-013',
        title: 'Norma de Gestão de Terceiros',
        level: 2,
        category: 'Terceiros',
        summary: 'Define requisitos para gestão de terceiros',
        content: `# NOR-013 - Norma de Gestão de Terceiros

## 1. OBJETIVO
Estabelecer requisitos para gestão de terceiros.

## 2. AVALIAÇÃO
- Due diligence
- Avaliação de riscos
- Questionário de segurança

## 3. CONTRATOS
- Cláusulas de segurança
- NDA (Acordo de Confidencialidade)
- DPA (Acordo de Proteção de Dados)`,
        keywords: ['terceiro', 'fornecedor', 'due diligence', 'contrato'],
        frameworks: {
            iso27001: ['A.8.21'],
            nist: ['ID.AM'],
            cobit: ['APO10'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
    {
        code: 'NOR-014',
        title: 'Norma de Acesso Remoto',
        level: 2,
        category: 'Acessos',
        summary: 'Define requisitos para acesso remoto',
        content: `# NOR-014 - Norma de Acesso Remoto

## 1. OBJETIVO
Estabelecer requisitos para acesso remoto.

## 2. REQUISITOS
- VPN obrigatória
- MFA obrigatória
- Dispositivos gerenciados

## 3. PROIBIÇÕES
- Acesso de dispositivos pessoais
- Acesso de redes públicas`,
        keywords: ['remoto', 'VPN', 'MFA', 'acesso externo'],
        frameworks: {
            iso27001: ['A.9.2', 'A.9.4'],
            nist: ['PR.AC'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-003', // Referência à Política de Controle de Acesso
    },
    {
        code: 'NOR-015',
        title: 'Norma de Descarte Seguro',
        level: 2,
        category: 'Descarte',
        summary: 'Define requisitos para descarte seguro de informações',
        content: `# NOR-015 - Norma de Descarte Seguro

## 1. OBJETIVO
Estabelecer requisitos para descarte seguro.

## 2. TIPOS DE DESCARTE
- Digital: Overwrite, destruição física
- Física: Fragmentação, incineração

## 3. DOCUMENTAÇÃO
- Registro de descarte
- Certificado de destruição`,
        keywords: ['descarte', 'destruição', 'segurança', 'conformidade'],
        frameworks: {
            iso27001: ['A.8.10'],
            nist: ['PR.IP'],
            lgpd: ['Art. 38'],
        },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        mandatory: true,
        policyCode: 'POL-001', // Referência à Política de Segurança da Informação
    },
];
/**
 * Dados dos Procedimentos (Nível 3)
 * 16 Procedimentos operacionais
 */
const proceduresData = [
    {
        code: 'PRC-001',
        title: 'Concessão de Acesso',
        level: 3,
        category: 'Acessos',
        summary: 'Procedimento para concessão de acesso a usuários',
        content: `# PRC-001 - Procedimento de Concessão de Acesso

## 1. OBJETIVO
Estabelecer o fluxo de concessão de acesso a usuários.

## 2. SOLICITAÇÃO
- Usuário preenche formulário
- Gestor aprova solicitação

## 3. EXECUÇÃO
- TI cria acesso
- Registra no sistema

## 4. COMUNICAÇÃO
- Notificar usuário
- Informar responsabilidades`,
        keywords: ['acesso', 'concessão', 'solicitação', 'aprovação'],
        frameworks: { iso27001: ['A.9.2'], nist: ['PR.AC'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-002', // Referência à Norma de Controle de Acesso
        steps: [
            {
                order: 1,
                description: 'Receber solicitação de acesso do gestor',
                responsible: 'Gestor de Acesso',
                expectedTime: '2 horas',
            },
            {
                order: 2,
                description: 'Validar justificativa e nível de acesso',
                responsible: 'Gestor de Acesso',
                expectedTime: '4 horas',
            },
            {
                order: 3,
                description: 'Criar usuário e configurar permissões',
                responsible: 'Analista de SI',
                expectedTime: '8 horas',
            },
            {
                order: 4,
                description: 'Enviar credenciais de forma segura',
                responsible: 'Analista de SI',
                expectedTime: '2 horas',
            },
        ],
        inputs: ['Solicitação formal do gestor'],
        outputs: ['Usuário criado e ativo'],
    },
    {
        code: 'PRC-002',
        title: 'Alteração de Acesso',
        level: 3,
        category: 'Acessos',
        summary: 'Procedimento para alteração de acesso de usuários',
        content: `# PRC-002 - Procedimento de Alteração de Acesso

## 1. OBJETIVO
Estabelecer o fluxo de alteração de acesso.

## 2. SOLICITAÇÃO
- Usuário ou gestor solicita alteração
- Justificativa formal

## 3. EXECUÇÃO
- Analista avalia impacto
- Realiza alteração

## 4. REGISTRO
- Registrar alteração
- Atualizar inventário`,
        keywords: ['alteração', 'acesso', 'modificação', 'permissão'],
        frameworks: { iso27001: ['A.9.2'], nist: ['PR.AC'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-002',
        steps: [
            {
                order: 1,
                description: 'Receber solicitação de alteração de acesso',
                responsible: 'Gestor de Acesso',
                expectedTime: '2 horas',
            },
            {
                order: 2,
                description: 'Avaliar impacto da alteração',
                responsible: 'Gestor de Acesso',
                expectedTime: '4 horas',
            },
            {
                order: 3,
                description: 'Executar alteração de permissões',
                responsible: 'Analista de SI',
                expectedTime: '4 horas',
            },
        ],
        inputs: ['Solicitação formal'],
        outputs: ['Permissões atualizadas'],
    },
    {
        code: 'PRC-003',
        title: 'Revogação de Acesso',
        level: 3,
        category: 'Acessos',
        summary: 'Procedimento para revogação de acesso de usuários',
        content: `# PRC-003 - Procedimento de Revogação de Acesso

## 1. OBJETIVO
Estabelecer o fluxo de revogação de acesso.

## 2. MOTIVOS
- Desligamento
- Mudança de função
- Solicitação do gestor

## 3. EXECUÇÃO
- Revogar em até 24 horas
- Registrar revogação

## 4. VERIFICAÇÃO
- Confirmar revogação
- Notificar gestor`,
        keywords: ['revogação', 'acesso', 'bloqueio', 'desligamento'],
        frameworks: { iso27001: ['A.9.2'], nist: ['PR.AC'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-002',
        steps: [
            {
                order: 1,
                description: 'Receber notificação de desligamento/mudança',
                responsible: 'RH / Gestor',
                expectedTime: '2 horas',
            },
            {
                order: 2,
                description: 'Revogar todos os acessos do usuário',
                responsible: 'Analista de SI',
                expectedTime: '4 horas',
            },
            {
                order: 3,
                description: 'Confirmar revogação com gestor',
                responsible: 'Gestor de Acesso',
                expectedTime: '2 horas',
            },
        ],
        inputs: ['Notificação de desligamento'],
        outputs: ['Acessos revogados'],
    },
    {
        code: 'PRC-004',
        title: 'Revisão Periódica de Acessos',
        level: 3,
        category: 'Acessos',
        summary: 'Procedimento para revisão periódica de acessos',
        content: `# PRC-004 - Procedimento de Revisão Periódica de Acessos

## 1. OBJETIVO
Estabelecer o fluxo de revisão periódica de acessos.

## 2. FREQUÊNCIA
- A cada 90 dias

## 3. PROCESSO
- Listar usuários ativos
- Gestor valida cada acesso
- Revogar acessos não validados

## 4. REGISTRO
- Registrar resultado
- Relatório de revisão`,
        keywords: ['revisão', 'acesso', 'periódica', 'validação'],
        frameworks: { iso27001: ['A.9.2'], nist: ['PR.AC'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-002',
        steps: [
            {
                order: 1,
                description: 'Gerar lista de acessos ativos',
                responsible: 'Analista de SI',
                expectedTime: '4 horas',
            },
            {
                order: 2,
                description: 'Enviar lista para gestores validarem',
                responsible: 'Gestor de Acesso',
                expectedTime: '8 horas',
            },
            {
                order: 3,
                description: 'Revogar acessos não validados',
                responsible: 'Analista de SI',
                expectedTime: '8 horas',
            },
            {
                order: 4,
                description: 'Gerar relatório de revisão',
                responsible: 'Gestor de Acesso',
                expectedTime: '4 horas',
            },
        ],
        inputs: ['Lista de usuários ativos'],
        outputs: ['Relatório de revisão'],
    },
    {
        code: 'PRC-005',
        title: 'Registro de Incidentes',
        level: 3,
        category: 'Incidentes',
        summary: 'Procedimento para registro de incidentes de segurança',
        content: `# PRC-005 - Procedimento de Registro de Incidentes

## 1. OBJETIVO
Estabelecer o fluxo de registro de incidentes.

## 2. CANAIS DE REGISTRO
- Chamado
- E-mail
- Telefone

## 3. INFORMAÇÕES OBRIGATÓRIAS
- Descrição
- Data/Hora
- Impacto estimado

## 4. RESPONSÁVEL
- Qualquer colaborador
- Gestor de Incidentes`,
        keywords: ['incidente', 'registro', 'chamado', 'segurança'],
        frameworks: { iso27001: ['A.8.26'], nist: ['DE.AE'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-009',
        steps: [
            {
                order: 1,
                description: 'Identificar e classificar o incidente',
                responsible: 'Colaborador / Gestor de Incidentes',
                expectedTime: '1 hora',
            },
            {
                order: 2,
                description: 'Registrar no sistema de chamados',
                responsible: 'Colaborador / Gestor de Incidentes',
                expectedTime: '1 hora',
            },
        ],
        inputs: ['Notificação de incidente'],
        outputs: ['Incidente registrado'],
    },
    {
        code: 'PRC-006',
        title: 'Tratamento de Incidentes',
        level: 3,
        category: 'Incidentes',
        summary: 'Procedimento para tratamento de incidentes de segurança',
        content: `# PRC-006 - Procedimento de Tratamento de Incidentes

## 1. OBJETIVO
Estabelecer o fluxo de tratamento de incidentes.

## 2. CLASSIFICAÇÃO
- Baixa: 48h
- Média: 24h
- Alta: 8h
- Crítica: 1h

## 3. PROCESSO
- Análise
- Contenção
- Erradicação
- Recuperação`,
        keywords: ['tratamento', 'incidente', 'contenção', 'recuperação'],
        frameworks: { iso27001: ['A.8.26'], nist: ['DE.AE'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-009',
        steps: [
            {
                order: 1,
                description: 'Classificar severidade do incidente',
                responsible: 'Gestor de Incidentes',
                expectedTime: '1 hora',
            },
            {
                order: 2,
                description: 'Executar contenção imediata se necessário',
                responsible: 'Time de Resposta',
                expectedTime: '2 horas',
            },
            {
                order: 3,
                description: 'Realizar análise de causa raiz',
                responsible: 'Time de Resposta',
                expectedTime: '8 horas',
            },
            {
                order: 4,
                description: 'Aplicar correções e recuperar operações',
                responsible: 'Time de Resposta',
                expectedTime: '8 horas',
            },
        ],
        inputs: ['Incidente registrado'],
        outputs: ['Incidente tratado'],
    },
    {
        code: 'PRC-007',
        title: 'Comunicação de Incidentes',
        level: 3,
        category: 'Incidentes',
        summary: 'Procedimento para comunicação de incidentes',
        content: `# PRC-007 - Procedimento de Comunicação de Incidentes

## 1. OBJETIVO
Estabelecer o fluxo de comunicação de incidentes.

## 2. PÚBLICOS
- Equipe de resposta
- Gestão
- Áreas afetadas
- ANPD (LGPD)

## 3. PRAZOS
- Crítico: Imediato
- Média: 24h
- Baixa: 48h

## 4. CANAIS
- E-mail
- Reunião
- Comunicação oficial`,
        keywords: ['comunicação', 'incidente', 'informação', 'notificação'],
        frameworks: { iso27001: ['A.8.26'], lgpd: ['Art. 48'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-009',
        steps: [
            {
                order: 1,
                description: 'Identificar públicos afetados',
                responsible: 'Gestor de Incidentes',
                expectedTime: '2 horas',
            },
            {
                order: 2,
                description: 'Preparar comunicado',
                responsible: 'Gestor de Incidentes',
                expectedTime: '4 horas',
            },
            {
                order: 3,
                description: 'Enviar comunicação nos canais definidos',
                responsible: 'Gestor de Incidentes',
                expectedTime: '2 horas',
            },
        ],
        inputs: ['Incidente tratado'],
        outputs: ['Comunicação enviada'],
    },
    {
        code: 'PRC-008',
        title: 'Escalonamento de Incidentes',
        level: 3,
        category: 'Incidentes',
        summary: 'Procedimento para escalonamento de incidentes',
        content: `# PRC-008 - Procedimento de Escalonamento de Incidentes

## 1. OBJETIVO
Estabelecer o fluxo de escalonamento de incidentes.

## 2. NÍVEIS DE ESCALONAMENTO
- Nível 1: Suporte inicial
- Nível 2: Especialista
- Nível 3: Gestão

## 3. REGRAS
- Incidente crítico: escalonamento imediato
- Incidentes sem resolução em 4h
- Incidentes com impacto de negócio`,
        keywords: ['escalonamento', 'incidente', 'nível', 'suporte'],
        frameworks: { iso27001: ['A.8.26'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-009',
        steps: [
            {
                order: 1,
                description: 'Avaliar necessidade de escalonamento',
                responsible: 'Analista de Suporte',
                expectedTime: '1 hora',
            },
            {
                order: 2,
                description: 'Escalonar conforme critérios estabelecidos',
                responsible: 'Analista de Suporte',
                expectedTime: '1 hora',
            },
            {
                order: 3,
                description: 'Acompanhar resolução no novo nível',
                responsible: 'Supervisor',
                expectedTime: '4 horas',
            },
        ],
        inputs: ['Incidente sem resolução'],
        outputs: ['Incidente escalonado'],
    },
    {
        code: 'PRC-009',
        title: 'Execução de Varreduras de Vulnerabilidades',
        level: 3,
        category: 'Vulnerabilidades',
        summary: 'Procedimento para execução de varreduras de vulnerabilidades',
        content: `# PRC-009 - Procedimento de Execução de Varreduras

## 1. OBJETIVO
Estabelecer fluxo para execução de varreduras.

## 2. FREQUÊNCIA
- Mensal: Sistemas críticos
- Trimestral: Todos os sistemas

## 3. FERRAMENTAS
- Ferramentas aprovadas pela segurança

## 4. PROCESSO
- Agendar varredura
- Executar varredura
- Consolidar resultados`,
        keywords: ['varredura', 'vulnerabilidade', 'scan', 'CVE'],
        frameworks: { iso27001: ['A.8.8'], nist: ['ID.RA'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-011',
        steps: [
            {
                order: 1,
                description: 'Agendar varredura com stakeholders',
                responsible: 'Analista de Segurança',
                expectedTime: '4 horas',
            },
            {
                order: 2,
                description: 'Executar varredura com ferramenta aprovada',
                responsible: 'Analista de Segurança',
                expectedTime: '8 horas',
            },
            {
                order: 3,
                description: 'Consolidar e classificar resultados',
                responsible: 'Analista de Segurança',
                expectedTime: '8 horas',
            },
        ],
        inputs: ['Cronograma de varreduras'],
        outputs: ['Relatório de vulnerabilidades'],
    },
    {
        code: 'PRC-010',
        title: 'Classificação das Vulnerabilidades',
        level: 3,
        category: 'Vulnerabilidades',
        summary: 'Procedimento para classificação de vulnerabilidades',
        content: `# PRC-010 - Procedimento de Classificação

## 1. OBJETIVO
Estabelecer fluxo para classificação de vulnerabilidades.

## 2. SEVERIDADE
- CVSS > 9.0: Crítica
- CVSS 7.0-8.9: Alta
- CVSS 4.0-6.9: Média
- CVSS < 4.0: Baixa

## 3. PROCESSO
- Analisar vulnerabilidade
- Classificar por severidade
- Priorizar remediação`,
        keywords: ['classificação', 'vulnerabilidade', 'CVSS', 'severidade'],
        frameworks: { iso27001: ['A.8.8'], nist: ['ID.RA'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-011',
        steps: [
            {
                order: 1,
                description: 'Analisar descrição da vulnerabilidade',
                responsible: 'Analista de Segurança',
                expectedTime: '2 horas',
            },
            {
                order: 2,
                description: 'Calcular score CVSS',
                responsible: 'Analista de Segurança',
                expectedTime: '1 hora',
            },
            {
                order: 3,
                description: 'Classificar por severidade',
                responsible: 'Analista de Segurança',
                expectedTime: '1 hora',
            },
        ],
        inputs: ['Vulnerabilidade detectada'],
        outputs: ['Vulnerabilidade classificada'],
    },
    {
        code: 'PRC-011',
        title: 'Aplicação de Correções de Vulnerabilidades',
        level: 3,
        category: 'Vulnerabilidades',
        summary: 'Procedimento para aplicação de correções de vulnerabilidades',
        content: `# PRC-011 - Procedimento de Aplicação de Correções

## 1. OBJETIVO
Estabelecer fluxo para aplicação de correções de vulnerabilidades.

## 2. PRAZOS
- Críticas: 24h
- Alta: 72h
- Média: 7 dias
- Baixa: 30 dias

## 3. PROCESSO
- Testar correção
- Aplicar em ambiente
- Verificar resolução`,
        keywords: ['correção', 'patch', 'vulnerabilidade', 'remediação'],
        frameworks: { iso27001: ['A.8.8'], nist: ['PR.IP'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-011',
        steps: [
            {
                order: 1,
                description: 'Validar disponibilidade de patch/correção',
                responsible: 'Analista de Segurança',
                expectedTime: '4 horas',
            },
            {
                order: 2,
                description: 'Testar em ambiente controlado',
                responsible: 'Analista de Sistemas',
                expectedTime: '8 horas',
            },
            {
                order: 3,
                description: 'Aplicar em produção',
                responsible: 'Analista de Sistemas',
                expectedTime: '4 horas',
            },
            {
                order: 4,
                description: 'Verificar resolução da vulnerabilidade',
                responsible: 'Analista de Segurança',
                expectedTime: '4 horas',
            },
        ],
        inputs: ['Vulnerabilidade classificada'],
        outputs: ['Vulnerabilidade corrigida'],
    },
    {
        code: 'PRC-012',
        title: 'Reteste de Vulnerabilidades',
        level: 3,
        category: 'Vulnerabilidades',
        summary: 'Procedimento para reteste de vulnerabilidades corrigidas',
        content: `# PRC-012 - Procedimento de Reteste

## 1. OBJETIVO
Estabelecer fluxo para reteste de vulnerabilidades.

## 2. PROCESSO
- Reexecutar varredura
- Verificar correção
- Documentar resultado

## 3. FREQUÊNCIA
- Após cada correção`,
        keywords: ['reteste', 'verificação', 'correção', 'validação'],
        frameworks: { iso27001: ['A.8.8'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-011',
        steps: [
            {
                order: 1,
                description: 'Reexecutar varredura de vulnerabilidades',
                responsible: 'Analista de Segurança',
                expectedTime: '4 horas',
            },
            {
                order: 2,
                description: 'Comparar resultados pré e pós-correção',
                responsible: 'Analista de Segurança',
                expectedTime: '2 horas',
            },
            {
                order: 3,
                description: 'Validar correção efetiva',
                responsible: 'Analista de Segurança',
                expectedTime: '2 horas',
            },
        ],
        inputs: ['Vulnerabilidade corrigida'],
        outputs: ['Vulnerabilidade validada'],
    },
    {
        code: 'PRC-013',
        title: 'Solicitação de Mudança',
        level: 3,
        category: 'Mudanças',
        summary: 'Procedimento para solicitação de mudança',
        content: `# PRC-013 - Procedimento de Solicitação de Mudança

## 1. OBJETIVO
Estabelecer fluxo para solicitação de mudança.

## 2. TIPOS DE MUDANÇA
- Emergencial
- Normal
- Padrão

## 3. INFORMAÇÕES OBRIGATÓRIAS
- Descrição
- Justificativa
- Impacto estimado
- Plano de reversão`,
        keywords: ['mudança', 'solicitação', 'impacto', 'aprovação'],
        frameworks: { iso27001: ['A.8.19'], cobit: ['APO11'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-010',
        steps: [
            {
                order: 1,
                description: 'Preencher formulário de solicitação',
                responsible: 'Solicitante',
                expectedTime: '2 horas',
            },
            {
                order: 2,
                description: 'Avaliar impacto da mudança',
                responsible: 'Gestor de Mudanças',
                expectedTime: '4 horas',
            },
            {
                order: 3,
                description: 'Submeter para aprovação',
                responsible: 'Gestor de Mudanças',
                expectedTime: '2 horas',
            },
        ],
        inputs: ['Necessidade de mudança'],
        outputs: ['Solicitação formalizada'],
    },
    {
        code: 'PRC-014',
        title: 'Avaliação de Riscos de Mudança',
        level: 3,
        category: 'Mudanças',
        summary: 'Procedimento para avaliação de riscos de mudança',
        content: `# PRC-014 - Procedimento de Avaliação de Riscos

## 1. OBJETIVO
Estabelecer fluxo para avaliação de riscos de mudança.

## 2. CRITÉRIOS
- Probabilidade de falha
- Impacto em produção
- Capacidade de reversão

## 3. NÍVEIS
- Baixo: Ação padrão
- Médio: Monitoramento
- Alto: Plano de contingência`,
        keywords: ['risco', 'mudança', 'avaliação', 'impacto'],
        frameworks: { iso27001: ['A.8.19'], cobit: ['APO11'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-010',
        steps: [
            {
                order: 1,
                description: 'Identificar riscos associados à mudança',
                responsible: 'Gestor de Mudanças',
                expectedTime: '4 horas',
            },
            {
                order: 2,
                description: 'Classificar riscos por severidade',
                responsible: 'Gestor de Mudanças',
                expectedTime: '2 horas',
            },
            {
                order: 3,
                description: 'Definir planos de mitigação',
                responsible: 'Gestor de Mudanças',
                expectedTime: '4 horas',
            },
        ],
        inputs: ['Solicitação de mudança'],
        outputs: ['Avaliação de riscos'],
    },
    {
        code: 'PRC-015',
        title: 'Aprovação da Mudança',
        level: 3,
        category: 'Mudanças',
        summary: 'Procedimento para aprovação de mudança',
        content: `# PRC-015 - Procedimento de Aprovação

## 1. OBJETIVO
Estabelecer fluxo para aprovação de mudança.

## 2. NÍVEIS DE APROVAÇÃO
- Emergencial: Gestor imediato
- Normal: Comitê de Mudanças
- Padrão: Gestor de Mudanças

## 3. DOCUMENTAÇÃO
- Registro da aprovação
- Data e hora`,
        keywords: ['aprovação', 'mudança', 'autorização', 'comitê'],
        frameworks: { iso27001: ['A.8.19'], cobit: ['APO11'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-010',
        steps: [
            {
                order: 1,
                description: 'Revisar documentação da mudança',
                responsible: 'Comitê de Mudanças',
                expectedTime: '8 horas',
            },
            {
                order: 2,
                description: 'Votar ou aprovar formalmente',
                responsible: 'Comitê de Mudanças',
                expectedTime: '2 horas',
            },
            {
                order: 3,
                description: 'Documentar aprovação',
                responsible: 'Gestor de Mudanças',
                expectedTime: '2 horas',
            },
        ],
        inputs: ['Solicitação avaliada'],
        outputs: ['Mudança aprovada'],
    },
    {
        code: 'PRC-016',
        title: 'Plano de Reversão de Mudança',
        level: 3,
        category: 'Mudanças',
        summary: 'Procedimento para plano de reversão de mudança',
        content: `# PRC-016 - Procedimento de Plano de Reversão

## 1. OBJETIVO
Estabelecer fluxo para plano de reversão de mudança.

## 2. REQUISITOS
- Tempo de reversão < 1 hora
- Procedimento documentado
- Responsáveis definidos

## 3. TESTE
- Teste do plano de reversão
- Validação de funcionamento`,
        keywords: ['reversão', 'mudança', 'rollback', 'contingência'],
        frameworks: { iso27001: ['A.8.19'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        standardCode: 'NOR-010',
        steps: [
            {
                order: 1,
                description: 'Documentar procedimento de reversão',
                responsible: 'Gestor de Mudanças',
                expectedTime: '4 horas',
            },
            {
                order: 2,
                description: 'Testar reversão em ambiente controlado',
                responsible: 'Analista de Sistemas',
                expectedTime: '4 horas',
            },
            {
                order: 3,
                description: 'Validar eficácia do plano',
                responsible: 'Gestor de Mudanças',
                expectedTime: '2 horas',
            },
        ],
        inputs: ['Mudança aprovada'],
        outputs: ['Plano de reversão validado'],
    },
];
/**
 * Dados das Instruções de Trabalho (Nível 4)
 * 10 Instruções de Trabalho
 */
const workInstructionsData = [
    {
        code: 'INS-001',
        title: 'Criação de Usuários',
        level: 4,
        category: 'Acessos',
        summary: 'Instrução detalhada para criação de usuários',
        content: `# INS-001 - Instrução de Trabalho: Criação de Usuários

## 1. OBJETIVO
Instruir o analista de SI na criação de usuários.

## 2. PRÉ-REQUISITOS
- Solicitação aprovada
- Dados do usuário
- Perfil de acesso

## 3. PASSOS
1. Acessar sistema de gestão de identidade
2. Selecionar "Novo Usuário"
3. Preencher dados
4. Configurar permissões
5. Ativar conta
6. Enviar credenciais`,
        keywords: ['criação', 'usuário', 'passos', 'instrução'],
        frameworks: { iso27001: ['A.9.2'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-001',
        detailedSteps: 'Passo a passo detalhado para criação de usuários',
        tools: ['Sistema de Identidade', 'E-mail corporativo'],
        prerequisites: ['Solicitação aprovada', 'Dados cadastrais'],
        verificationPoints: ['Conta ativa', 'Permissões corretas'],
    },
    {
        code: 'INS-002',
        title: 'Configuração de VPN',
        level: 4,
        category: 'Infraestrutura',
        summary: 'Instrução detalhada para configuração de VPN',
        content: `# INS-002 - Instrução de Trabalho: Configuração de VPN

## 1. OBJETIVO
Instruir o usuário na configuração de VPN.

## 2. PRÉ-REQUISITOS
- Acesso à internet
- Credenciais de acesso
- Software VPN instalado

## 3. PASSOS
1. Abrir software VPN
2. Inserir credenciais
3. Selecionar servidor
4. Conectar
5. Validar conexão`,
        keywords: ['VPN', 'configuração', 'conexão', 'remoto'],
        frameworks: { iso27001: ['A.9.2', 'A.9.4'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-001',
        detailedSteps: 'Passo a passo detalhado para configurar VPN',
        tools: ['Software VPN', 'Token de autenticação'],
        prerequisites: ['Acesso à internet', 'Credenciais de acesso'],
        verificationPoints: ['Conexão estabelecida', 'Acesso aos recursos'],
    },
    {
        code: 'INS-003',
        title: 'Configuração do EDR',
        level: 4,
        category: 'Segurança',
        summary: 'Instrução detalhada para configuração do EDR',
        content: `# INS-003 - Instrução de Trabalho: Configuração do EDR

## 1. OBJETIVO
Instruir o analista na configuração do EDR.

## 2. PRÉ-REQUISITOS
- Acesso administrativo
- Licença do EDR
- Conexão com console

## 3. PASSOS
1. Instalar agente
2. Configurar política
3. Conectar ao console
4. Verificar comunicação`,
        keywords: ['EDR', 'configuração', 'segurança', 'endpoint'],
        frameworks: { iso27001: ['A.8.7'], nist: ['PR.IP'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-009',
        detailedSteps: 'Passo a passo detalhado para configurar EDR',
        tools: ['Console de gerenciamento', 'Agente EDR'],
        prerequisites: ['Acesso administrativo', 'Licença válida'],
        verificationPoints: ['Agente instalado', 'Console conectado'],
    },
    {
        code: 'INS-004',
        title: 'Configuração do Firewall',
        level: 4,
        category: 'Infraestrutura',
        summary: 'Instrução detalhada para configuração do firewall',
        content: `# INS-004 - Instrução de Trabalho: Configuração do Firewall

## 1. OBJETIVO
Instruir o analista na configuração do firewall.

## 2. PRÉ-REQUISITOS
- Acesso administrativo
- Políticas definidas

## 3. PASSOS
1. Acessar console
2. Configurar regras
3. Testar conectividade
4. Salvar configuração`,
        keywords: ['firewall', 'configuração', 'regras', 'rede'],
        frameworks: { iso27001: ['A.8.7'], nist: ['PR.AC'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-009',
        detailedSteps: 'Passo a passo detalhado para configurar firewall',
        tools: ['Console do Firewall'],
        prerequisites: ['Acesso administrativo', 'Políticas de rede definidas'],
        verificationPoints: ['Regras aplicadas', 'Tráfego funcionando'],
    },
    {
        code: 'INS-005',
        title: 'Configuração do SIEM',
        level: 4,
        category: 'Segurança',
        summary: 'Instrução detalhada para configuração do SIEM',
        content: `# INS-005 - Instrução de Trabalho: Configuração do SIEM

## 1. OBJETIVO
Instruir o analista na configuração do SIEM.

## 2. PRÉ-REQUISITOS
- Acesso administrativo
- Fontes de logs configuradas

## 3. PASSOS
1. Configurar fontes de log
2. Definir regras de correlação
3. Criar dashboards
4. Configurar alertas`,
        keywords: ['SIEM', 'configuração', 'logs', 'alertas'],
        frameworks: { iso27001: ['A.8.15'], nist: ['PR.PT'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-009',
        detailedSteps: 'Passo a passo detalhado para configurar SIEM',
        tools: ['Console SIEM', 'Fontes de log'],
        prerequisites: ['Acesso administrativo', 'Fontes de log configuradas'],
        verificationPoints: ['Logs recebidos', 'Alertas ativos'],
    },
    {
        code: 'INS-006',
        title: 'Configuração do WAF',
        level: 4,
        category: 'Segurança',
        summary: 'Instrução detalhada para configuração do WAF',
        content: `# INS-006 - Instrução de Trabalho: Configuração do WAF

## 1. OBJETIVO
Instruir o analista na configuração do WAF.

## 2. PRÉ-REQUISITOS
- Acesso administrativo
- Aplicação protegida

## 3. PASSOS
1. Configurar políticas
2. Definir regras
3. Testar em modo monitor
4. Ativar em modo proteção`,
        keywords: ['WAF', 'configuração', 'web', 'proteção'],
        frameworks: { iso27001: ['A.8.7'], nist: ['PR.AC'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-009',
        detailedSteps: 'Passo a passo detalhado para configurar WAF',
        tools: ['Console WAF', 'Aplicação web'],
        prerequisites: ['Acesso administrativo', 'Aplicação protegida'],
        verificationPoints: ['Regras aplicadas', 'Tráfego analisado'],
    },
    {
        code: 'INS-007',
        title: 'Aplicação de Patches',
        level: 4,
        category: 'Manutenção',
        summary: 'Instrução detalhada para aplicação de patches',
        content: `# INS-007 - Instrução de Trabalho: Aplicação de Patches

## 1. OBJETIVO
Instruir o analista na aplicação de patches.

## 2. PRÉ-REQUISITOS
- Patches testados
- Janela de manutenção

## 3. PASSOS
1. Validar patches
2. Realizar backup
3. Aplicar patches
4. Validar sistemas`,
        keywords: ['patch', 'aplicação', 'atualização', 'segurança'],
        frameworks: { iso27001: ['A.8.8'], nist: ['PR.IP'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-011',
        detailedSteps: 'Passo a passo detalhado para aplicar patches',
        tools: ['Sistema de gestão de patches'],
        prerequisites: ['Patches testados', 'Janela de manutenção'],
        verificationPoints: ['Patches aplicados', 'Sistemas validados'],
    },
    {
        code: 'INS-008',
        title: 'Execução de Backup',
        level: 4,
        category: 'Backup',
        summary: 'Instrução detalhada para execução de backup',
        content: `# INS-008 - Instrução de Trabalho: Execução de Backup

## 1. OBJETIVO
Instruir o analista na execução de backup.

## 2. PRÉ-REQUISITOS
- Backup configurado
- Espaço disponível

## 3. PASSOS
1. Iniciar backup
2. Validar integridade
3. Verificar cópia offsite
4. Documentar`,
        keywords: ['backup', 'execução', 'cópia', 'restauração'],
        frameworks: { iso27001: ['A.8.13'], nist: ['PR.IP'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-001',
        detailedSteps: 'Passo a passo detalhado para executar backup',
        tools: ['Sistema de backup'],
        prerequisites: ['Backup configurado', 'Espaço em disco'],
        verificationPoints: ['Backup concluído', 'Integridade validada'],
    },
    {
        code: 'INS-009',
        title: 'Análise de Indicadores de Segurança',
        level: 4,
        category: 'Monitoramento',
        summary: 'Instrução detalhada para análise de indicadores de segurança',
        content: `# INS-009 - Instrução de Trabalho: Análise de Indicadores

## 1. OBJETIVO
Instruir o analista na análise de indicadores.

## 2. INDICADORES
- Incidentes
- Vulnerabilidades
- Conformidade

## 3. PASSOS
1. Coletar dados
2. Analisar tendências
3. Gerar relatórios
4. Recomendar ações`,
        keywords: ['análise', 'indicadores', 'KPI', 'relatório'],
        frameworks: { iso27001: ['A.8.15'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-006',
        detailedSteps: 'Passo a passo detalhado para análise de indicadores',
        tools: ['SIEM', 'Dashboard', 'Excel'],
        prerequisites: ['Dados disponíveis', 'Acesso aos sistemas'],
        verificationPoints: ['Relatório gerado', 'Recomendações definidas'],
    },
    {
        code: 'INS-010',
        title: 'Coleta de Evidências',
        level: 4,
        category: 'Auditoria',
        summary: 'Instrução detalhada para coleta de evidências',
        content: `# INS-010 - Instrução de Trabalho: Coleta de Evidências

## 1. OBJETIVO
Instruir o analista na coleta de evidências.

## 2. TIPOS DE EVIDÊNCIAS
- Registros
- Logs
- Documentos

## 3. PASSOS
1. Identificar evidências
2. Coletar dados
3. Preservar integridade
4. Arquivar`,
        keywords: ['evidência', 'coleta', 'auditoria', 'registro'],
        frameworks: { iso27001: ['A.8.17'] },
        effectiveDate: new Date('2024-01-01'),
        reviewDate: new Date('2025-01-01'),
        procedureCode: 'PRC-006',
        detailedSteps: 'Passo a passo detalhado para coleta de evidências',
        tools: ['Sistemas de registro', 'Ferramentas de log'],
        prerequisites: ['Acesso aos sistemas', 'Lista de evidências'],
        verificationPoints: ['Evidências coletadas', 'Integridade preservada'],
    },
];
/**
 * Função principal de seed
 */
async function seedGovernance() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';
        const dbName = process.env.MONGODB_DB_NAME || 'code_assessment';
        console.log(`🔗 Conectando ao MongoDB...`);
        await mongoose_1.default.connect(mongoUri, { dbName });
        console.log('✅ Conectado ao MongoDB');
        // Buscar primeiro admin para ser o criador dos documentos
        // 🔧 CORREÇÃO: Verificar se mongoose.connection.db existe antes de acessar
        let adminId = ADMIN_USER_ID;
        if (mongoose_1.default.connection.db) {
            const adminUser = await mongoose_1.default.connection.db
                .collection('users')
                .findOne({ role: 'ADMIN' });
            adminId = adminUser?._id?.toString() || ADMIN_USER_ID;
        }
        else {
            console.warn('⚠️ Conexão com o banco não disponível, usando admin ID padrão');
        }
        console.log(`👤 Usando admin ID: ${adminId}`);
        // Limpar documentos existentes (apenas para o seed)
        console.log('🧹 Removendo documentos de governança existentes...');
        await GovernanceDocument_js_1.GovernanceDocument.deleteMany({});
        console.log('✅ Documentos removidos');
        // ============================================================
        // 1. POLÍTICAS
        // ============================================================
        console.log(`📝 Inserindo ${policiesData.length} políticas...`);
        const policies = policiesData.map(p => ({
            ...p,
            createdBy: adminId,
            updatedBy: adminId,
            companyId: null, // 🆕 NULO para documentos globais
            isGlobal: true, // 🆕 DOCUMENTO GLOBAL
            version: 'v1.0',
            status: 'approved',
            versionHistory: [
                {
                    version: 'v1.0',
                    date: new Date(),
                    user: adminId,
                    changes: 'Criação inicial do documento',
                },
            ],
            attachments: [],
        }));
        const insertedPolicies = await Policy_js_1.Policy.insertMany(policies);
        console.log(`✅ ${insertedPolicies.length} políticas inseridas`);
        // Mapear códigos das políticas para seus IDs
        insertedPolicies.forEach(p => {
            policyIdMap[p.code] = p._id.toString();
        });
        console.log(`📋 Mapeamento de políticas criado: ${Object.keys(policyIdMap).length} políticas`);
        // ============================================================
        // 2. NORMAS (com referência às Políticas)
        // ============================================================
        console.log(`📝 Inserindo ${standardsData.length} normas...`);
        const standards = standardsData.map(s => {
            // Buscar o ID da política referenciada
            const policyId = policyIdMap[s.policyCode];
            if (!policyId) {
                console.warn(`⚠️ Política ${s.policyCode} não encontrada para a norma ${s.code}`);
                return null;
            }
            return {
                ...s,
                policyId: policyId,
                createdBy: adminId,
                updatedBy: adminId,
                companyId: null, // 🆕 NULO para documentos globais
                isGlobal: true, // 🆕 DOCUMENTO GLOBAL
                version: 'v1.0',
                status: 'approved',
                versionHistory: [
                    {
                        version: 'v1.0',
                        date: new Date(),
                        user: adminId,
                        changes: 'Criação inicial do documento',
                    },
                ],
                attachments: [],
            };
        }).filter(s => s !== null);
        if (standards.length > 0) {
            await Standard_js_1.Standard.insertMany(standards);
            console.log(`✅ ${standards.length} normas inseridas`);
        }
        else {
            console.warn('⚠️ Nenhuma norma foi inserida');
        }
        // Mapear códigos das normas para seus IDs
        const standardIdMap = {};
        const insertedStandards = await Standard_js_1.Standard.find({ code: { $in: standardsData.map(s => s.code) } });
        insertedStandards.forEach(s => {
            standardIdMap[s.code] = s._id.toString();
        });
        // ============================================================
        // 3. PROCEDIMENTOS (com referência às Normas)
        // ============================================================
        console.log(`📝 Inserindo ${proceduresData.length} procedimentos...`);
        const procedures = proceduresData.map(p => {
            const standardId = standardIdMap[p.standardCode];
            if (!standardId) {
                console.warn(`⚠️ Norma ${p.standardCode} não encontrada para o procedimento ${p.code}`);
                return null;
            }
            return {
                ...p,
                standardId: standardId,
                createdBy: adminId,
                updatedBy: adminId,
                companyId: null, // 🆕 NULO para documentos globais
                isGlobal: true, // 🆕 DOCUMENTO GLOBAL
                version: 'v1.0',
                status: 'approved',
                versionHistory: [
                    {
                        version: 'v1.0',
                        date: new Date(),
                        user: adminId,
                        changes: 'Criação inicial do documento',
                    },
                ],
                attachments: [],
            };
        }).filter(p => p !== null);
        if (procedures.length > 0) {
            await Procedure_js_1.Procedure.insertMany(procedures);
            console.log(`✅ ${procedures.length} procedimentos inseridos`);
        }
        else {
            console.warn('⚠️ Nenhum procedimento foi inserido');
        }
        // Mapear códigos dos procedimentos para seus IDs
        const procedureIdMap = {};
        const insertedProcedures = await Procedure_js_1.Procedure.find({ code: { $in: proceduresData.map(p => p.code) } });
        insertedProcedures.forEach(p => {
            procedureIdMap[p.code] = p._id.toString();
        });
        // ============================================================
        // 4. INSTRUÇÕES DE TRABALHO (com referência aos Procedimentos)
        // ============================================================
        console.log(`📝 Inserindo ${workInstructionsData.length} instruções de trabalho...`);
        const instructions = workInstructionsData.map(i => {
            const procedureId = procedureIdMap[i.procedureCode];
            if (!procedureId) {
                console.warn(`⚠️ Procedimento ${i.procedureCode} não encontrado para a instrução ${i.code}`);
                return null;
            }
            return {
                ...i,
                procedureId: procedureId,
                createdBy: adminId,
                updatedBy: adminId,
                companyId: null, // 🆕 NULO para documentos globais
                isGlobal: true, // 🆕 DOCUMENTO GLOBAL
                version: 'v1.0',
                status: 'approved',
                versionHistory: [
                    {
                        version: 'v1.0',
                        date: new Date(),
                        user: adminId,
                        changes: 'Criação inicial do documento',
                    },
                ],
                attachments: [],
            };
        }).filter(i => i !== null);
        if (instructions.length > 0) {
            await WorkInstruction_js_1.WorkInstruction.insertMany(instructions);
            console.log(`✅ ${instructions.length} instruções de trabalho inseridas`);
        }
        else {
            console.warn('⚠️ Nenhuma instrução de trabalho foi inserida');
        }
        // ============================================================
        // 5. RESUMO FINAL
        // ============================================================
        const totalPolicies = await Policy_js_1.Policy.countDocuments();
        const totalStandards = await Standard_js_1.Standard.countDocuments();
        const totalProcedures = await Procedure_js_1.Procedure.countDocuments();
        const totalInstructions = await WorkInstruction_js_1.WorkInstruction.countDocuments();
        const totalDocuments = await GovernanceDocument_js_1.GovernanceDocument.countDocuments();
        console.log('\n📋 RESUMO DO SEED:');
        console.log(`  - Políticas: ${totalPolicies}`);
        console.log(`  - Normas: ${totalStandards}`);
        console.log(`  - Procedimentos: ${totalProcedures}`);
        console.log(`  - Instruções de Trabalho: ${totalInstructions}`);
        console.log(`  - Total de Documentos: ${totalDocuments}`);
        console.log('\n✅ Seed de governança concluído com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro ao executar seed:', error);
        process.exit(1);
    }
}
seedGovernance();
//# sourceMappingURL=seed-governance.js.map