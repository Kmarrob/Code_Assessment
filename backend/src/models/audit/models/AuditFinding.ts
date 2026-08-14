import mongoose, { Schema } from 'mongoose';
import { IAuditFinding, AuditFindingType, AuditFindingStatus } from '../types/audit.types';

const AuditFindingSchema = new Schema<IAuditFinding>(
  {
    auditPlanId: { type: String, ref: 'AuditPlan', required: true },
    type: {
      type: String,
      enum: ['nc_a', 'nc_b', 'comment', 'opportunity', 'positive'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    area: { type: String, required: true },
    clause: { type: String, required: true },
    evidenceIds: [{ type: String, ref: 'AuditEvidence' }],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'pending_validation', 'closed', 'reopened'],
      default: 'open',
    },
    createdBy: { type: String, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    validatedBy: { type: String, ref: 'User' },
    validatedAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para ID
AuditFindingSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Índices
AuditFindingSchema.index({ auditPlanId: 1, status: 1 });
AuditFindingSchema.index({ area: 1 });
AuditFindingSchema.index({ type: 1 });
AuditFindingSchema.index({ deletedAt: 1 });

// Soft delete
AuditFindingSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditFindingSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Validação: quem criou não pode validar
AuditFindingSchema.pre('save', function (next) {
  if (this.validatedBy && this.validatedBy === this.createdBy) {
    next(new Error('O validador não pode ser o mesmo que criou a NC'));
  }
  next();
});

export const AuditFinding = mongoose.model<IAuditFinding>('AuditFinding', AuditFindingSchema);