"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/apply-schema-validation.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
async function applySchemaValidation() {
    try {
        await mongoose_1.default.connect(env_js_1.config.MONGODB_URI, {
            dbName: env_js_1.config.MONGODB_DB_NAME,
        });
        logger_js_1.logger.info('📦 Conectado ao MongoDB');
        const db = mongoose_1.default.connection.db;
        // ============================================
        // VERIFICAR SE DB EXISTE
        // ============================================
        if (!db) {
            throw new Error('Database connection not established');
        }
        // ============================================
        // CRIAR COLEÇÕES SE NÃO EXISTIREM
        // ============================================
        const collectionsToCreate = ['users', 'controls', 'assignments', 'responses'];
        const existingCollections = await db.listCollections().toArray();
        const existingNames = existingCollections.map(c => c.name);
        for (const collName of collectionsToCreate) {
            if (!existingNames.includes(collName)) {
                logger_js_1.logger.info(`📁 Criando coleção ${collName}...`);
                await db.createCollection(collName);
            }
        }
        // ============================================
        // 1. VALIDAÇÃO DA COLEÇÃO USERS
        // ============================================
        logger_js_1.logger.info('🔄 Aplicando validação na coleção users...');
        await db.command({
            collMod: 'users',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        name: {
                            bsonType: 'string',
                            minLength: 3,
                            maxLength: 100,
                        },
                        email: {
                            bsonType: 'string',
                            pattern: '^\\S+@\\S+\\.\\S+$',
                        },
                        password: {
                            bsonType: 'string',
                            minLength: 8,
                        },
                        role: {
                            enum: ['admin', 'rep', 'consultant', 'user'],
                        },
                        company: { bsonType: 'string', maxLength: 100 },
                        department: { bsonType: 'string', maxLength: 100 },
                        isActive: { bsonType: 'bool' },
                        lastLoginAt: { bsonType: 'date' },
                        refreshToken: { bsonType: 'string' },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' },
                        __v: { bsonType: 'int' }
                    },
                    additionalProperties: false,
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });
        logger_js_1.logger.info('✅ Validação da coleção users aplicada com sucesso');
        // ============================================
        // 2. VALIDAÇÃO DA COLEÇÃO CONTROLS
        // ============================================
        logger_js_1.logger.info('🔄 Aplicando validação na coleção controls...');
        await db.command({
            collMod: 'controls',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['id', 'nome', 'nota'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        id: {
                            bsonType: 'string',
                            pattern: '^[0-9]+\\.[0-9]+$',
                        },
                        nome: { bsonType: 'string', minLength: 1 },
                        tiposDeControles: {
                            bsonType: 'array',
                            items: { bsonType: 'string' },
                        },
                        nota: {
                            enum: ['Implementado', 'Parcialmente implementado', 'Não implementado', 'Não se aplica'],
                        },
                        controles: { bsonType: 'string' },
                        cenarioIdentificado: { bsonType: 'string' },
                        tipoDeControle: {
                            bsonType: 'array',
                            items: { enum: ['Preventivo', 'Detectivo', 'Corretivo'] },
                        },
                        propriedadeDeSI: {
                            bsonType: 'array',
                            items: { enum: ['Confidencialidade', 'Integridade', 'Disponibilidade'] },
                        },
                        conceitoDeSegurancaCibernetica: {
                            bsonType: 'array',
                            items: { enum: ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'] },
                        },
                        capacidadesOperacionais: {
                            bsonType: 'array',
                            items: { bsonType: 'string' },
                        },
                        dominioDeSI: {
                            bsonType: 'array',
                            items: { bsonType: 'string' },
                        },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' },
                        __v: { bsonType: 'int' }
                    },
                    additionalProperties: false,
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });
        logger_js_1.logger.info('✅ Validação da coleção controls aplicada com sucesso');
        // ============================================
        // 3. VALIDAÇÃO DA COLEÇÃO ASSIGNMENTS
        // ============================================
        logger_js_1.logger.info('🔄 Aplicando validação na coleção assignments...');
        await db.command({
            collMod: 'assignments',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['userId', 'controlId', 'assignedBy'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        userId: { bsonType: 'objectId' },
                        controlId: { bsonType: 'objectId' },
                        assignedBy: { bsonType: 'objectId' },
                        assignedAt: { bsonType: 'date' },
                        dueDate: { bsonType: 'date' },
                        status: {
                            enum: ['pending', 'in_progress', 'completed', 'rejected'],
                        },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' },
                        __v: { bsonType: 'int' }
                    },
                    additionalProperties: false,
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });
        logger_js_1.logger.info('✅ Validação da coleção assignments aplicada com sucesso');
        // ============================================
        // 4. VALIDAÇÃO DA COLEÇÃO RESPONSES
        // ============================================
        logger_js_1.logger.info('🔄 Aplicando validação na coleção responses...');
        await db.command({
            collMod: 'responses',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['assignmentId', 'userId', 'controlId', 'maturityLevel'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        assignmentId: { bsonType: 'objectId' },
                        userId: { bsonType: 'objectId' },
                        controlId: { bsonType: 'objectId' },
                        maturityLevel: {
                            enum: ['N/A', '0', '1', '2'],
                        },
                        scenarioDescription: { bsonType: 'string' },
                        evidence: { bsonType: 'string' },
                        observations: { bsonType: 'string' },
                        respondedAt: { bsonType: 'date' },
                        lastUpdatedAt: { bsonType: 'date' },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' },
                        __v: { bsonType: 'int' }
                    },
                    additionalProperties: false,
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });
        logger_js_1.logger.info('✅ Validação da coleção responses aplicada com sucesso');
        logger_js_1.logger.info('🎉 Todas as validações de schema foram aplicadas com sucesso!');
        process.exit(0);
    }
    catch (error) {
        logger_js_1.logger.error('❌ Erro ao aplicar validações:', error);
        process.exit(1);
    }
}
applySchemaValidation();
//# sourceMappingURL=apply-schema-validation.js.map