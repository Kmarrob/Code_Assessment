import mongoose, { Model, Document } from 'mongoose';
export interface IRecommendation extends Document {
    controlId: string;
    controlObjectId: mongoose.Types.ObjectId;
    titulo: string;
    dominio: string;
    recomendacoes: string[];
    solucoesTecnicas?: string[];
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Recommendation: Model<IRecommendation>;
//# sourceMappingURL=Recommendation.d.ts.map