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
exports.ReviewRequest = void 0;
// backend/src/models/ReviewRequest.ts
const mongoose_1 = __importStar(require("mongoose"));
const AttachmentSchema = new mongoose_1.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
});
const ReviewRequestSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
    },
    responseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Response',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    repId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    controlId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Control',
        required: true,
    },
    justification: {
        type: String,
        required: true,
        minlength: 10,
    },
    attachments: {
        type: [AttachmentSchema],
        default: [],
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true,
    },
    // 🔴 ADICIONADO: Campos para registro da revisão
    reviewNotes: {
        type: String,
        required: false,
    },
    reviewedAt: {
        type: Date,
        required: false,
    },
}, {
    timestamps: true,
});
// Índices compostos para consultas rápidas
ReviewRequestSchema.index({ companyId: 1, createdAt: -1 });
ReviewRequestSchema.index({ companyId: 1, userId: 1 });
ReviewRequestSchema.index({ companyId: 1, status: 1 });
ReviewRequestSchema.index({ responseId: 1 });
exports.ReviewRequest = mongoose_1.default.model('ReviewRequest', ReviewRequestSchema);
//# sourceMappingURL=ReviewRequest.js.map