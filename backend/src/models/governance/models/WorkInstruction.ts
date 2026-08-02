import mongoose, { Schema } from 'mongoose';
import { GovernanceDocument, IGovernanceDocument } from './GovernanceDocument';

export interface IWorkInstruction extends IGovernanceDocument {
  level: 4;
  procedureId: string;
  detailedSteps: string;
  tools: string[];
  prerequisites: string[];
  verificationPoints: string[];
}

const WorkInstructionSchema = new Schema<IWorkInstruction>({
  procedureId: { type: String, ref: 'GovernanceDocument', required: true },
  detailedSteps: { type: String, required: true },
  tools: { type: [String], default: [] },
  prerequisites: { type: [String], default: [] },
  verificationPoints: { type: [String], default: [] },
});

export const WorkInstruction = GovernanceDocument.discriminator<IWorkInstruction>(
  'WorkInstruction',
  WorkInstructionSchema
);