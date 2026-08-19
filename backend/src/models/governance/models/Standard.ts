import { Schema, Model } from 'mongoose';
import { GovernanceDocument, IGovernanceDocument } from './GovernanceDocument';

/**
 * Interface do documento do tipo Norma.
 *
 * O Standard é um documento de nível 2 dentro da hierarquia
 * de Governança, herdando toda a estrutura de IGovernanceDocument.
 */
export interface IStandard extends IGovernanceDocument {
  level: 2;

  /**
   * Política à qual esta norma está vinculada.
   */
  policyId: string;

  /**
   * Indica se a norma possui caráter obrigatório.
   */
  mandatory: boolean;

  /**
   * Penalidade ou consequência prevista em caso de não conformidade.
   */
  nonCompliancePenalty?: string;

  /**
   * Área responsável pela norma.
   */
  responsibleArea?: string;
}

/**
 * Schema específico das Normas.
 *
 * Os demais campos são herdados do GovernanceDocument por meio
 * do mecanismo de discriminator do Mongoose.
 */
const StandardSchema = new Schema<IStandard>({
  policyId: {
    type: String,
    ref: 'GovernanceDocument',
    required: true,
  },

  mandatory: {
    type: Boolean,
    default: true,
  },

  nonCompliancePenalty: {
    type: String,
  },

  responsibleArea: {
    type: String,
  },
});

/**
 * Model Standard.
 *
 * GovernanceDocument utiliza discriminatorKey: '__type'.
 * Portanto, Standard deve ser criado como discriminator de
 * GovernanceDocument para preservar toda a estrutura base:
 *
 * - code
 * - title
 * - version
 * - status
 * - level
 * - category
 * - parentId
 * - content
 * - summary
 * - keywords
 * - createdBy
 * - updatedBy
 * - approvedBy
 * - approvedAt
 * - effectiveDate
 * - reviewDate
 * - responsible
 * - strategicObjective
 * - scope
 * - frameworks
 * - companyId
 * - isGlobal
 * - versionHistory
 * - attachments
 * - deletedAt
 * - timestamps
 *
 * e acrescentar os campos específicos de Standard.
 */
export const Standard: Model<IStandard> =
  (GovernanceDocument.discriminators?.Standard as Model<IStandard>) ||
  GovernanceDocument.discriminator<IStandard>(
    'Standard',
    StandardSchema
  );