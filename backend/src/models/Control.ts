// backend/src/models/Control.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IControl } from '../types/index.js';

const controlSchema = new Schema<IControl>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    tiposDeControles: {
      type: [String],
      default: [],
    },
    nota: {
      type: String,
      default: '',
    },
    controles: {
      type: String,
      default: '',
    },
    cenarioIdentificado: {
      type: String,
      default: '',
    },
    tipoDeControle: {
      type: [String],
      default: [],
    },
    propriedadeDeSI: {
      type: [String],
      default: [],
    },
    conceitoDeSegurancaCibernetica: {
      type: [String],
      default: [],
    },
    capacidadesOperacionais: {
      type: [String],
      default: [],
    },
    dominioDeSI: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Índices
controlSchema.index({ id: 1 }, { unique: true });
controlSchema.index({ nome: 1 });
controlSchema.index({ nota: 1 });
controlSchema.index({ dominioDeSI: 1 });
controlSchema.index({ tipoDeControle: 1 });

export const Control: Model<IControl> = mongoose.model<IControl>('Control', controlSchema);