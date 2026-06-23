import { UserRole, IUser } from '../types/index.js';
export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    company?: string;
    companyId?: string;
    department?: string;
}
export interface UpdateUserData {
    name?: string;
    email?: string;
    role?: UserRole;
    company?: string;
    companyId?: string;
    department?: string;
    isActive?: boolean;
}
export interface UserFilters {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    company?: string;
    companyId?: string;
    department?: string;
}
export declare class AdminService {
    static listUsers(filters?: UserFilters, page?: number, limit?: number): Promise<{
        users: IUser[];
        total: number;
        totalPages: number;
    }>;
    static getUserById(userId: string): Promise<IUser>;
    static createUser(data: CreateUserData): Promise<IUser>;
    static updateUser(userId: string, data: UpdateUserData): Promise<IUser>;
    static deleteUser(userId: string): Promise<void>;
    static reactivateUser(userId: string): Promise<IUser>;
    static resetPassword(userId: string, newPassword: string): Promise<void>;
    static getDashboardStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisMonth: number;
    }>;
}
//# sourceMappingURL=AdminService.d.ts.map