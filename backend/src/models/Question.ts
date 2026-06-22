// backend/src/models/Question.ts
import mongoose, { Schema, Model } from 'mongoose';

export interface IQuestion {
  _id: mongoose.Types.ObjectId;
  controlId: string;          // ID do controle (ex: 5.1)
  controlName: string;        // Nome do controle
  controlCategory: string;    // Categoria do controle
  text: string;               // Pergunta de avaliação
  objective: string;          // Objetivo da pergunta
  answerImplemented: string;  // Critério para "Implementado"
  answerPartial: string;      // Critério para "Parcialmente Implementado"
  answerNotImplemented: string; // Critério para "Não Implementado"
  guidance: string;           // Orientação / Evidência esperada
  attachmentUrl: string;      // URL do anexo
  attachmentName: string;     // Nome do anexo
  order: number;              // Ordem de exibição
  active: boolean;            // Ativo/Inativo
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    controlId: {
      type: String,
      required: [true, 'ID do controle é obrigatório'],
      trim: true,
    },
    controlName: {
      type: String,
      default: '',
      trim: true,
    },
    controlCategory: {
      type: String,
      enum: ['Controles Organizacionais', 'Controles de Pessoas', 'Controles Físicos', 'Controles Tecnológicos'],
      default: 'Controles Organizacionais',
    },
    text: {
      type: String,
      required: [true, 'Pergunta é obrigatória'],
      trim: true,
    },
    objective: {
      type: String,
      default: '',
      trim: true,
    },
    answerImplemented: {
      type: String,
      default: '',
      trim: true,
    },
    answerPartial: {
      type: String,
      default: '',
      trim: true,
    },
    answerNotImplemented: {
      type: String,
      default: '',
      trim: true,
    },
    guidance: {
      type: String,
      default: '',
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
questionSchema.index({ controlId: 1 });
questionSchema.index({ active: 1 });
questionSchema.index({ controlId: 1, order: 1 });

export const Question: Model<IQuestion> = mongoose.model<IQuestion>('Question', questionSchema);