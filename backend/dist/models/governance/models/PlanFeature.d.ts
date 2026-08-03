import mongoose, { Document } from 'mongoose';
export interface IPlanFeature extends Document {
    planName: 'basic' | 'pro' | 'enterprise' | 'trial';
    governance: boolean;
    customFeatures?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PlanFeature: mongoose.Model<IPlanFeature, {}, {}, {}, mongoose.Document<unknown, {}, IPlanFeature, {}, {}> & IPlanFeature & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PlanFeature.d.ts.map