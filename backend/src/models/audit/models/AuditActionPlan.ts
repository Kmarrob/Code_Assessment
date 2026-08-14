import mongoose, { Schema } from 'mongoose';
import { IAuditActionPlan, AuditActionStatus } from '../types/audit.types';

const AuditActionPlanSchema = new Schema<IAuditActionPlan>(
  {
    findingId: { type: String, ref: 'AuditFinding', required: true },
    action: { type: String, required: true },
    responsible: { type: String, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    evidenceIds: [{ type: String, ref: 'AuditEvidence' }],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
    },
    createdBy: { type: String, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    validatedBy: { type: String, ref: 'User' },
    validatedAt: { type: Date },
    validationComment: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para ID
AuditActionPlanSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Índices
AuditActionPlanSchema.index({ findingId: 1 });
AuditActionPlanSchema.index({ responsible: 1, status: 1 });

export const AuditActionPlan = mongoose.model<IAuditActionPlan>('AuditActionPlan', AuditActionPlanSchema);