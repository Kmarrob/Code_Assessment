import mongoose, { Schema } from 'mongoose';
import { IAuditEvidence } from '../types/audit.types';

const AuditEvidenceSchema = new Schema<IAuditEvidence>(
  {
    auditPlanId: { type: String, ref: 'AuditPlan', required: true },
    findingId: { type: String, ref: 'AuditFinding' },
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    description: { type: String },
    uploadedBy: { type: String, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para ID
AuditEvidenceSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Índices
AuditEvidenceSchema.index({ auditPlanId: 1 });
AuditEvidenceSchema.index({ findingId: 1 });

export const AuditEvidence = mongoose.model<IAuditEvidence>('AuditEvidence', AuditEvidenceSchema);