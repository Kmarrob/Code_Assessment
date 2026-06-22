// backend/src/models/Response.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IResponse } from '../types/index.js';

const responseSchema = new Schema<IResponse>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Atribuição é obrigatória'],
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário é obrigatório'],
    },
    controlId: {
      type: Schema.Types.ObjectId,
      ref: 'Control',
      required: [true, 'Controle é obrigatório'],
    },
    maturityLevel: {
      type: String,
      enum: ['N/A', '0', '1', '2'],
      required: [true, 'Nível de maturidade é obrigatório'],
    },
    scenarioDescription: {
      type: String,
      default: '',
      maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres'],
    },
    evidence: {
      type: [String],
      default: [],
    },
    observations: {
      type: String,
      default: '',
      maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// ÍNDICES OTIMIZADOS
// ============================================

responseSchema.index({ assignmentId: 1 }, { unique: true });
responseSchema.index({ userId: 1, controlId: 1 });
responseSchema.index({ userId: 1, maturityLevel: 1 });
responseSchema.index({ controlId: 1, maturityLevel: 1 });

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Buscar respostas de um usuário
responseSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId })
    .populate('controlId', 'id nome')
    .sort({ submittedAt: -1 });
};

// Buscar respostas de um preposto (via atribuições)
responseSchema.statics.findByRep = function(repId: string) {
  return this.aggregate([
    {
      $lookup: {
        from: 'assignments',
        localField: 'assignmentId',
        foreignField: '_id',
        as: 'assignment',
      },
    },
    { $unwind: '$assignment' },
    { $match: { 'assignment.assignedBy': new mongoose.Types.ObjectId(repId) } },
    {
      $lookup: {
        from: 'controls',
        localField: 'controlId',
        foreignField: '_id',
        as: 'control',
      },
    },
    { $unwind: '$control' },
    { $sort: { submittedAt: -1 } },
  ]);
};

// Calcular estatísticas de maturidade por usuário
responseSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$maturityLevel',
        count: { $sum: 1 },
      },
    },
  ]);
};

export const Response: Model<IResponse> = mongoose.model<IResponse>('Response', responseSchema);