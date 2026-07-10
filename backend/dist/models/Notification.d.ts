import mongoose, { Model, Document } from 'mongoose';
export type NotificationType = 'assignment' | 'response' | 'review_request' | 'review_completed' | 'user_inactivated' | 'control_revoked' | 'reminder' | 'control_updated';
export interface INotificationMetadata {
    assignmentId?: string;
    responseId?: string;
    reviewId?: string;
    controlId?: string;
    userId?: string;
    userName?: string;
    controlName?: string;
    controlIdString?: string;
    status?: string;
    reason?: string;
    pendingCount?: number;
}
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    readAt?: Date;
    metadata?: INotificationMetadata;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: Model<INotification>;
//# sourceMappingURL=Notification.d.ts.map