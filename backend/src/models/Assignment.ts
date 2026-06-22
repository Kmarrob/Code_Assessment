// backend/src/models/Assignment.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IAssignment, ResponseStatus } from '../types/index.js';

const assignmentSchema = new Schema<IAssignment>(
  {
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
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Preposto que atribuiu é obrigatório'],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ResponseStatus),
      default: ResponseStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// ÍNDICES OTIMIZADOS PARA REP
// ============================================

// Garantir que um controle não seja atribuído duas vezes ao mesmo usuário
assignmentSchema.index({ userId: 1, controlId: 1 }, { unique: true });

// Para consultas do preposto
assignmentSchema.index({ assignedBy: 1, userId: 1 });
assignmentSchema.index({ assignedBy: 1, status: 1 });
assignmentSchema.index({ userId: 1, status: 1 });

// Para consultas de progresso
assignmentSchema.index({ assignedBy: 1, assignedAt: -1 });

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Buscar atribuições de um preposto
assignmentSchema.statics.findByRep = function(repId: string) {
  return this.find({ assignedBy: repId })
    .populate('userId', 'name email')
    .populate('controlId', 'id nome')
    .sort({ assignedAt: -1 });
};

// Buscar atribuições de um usuário
assignmentSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId })
    .populate('controlId', 'id nome')
    .sort({ assignedAt: -1 });
};

// Contar atribuições por status
assignmentSchema.statics.countByStatus = function(repId: string) {
  return this.aggregate([
    { $match: { assignedBy: new mongoose.Types.ObjectId(repId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
};

// Verificar se um controle já foi atribuído a um usuário
assignmentSchema.statics.isControlAssigned = async function(
  userId: string,
  controlId: string
): Promise<boolean> {
  const assignment = await this.findOne({ userId, controlId });
  return !!assignment;
};

export const Assignment: Model<IAssignment> = mongoose.model<IAssignment>('Assignment', assignmentSchema);
