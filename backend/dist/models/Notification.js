"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
// backend/src/models/Notification.ts
const mongoose_1 = __importStar(require("mongoose"));
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório'],
        index: true,
    },
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Empresa é obrigatória'],
        index: true,
    },
    type: {
        type: String,
        enum: [
            'assignment',
            'response',
            'review_request',
            'review_completed',
            'user_inactivated',
            'control_revoked',
            'reminder',
            'control_updated',
        ],
        required: [true, 'Tipo de notificação é obrigatório'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Título é obrigatório'],
        maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    message: {
        type: String,
        required: [true, 'Mensagem é obrigatória'],
        maxlength: [500, 'Mensagem deve ter no máximo 500 caracteres'],
    },
    link: {
        type: String,
        required: false,
        maxlength: [500, 'Link deve ter no máximo 500 caracteres'],
    },
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
    readAt: {
        type: Date,
        required: false,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
        default: {},
    },
}, {
    timestamps: true,
});
// Índices otimizados
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, read: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ createdAt: -1 });
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
// Buscar notificações não lidas de um usuário
NotificationSchema.statics.findUnreadByUser = function (userId) {
    return this.find({ userId, read: false })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
};
// Buscar notificações de um usuário com paginação
NotificationSchema.statics.findByUser = function (userId, page = 1, limit = 20, filter = 'all') {
    const skip = (page - 1) * limit;
    const query = { userId };
    if (filter === 'unread') {
        query.read = false;
    }
    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
// Contar notificações não lidas
NotificationSchema.statics.countUnreadByUser = function (userId) {
    return this.countDocuments({ userId, read: false });
};
// Marcar todas as notificações como lidas
NotificationSchema.statics.markAllAsRead = function (userId) {
    return this.updateMany({ userId, read: false }, { $set: { read: true, readAt: new Date() } });
};
// Marcar notificação como lida
NotificationSchema.statics.markAsRead = function (notificationId, userId) {
    return this.findOneAndUpdate({ _id: notificationId, userId }, { $set: { read: true, readAt: new Date() } }, { new: true });
};
// Excluir notificações antigas (mais de 30 dias)
NotificationSchema.statics.deleteOldNotifications = function (days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.deleteMany({ createdAt: { $lt: cutoffDate }, read: true });
};
exports.Notification = mongoose_1.default.model('Notification', NotificationSchema);
//# sourceMappingURL=Notification.js.map