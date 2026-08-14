import mongoose, { Schema } from 'mongoose';
import { IAuditPlan, AuditStatus } from '../types/audit.types';

const AuditPlanSchema = new Schema<IAuditPlan>(
  {
    companyId: { type: String, ref: 'Company', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    scope: {
      controls: [{ type: String }],
      processes: [{ type: String }],
      areas: [{ type: String }],
    },
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    team: {
      leadAuditor: { type: String, ref: 'User', required: true },
      auditors: [{ type: String, ref: 'User' }],
      observers: [{ type: String, ref: 'User' }],
    },
    criteria: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
    },
    createdBy: { type: String, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    approvedBy: { type: String, ref: 'User' },
    approvedAt: { type: Date },
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
AuditPlanSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Índices para consultas eficientes
AuditPlanSchema.index({ companyId: 1, status: 1 });
AuditPlanSchema.index({ 'team.leadAuditor': 1 });
AuditPlanSchema.index({ 'team.auditors': 1 });
AuditPlanSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
AuditPlanSchema.index({ deletedAt: 1 });

// Middleware para soft delete
AuditPlanSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditPlanSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Validação: quem criou não pode ser o mesmo que aprovou
AuditPlanSchema.pre('save', function (next) {
  if (this.approvedBy && this.approvedBy === this.createdBy) {
    next(new Error('O aprovador não pode ser o mesmo que criou o plano'));
  }
  next();
});

// Validação: leadAuditor não pode ser o mesmo que createdBy
AuditPlanSchema.pre('save', function (next) {
  if (this.team.leadAuditor === this.createdBy) {
    next(new Error('O auditor líder não pode ser o mesmo que criou o plano'));
  }
  next();
});

export const AuditPlan = mongoose.model<IAuditPlan>('AuditPlan', AuditPlanSchema);