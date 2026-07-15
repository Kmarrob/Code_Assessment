import { Model } from 'mongoose';
import { IPlan } from '../types/plan.types.js';
/**
 * Interface do Model
 */
export interface PlanModel extends Model<IPlan> {
    getDefaultPlans(): Promise<IPlan[]>;
    getPlanByName(name: string): Promise<IPlan | null>;
    getPublicPlans(): Promise<IPlan[]>;
}
export declare const Plan: PlanModel;
//# sourceMappingURL=Plan.d.ts.map