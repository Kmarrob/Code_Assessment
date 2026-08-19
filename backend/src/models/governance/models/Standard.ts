// ANTES
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

// DEPOIS
export interface IStandard extends IGovernanceDocument {
  level: 2;
  policyId: string;
  mandatory: boolean;
  nonCompliancePenalty?: string;
  responsibleArea?: string;  // 🆕 ADICIONADO
}

const StandardSchema = new Schema<IStandard>({
  policyId: { type: String, ref: 'GovernanceDocument', required: true },
  mandatory: { type: Boolean, default: true },
  nonCompliancePenalty: { type: String },
  responsibleArea: { type: String },  // 🆕 ADICIONADO
});