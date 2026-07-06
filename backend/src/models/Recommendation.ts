// backend/src/models/Recommendation.ts
import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IRecommendation extends Document {
  controlId: string;           // ID do controle (ex: "5.18")
  controlObjectId: mongoose.Types.ObjectId; // Referência ao _id do controle
  titulo: string;              // Ex: "5.18 Direitos de acesso"
  dominio: string;             // Ex: "Controles organizacionais"
  recomendacoes: string[];     // Lista de recomendações
  solucoesTecnicas?: string[]; // Opcional - soluções técnicas de apoio
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    controlId: {
      type: String,
      required: [true, 'ID do controle é obrigatório'],
      trim: true,
      index: true,
    },
    controlObjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Control',
      required: [true, 'Referência ao controle é obrigatória'],
      index: true,
    },
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    dominio: {
      type: String,
      required: [true, 'Domínio é obrigatório'],
      trim: true,
      enum: [
        'Controles organizacionais',
        'Controles de pessoas',
        'Controles físicos',
        'Controles tecnológicos',
      ],
    },
    recomendacoes: {
      type: [String],
      required: [true, 'Pelo menos uma recomendação é obrigatória'],
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'Pelo menos uma recomendação deve ser fornecida',
      },
    },
    solucoesTecnicas: {
      type: [String],
      required: false,
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário criador é obrigatório'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário que atualizou é obrigatório'],
    },
  },
  {
    timestamps: true,
  }
);

// Índices para busca eficiente
RecommendationSchema.index({ controlId: 1, controlObjectId: 1 });
RecommendationSchema.index({ dominio: 1 });
RecommendationSchema.index({ createdAt: -1 });

export const Recommendation: Model<IRecommendation> = mongoose.model<IRecommendation>(
  'Recommendation',
  RecommendationSchema
);