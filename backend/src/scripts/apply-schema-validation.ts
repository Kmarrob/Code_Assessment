// backend/src/scripts/apply-schema-validation.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

async function applySchemaValidation() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
    });

    logger.info('📦 Conectado ao MongoDB');

    const db = mongoose.connection.db;

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
        logger.info(`📁 Criando coleção ${collName}...`);
        await db.createCollection(collName);
      }
    }

    // ============================================
    // 1. VALIDAÇÃO DA COLEÇÃO USERS
    // ============================================
    logger.info('🔄 Aplicando validação na coleção users...');

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

    logger.info('✅ Validação da coleção users aplicada com sucesso');

    // ============================================
    // 2. VALIDAÇÃO DA COLEÇÃO CONTROLS
    // ============================================
    logger.info('🔄 Aplicando validação na coleção controls...');

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

    logger.info('✅ Validação da coleção controls aplicada com sucesso');

    // ============================================
    // 3. VALIDAÇÃO DA COLEÇÃO ASSIGNMENTS
    // ============================================
    logger.info('🔄 Aplicando validação na coleção assignments...');

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

    logger.info('✅ Validação da coleção assignments aplicada com sucesso');

    // ============================================
    // 4. VALIDAÇÃO DA COLEÇÃO RESPONSES
    // ============================================
    logger.info('🔄 Aplicando validação na coleção responses...');

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

    logger.info('✅ Validação da coleção responses aplicada com sucesso');

    logger.info('🎉 Todas as validações de schema foram aplicadas com sucesso!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro ao aplicar validações:', error);
    process.exit(1);
  }
}

applySchemaValidation();