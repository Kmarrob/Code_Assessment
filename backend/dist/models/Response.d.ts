import { Model } from 'mongoose';
import { IResponse } from '../types/index.js';
interface ResponseModel extends Model<IResponse> {
    findByUser(userId: string): Promise<any[]>;
    findByRep(repId: string): Promise<any[]>;
    getUserStats(userId: string): Promise<any[]>;
    getInProgressActivities(userId: string): Promise<any[]>;
    hasPendingActivities(userId: string): Promise<boolean>;
    getProgressByAssignment(assignmentId: string): Promise<any>;
}
export declare const Response: ResponseModel;
export {};
//# sourceMappingURL=Response.d.ts.map