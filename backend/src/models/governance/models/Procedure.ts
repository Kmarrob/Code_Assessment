import mongoose, { Schema } from 'mongoose';
import { GovernanceDocument, IGovernanceDocument } from './GovernanceDocument';

export interface IProcedure extends IGovernanceDocument {
  level: 3;
  standardId: string;
  steps: Array<{
    order: number;
    description: string;
    responsible: string;
    expectedTime: string;
  }>;
  inputs: string[];
  outputs: string[];
}

const ProcedureSchema = new Schema<IProcedure>({
  standardId: { type: String, ref: 'GovernanceDocument', required: true },
  steps: [
    {
      order: { type: Number, required: true },
      description: { type: String, required: true },
      responsible: { type: String, required: true },
      expectedTime: { type: String, required: true },
    },
  ],
  inputs: { type: [String], default: [] },
  outputs: { type: [String], default: [] },
});

export const Procedure = GovernanceDocument.discriminator<IProcedure>(
  'Procedure',
  ProcedureSchema
);