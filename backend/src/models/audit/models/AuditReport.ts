import mongoose, { Schema } from 'mongoose';
import { IAuditReport, AuditReportStatus } from '../types/audit.types';

const AuditReportSchema = new Schema<IAuditReport>(
  {
    auditPlanId: { type: String, ref: 'AuditPlan', required: true },
    summary: { type: String, required: true },
    conclusion: { type: String, required: true },
    findings: [{ type: String, ref: 'AuditFinding' }],
    recommendations: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected'],
      default: 'draft',
    },
    createdBy: { type: String, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    approvedBy: { type: String, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para ID
AuditReportSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Índices
AuditReportSchema.index({ auditPlanId: 1 });
AuditReportSchema.index({ status: 1 });

// Validação: quem criou não pode aprovar
AuditReportSchema.pre('save', function (next) {
  if (this.approvedBy && this.approvedBy === this.createdBy) {
    next(new Error('O aprovador não pode ser o mesmo que criou o relatório'));
  }
  next();
});

export const AuditReport = mongoose.model<IAuditReport>('AuditReport', AuditReportSchema);