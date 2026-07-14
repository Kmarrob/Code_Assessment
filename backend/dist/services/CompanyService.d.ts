import mongoose from 'mongoose';
import { ICompany } from '../models/Company.js';
export interface CreateCompanyData {
    name: string;
    cnpj?: string;
    plan?: 'basic' | 'pro' | 'enterprise';
    maxUsers?: number;
    maxControls?: number;
    createdBy?: string;
}
export declare class CompanyService {
    /**
     * Listar todas as empresas (Admin)
     */
    static listCompanies(filters?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        companies: {
            userCount: any;
            assignedControlsCount: number;
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
            branding?: mongoose.FlattenMaps<{
                logo: {
                    url: string;
                    filename: string;
                    size: number;
                    mimeType: string;
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    uploadedAt: Date | null;
                    uploadedBy: mongoose.Types.ObjectId | null;
                };
                favicon: {
                    url: string;
                    filename: string;
                    size: number;
                    mimeType: string;
                    uploadedAt: Date | null;
                    uploadedBy: mongoose.Types.ObjectId | null;
                };
                colors: {
                    primary: string;
                    secondary: string;
                    accent: string;
                    background: string;
                    text: string;
                    extractedFrom: Date | null;
                };
                settings: {
                    showLogoInHeader: boolean;
                    showLogoInReport: boolean;
                    useCustomColors: boolean;
                };
                createdAt: Date;
                updatedAt: Date;
            }> | undefined;
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
     * Buscar empresa por ID
     */
    static getCompanyById(companyId: string): Promise<{
        users: (mongoose.FlattenMaps<import("../models/User.js").IUserDocument> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        userCount: number;
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
        branding?: mongoose.FlattenMaps<{
            logo: {
                url: string;
                filename: string;
                size: number;
                mimeType: string;
                dimensions: {
                    width: number;
                    height: number;
                };
                uploadedAt: Date | null;
                uploadedBy: mongoose.Types.ObjectId | null;
            };
            favicon: {
                url: string;
                filename: string;
                size: number;
                mimeType: string;
                uploadedAt: Date | null;
                uploadedBy: mongoose.Types.ObjectId | null;
            };
            colors: {
                primary: string;
                secondary: string;
                accent: string;
                background: string;
                text: string;
                extractedFrom: Date | null;
            };
            settings: {
                showLogoInHeader: boolean;
                showLogoInReport: boolean;
                useCustomColors: boolean;
            };
            createdAt: Date;
            updatedAt: Date;
        }> | undefined;
        __v: number;
    }>;
    /**
     * Criar empresa
     */
    static createCompany(data: CreateCompanyData): Promise<mongoose.Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Atualizar empresa
     */
    static updateCompany(companyId: string, data: {
        name?: string;
        cnpj?: string;
        plan?: 'basic' | 'pro' | 'enterprise';
        maxUsers?: number;
        maxControls?: number;
        status?: 'active' | 'inactive' | 'suspended';
        consultantId?: string | null;
    }): Promise<(mongoose.Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Desativar empresa
     */
    static deactivateCompany(companyId: string): Promise<mongoose.Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Reativar empresa
     */
    static reactivateCompany(companyId: string): Promise<mongoose.Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static assignAllControls(companyId: string): Promise<{
        company: ICompany;
        assigned: number;
        total: number;
    }>;
    /**
     * Obter estatísticas das empresas
     */
    static getStats(): Promise<{
        totalCompanies: number;
        totalUsers: number;
        activeCompanies: number;
        inactiveCompanies: number;
        usersPerCompany: any[];
        topCompanies: any[];
    }>;
}
//# sourceMappingURL=CompanyService.d.ts.map