import { IGovernanceDocument } from '../models/GovernanceDocument';
import { CreateGovernanceDocumentDTO, UpdateGovernanceDocumentDTO, GovernanceFilters } from '../types/governance.types';
export declare class GovernanceService {
    create(data: CreateGovernanceDocumentDTO, userId: string, companyId: string, userRole?: string): Promise<IGovernanceDocument>;
    findById(id: string, companyId: string): Promise<IGovernanceDocument | null>;
    findAll(companyId: string, filters?: GovernanceFilters): Promise<IGovernanceDocument[]>;
    update(id: string, data: UpdateGovernanceDocumentDTO, userId: string, companyId: string, userRole?: string): Promise<IGovernanceDocument | null>;
    delete(id: string, companyId: string, userRole?: string): Promise<boolean>;
    approve(id: string, userId: string, companyId: string, userRole?: string): Promise<IGovernanceDocument | null>;
    getByLevel(companyId: string, level: 1 | 2 | 3 | 4 | 5): Promise<IGovernanceDocument[]>;
    getByCategory(companyId: string, category: string): Promise<IGovernanceDocument[]>;
    getTree(companyId: string): Promise<any>;
    searchByKeyword(companyId: string, keyword: string): Promise<IGovernanceDocument[]>;
}
//# sourceMappingURL=GovernanceService.d.ts.map