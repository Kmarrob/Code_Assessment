import { IQuestion } from '../models/Question.js';
export declare class QuestionService {
    /**
     * Listar todas as perguntas
     */
    static listQuestions(filters?: {
        search?: string;
        category?: string;
        active?: boolean;
        controlId?: string;
    }): Promise<(import("mongoose").FlattenMaps<{
        _id: import("mongoose").Types.ObjectId;
        controlId: string;
        controlName: string;
        controlCategory: string;
        text: string;
        objective: string;
        answerImplemented: string;
        answerPartial: string;
        answerNotImplemented: string;
        guidance: string;
        attachmentUrl: string;
        attachmentName: string;
        order: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    /**
     * Buscar perguntas por controle
     */
    static getQuestionsByControl(controlId: string): Promise<(import("mongoose").FlattenMaps<{
        _id: import("mongoose").Types.ObjectId;
        controlId: string;
        controlName: string;
        controlCategory: string;
        text: string;
        objective: string;
        answerImplemented: string;
        answerPartial: string;
        answerNotImplemented: string;
        guidance: string;
        attachmentUrl: string;
        attachmentName: string;
        order: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    /**
     * Buscar pergunta por ID
     */
    static getQuestionById(id: string): Promise<import("mongoose").FlattenMaps<{
        _id: import("mongoose").Types.ObjectId;
        controlId: string;
        controlName: string;
        controlCategory: string;
        text: string;
        objective: string;
        answerImplemented: string;
        answerPartial: string;
        answerNotImplemented: string;
        guidance: string;
        attachmentUrl: string;
        attachmentName: string;
        order: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Criar pergunta
     */
    static createQuestion(data: Partial<IQuestion>): Promise<import("mongoose").Document<unknown, {}, IQuestion, {}, {}> & IQuestion & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Atualizar pergunta
     */
    static updateQuestion(id: string, data: Partial<IQuestion>): Promise<import("mongoose").Document<unknown, {}, IQuestion, {}, {}> & IQuestion & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Deletar pergunta
     */
    static deleteQuestion(id: string): Promise<import("mongoose").Document<unknown, {}, IQuestion, {}, {}> & IQuestion & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Ativar/Desativar pergunta
     */
    static toggleActive(id: string): Promise<import("mongoose").Document<unknown, {}, IQuestion, {}, {}> & IQuestion & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
//# sourceMappingURL=QuestionService.d.ts.map