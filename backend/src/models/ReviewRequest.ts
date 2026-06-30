// backend/src/models/ReviewRequest.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IReviewRequest extends Document {
  companyId: mongoose.Types.ObjectId;
  responseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  repId: mongoose.Types.ObjectId;
  controlId: mongoose.Types.ObjectId;
  justification: string;
  attachments: IAttachment[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const ReviewRequestSchema = new Schema<IReviewRequest>(
  {
    companyId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Company', 
      required: true,
      index: true,
    },
    responseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Response', 
      required: true,
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true,
    },
    repId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    controlId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Control', 
      required: true,
    },
    justification: { 
      type: String, 
      required: true,
      minlength: 10,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices compostos para consultas rápidas
ReviewRequestSchema.index({ companyId: 1, createdAt: -1 });
ReviewRequestSchema.index({ companyId: 1, userId: 1 });
ReviewRequestSchema.index({ companyId: 1, status: 1 });
ReviewRequestSchema.index({ responseId: 1 });

export const ReviewRequest = mongoose.model<IReviewRequest>('ReviewRequest', ReviewRequestSchema);