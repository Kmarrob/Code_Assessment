import mongoose, { Schema } from 'mongoose';
import { GovernanceDocument, IGovernanceDocument } from './GovernanceDocument';

export interface IPolicy extends IGovernanceDocument {
  level: 1;
  scope: 'all' | 'it' | 'security' | 'privacy';
  strategicObjective: string;
  responsible: string;
}

const PolicySchema = new Schema<IPolicy>({
  scope: { 
    type: String, 
    enum: ['all', 'it', 'security', 'privacy'], 
    required: true,
    default: 'all'
  },
  strategicObjective: { type: String, required: true },
  responsible: { type: String, required: true },
});

export const Policy = GovernanceDocument.discriminator<IPolicy>(
  'Policy',
  PolicySchema
);