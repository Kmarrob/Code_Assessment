import mongoose, { Types } from 'mongoose';
import { UserRole } from '../types/index.js';
export declare class ConsultantService {
    /**
     * Listar empresas de um consultor
     */
    static listCompanies(consultantId: string, filters?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        companies: {
            userCount: any;
            assignedControlsCount: number;
            totalAssignments: any;
            totalResponses: any;
            completionRate: number;
            _id: mongoose.Types.ObjectId;
            name: string;
            cnpj?: string | undefined;
            plan: "basic" | "pro" | "enterprise";
            status: "active" | "inactive" | "suspended";
            maxUsers: number;
            maxControls: number;
            assignedControls: mongoose.Types.ObjectId[];
            consultantId?: mongoose.Types.ObjectId | undefined;
            createdBy?: mongoose.Types.ObjectId | undefined;
            createdAt: Date;
            updatedAt: Date;
            __v: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    }>;
    /**
     * Obter estatísticas do consultor
     */
    static getStats(consultantId: string): Promise<{
        totalCompanies: number;
        totalUsers: number;
        totalAssignments: number;
        totalResponses: number;
        completionRate: number;
        maturityDistribution: Record<string, number>;
    }>;
    /**
     * Obter detalhes de uma empresa para o consultor
     */
    static getCompanyDetails(consultantId: string, companyId: string): Promise<{
        company: mongoose.FlattenMaps<{
            _id: mongoose.Types.ObjectId;
            name: string;
            cnpj?: string | undefined;
            plan: "basic" | "pro" | "enterprise";
            status: "active" | "inactive" | "suspended";
            maxUsers: number;
            maxControls: number;
            assignedControls: mongoose.Types.ObjectId[];
            consultantId?: mongoose.Types.ObjectId | undefined;
            createdBy?: mongoose.Types.ObjectId | undefined;
            createdAt: Date;
            updatedAt: Date;
        }> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        users: {
            userId: Types.ObjectId;
            userName: string;
            userEmail: string;
            userRole: UserRole;
            total: number;
            completed: number;
            percentage: number;
        }[];
        totalUsers: number;
        totalAssignments: number;
        totalResponses: number;
        maturityDistribution: Record<string, number>;
    }>;
}
//# sourceMappingURL=ConsultantService.d.ts.map