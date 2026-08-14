import mongoose, { Schema } from 'mongoose';
import { IAuditChecklist, IAuditChecklistItem, AuditChecklistStatus } from '../types/audit.types';

const AuditChecklistItemSchema = new Schema<IAuditChecklistItem>({
  question: { type: String, required: true },
  answer: {
    type: String,
    enum: ['conforme', 'nao_conforme', 'nao_aplicavel'],
    default: 'conforme',
  },
  observations: { type: String },
  evidenceIds: [{ type: String, ref: 'AuditEvidence' }],
});

const AuditChecklistSchema = new Schema<IAuditChecklist>(
  {
    auditPlanId: { type: String, ref: 'AuditPlan', required: true },
    controlId: { type: String, required: true },
    questions: [AuditChecklistItemSchema],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    completedBy: { type: String, ref: 'User' },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para ID
AuditChecklistSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Índices
AuditChecklistSchema.index({ auditPlanId: 1 });
AuditChecklistSchema.index({ controlId: 1 });

export const AuditChecklist = mongoose.model<IAuditChecklist>('AuditChecklist', AuditChecklistSchema);