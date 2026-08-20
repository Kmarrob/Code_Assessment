import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditQuestion extends Document {
  text: string;
  clause: string;
  category: 'clause' | 'control';
  controlId?: string;
  isActive: boolean;
  answerType: 'C_NC_NA' | 'C_NC_OB_OM_NA';
  order: number;
  section: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditQuestionSchema = new Schema<IAuditQuestion>(
  {
    text: {
      type: String,
      required: [true, 'O texto da pergunta é obrigatório'],
      trim: true,
    },
    clause: {
      type: String,
      required: [true, 'A cláusula é obrigatória'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['clause', 'control'],
      required: [true, 'A categoria é obrigatória'],
      default: 'clause',
    },
    controlId: {
      type: String,
      required: function(this: IAuditQuestion) {
        return this.category === 'control';
      },
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    answerType: {
      type: String,
      enum: ['C_NC_NA', 'C_NC_OB_OM_NA'],
      required: [true, 'O tipo de resposta é obrigatório'],
      default: 'C_NC_OB_OM_NA',
    },
    order: {
      type: Number,
      default: 0,
    },
    section: {
      type: String,
      required: [true, 'A seção é obrigatória'],
      trim: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
AuditQuestionSchema.index({ clause: 1, category: 1 });
AuditQuestionSchema.index({ section: 1, order: 1 });
AuditQuestionSchema.index({ isActive: 1, clause: 1 });

// Soft delete middleware
AuditQuestionSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditQuestionSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Virtual para controle
AuditQuestionSchema.virtual('control').get(function () {
  return this.controlId || null;
});

export const AuditQuestion = mongoose.model<IAuditQuestion>('AuditQuestion', AuditQuestionSchema);