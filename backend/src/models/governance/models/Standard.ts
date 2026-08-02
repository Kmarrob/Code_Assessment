import mongoose, { Schema } from 'mongoose';
import { GovernanceDocument, IGovernanceDocument } from './GovernanceDocument';

export interface IStandard extends IGovernanceDocument {
  level: 2;
  policyId: string;
  mandatory: boolean;
  nonCompliancePenalty?: string;
}

const StandardSchema = new Schema<IStandard>({
  policyId: { type: String, ref: 'GovernanceDocument', required: true },
  mandatory: { type: Boolean, default: true },
  nonCompliancePenalty: { type: String },
});

export const Standard = GovernanceDocument.discriminator<IStandard>(
  'Standard',
  StandardSchema
);