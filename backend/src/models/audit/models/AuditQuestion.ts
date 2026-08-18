import mongoose, { Schema } from 'mongoose';

export interface IAuditQuestion {
  _id: string;
  controlId: string;
  question: string;
  category: 'organizational' | 'people' | 'physical' | 'technological';
  createdAt: Date;
  updatedAt: Date;
}

const AuditQuestionSchema = new Schema<IAuditQuestion>(
  {
    controlId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    category: {
      type: String,
      enum: ['organizational', 'people', 'physical', 'technological'],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AuditQuestionSchema.virtual('id').get(function () {
  return this._id.toString();
});

export const AuditQuestion = mongoose.model<IAuditQuestion>('AuditQuestion', AuditQuestionSchema);