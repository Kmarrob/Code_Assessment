import mongoose, { Schema } from 'mongoose';
import { GovernanceDocument, IGovernanceDocument } from './GovernanceDocument';

export interface IRecord extends IGovernanceDocument {
  level: 5;
  procedureId: string;
  recordType: 'form' | 'evidence' | 'report' | 'log';
  retentionPeriod: number;   // Dias
  retentionPolicy: string;
}

const RecordSchema = new Schema<IRecord>({
  procedureId: { type: String, ref: 'GovernanceDocument', required: true },
  recordType: { 
    type: String, 
    enum: ['form', 'evidence', 'report', 'log'], 
    required: true 
  },
  retentionPeriod: { type: Number, required: true, default: 365 },
  retentionPolicy: { type: String, required: true },
});

export const Record = GovernanceDocument.discriminator<IRecord>(
  'Record',
  RecordSchema
);