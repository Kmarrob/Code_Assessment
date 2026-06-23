import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class QuestionController {
    /**
     * Listar perguntas
     */
    static listQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar perguntas por controle
     */
    static getQuestionsByControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar pergunta por ID
     */
    static getQuestionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Criar pergunta
     */
    static createQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar pergunta
     */
    static updateQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Deletar pergunta
     */
    static deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Ativar/Desativar pergunta
     */
    static toggleActive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=QuestionController.d.ts.map