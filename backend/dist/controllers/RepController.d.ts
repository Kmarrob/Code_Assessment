import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class RepController {
    /**
     * Listar usuários do preposto
     */
    static listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Criar usuário pelo preposto
     *
     * ============================================================
     * 🆕 v52.1 — SUPORTE A ROLES DE AUDITORIA
     * ============================================================
     *
     * MOTIVO:
     *   O schema de validação Zod (repCreateUserSchema) agora
     *   aceita o campo `role` opcional. Isso significa que
     *   `validation.data` preserva o `role` enviado pelo frontend
     *   e o repassa ao service.
     *
     * 🔧 CORREÇÃO v52.1.1:
     *   O TypeScript reclamava que o tipo do Zod (literal union)
     *   não é diretamente atribuível ao enum UserRole. Aplicamos
     *   um cast EXPLÍCITO para UserRole, mantendo a tipagem
     *   forte sem usar `as any`.
     *
     * COMPATIBILIDADE:
     *   - Se `role` não for enviado, `validation.data.role` fica
     *     `undefined` e o service usa `UserRole.USER` como padrão.
     *
     * ============================================================
     */
    static createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Editar usuário pelo preposto
     *
     * ============================================================
     * 🆕 v52.1 — SUPORTE À EDIÇÃO DE ROLE
     * ============================================================
     *
     * MOTIVO:
     *   Antes, o controller extraía apenas `{ name, email, department }`
     *   de `req.body` e passava ao service SEM o `role`. O REP não
     *   conseguia alterar o role de um usuário existente.
     *
     * SOLUÇÃO:
     *   Incluir `role` na extração e no envio ao service. O service
     *   valida contra a whitelist (ROLES_PERMITIDOS_NO_REP).
     *
     * 🔧 CORREÇÃO v52.1.1:
     *   Cast explícito do `role` para `UserRole` antes de enviar ao
     *   service (mesmo motivo do createUser).
     *
     * COMPATIBILIDADE:
     *   - Se `role` não for enviado, o service não altera o role
     *     atual (comportamento antigo — zero regressão).
     *
     * ============================================================
     */
    static updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Inativar usuário com justificativa
     */
    static inactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Revogar controle com reatribuição
     */
    static revokeControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atribuir controles a um usuário
     */
    static assignControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter progresso de um usuário
     */
    static getUserProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter progresso geral do preposto
     */
    static getOverallProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter estatísticas do preposto
     */
    static getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter controles da empresa do preposto
     *
     * Os controles continuam existindo normalmente no banco de dados.
     * A lista retornada é apenas filtrada para remover controles que já
     * possuem uma atribuição na coleção Assignment.
     */
    static getCompanyControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Busca todos os usuários do preposto com suas respostas (otimizado)
     *
     * GET /api/rep/users-with-responses
     */
    static getUsersWithResponses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar controles já atribuídos ao preposto
     *
     * GET /api/rep/my-assignments
     */
    static getMyAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atribuir controles para o próprio preposto
     *
     * POST /api/rep/assign-to-self
     */
    static assignToSelf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=RepController.d.ts.map