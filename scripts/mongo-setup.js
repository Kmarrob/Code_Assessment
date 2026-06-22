// scripts/mongo-setup.js
// Script para configurar o MongoDB Atlas - Idempotente

const dbName = 'code_assessment';

function collectionExists(collectionName) {
    const collections = db.getCollectionInfos();
    return collections.some(c => c.name === collectionName);
}

function createCollectionIfNotExists(collectionName) {
    if (!collectionExists(collectionName)) {
        db.createCollection(collectionName);
        print(✅ Coleção criada: );
        return true;
    } else {
        print(⚠️ Coleção já existe: );
        return false;
    }
}

db = db.getSiblingDB(dbName);

print(📦 Conectado ao banco: code_assessment);

print('');
print('📋 Criando coleções...');

const collections = ['users', 'controls', 'assignments', 'responses'];

let newCollections = 0;
collections.forEach(name => {
    if (createCollectionIfNotExists(name)) {
        newCollections++;
    }
});

if (newCollections === 0) {
    print('⚠️ Nenhuma nova coleção criada (todas já existem)');
} else {
    print(✅  novas coleções criadas);
}

print('');
print('📋 Criando índices...');

print('  📌 Índices para users:');
db.users.createIndex({ email: 1 }, { unique: true });
print('    ✅ email (único)');
db.users.createIndex({ role: 1, isActive: 1, createdAt: -1 });
print('    ✅ role + isActive + createdAt');
db.users.createIndex({ name: 'text', email: 'text' });
print('    ✅ name + email (text)');
db.users.createIndex({ lastLoginAt: -1 });
print('    ✅ lastLoginAt');

print('  📌 Índices para controls:');
db.controls.createIndex({ id: 1 }, { unique: true });
print('    ✅ id (único)');
db.controls.createIndex({ nome: 1 });
print('    ✅ nome');
db.controls.createIndex({ nota: 1 });
print('    ✅ nota');

print('  📌 Índices para assignments:');
db.assignments.createIndex({ userId: 1, controlId: 1 }, { unique: true });
print('    ✅ userId + controlId (único)');
db.assignments.createIndex({ assignedBy: 1 });
print('    ✅ assignedBy');
db.assignments.createIndex({ status: 1 });
print('    ✅ status');

print('  📌 Índices para responses:');
db.responses.createIndex({ assignmentId: 1 }, { unique: true });
print('    ✅ assignmentId (único)');
db.responses.createIndex({ userId: 1 });
print('    ✅ userId');
db.responses.createIndex({ controlId: 1 });
print('    ✅ controlId');
db.responses.createIndex({ maturityLevel: 1 });
print('    ✅ maturityLevel');

print('');
print('✅ Todos os índices criados/verificados com sucesso!');

print('');
print('📋 Aplicando schema validation...');

db.runCommand({
    collMod: 'users',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
                name: { bsonType: 'string', minLength: 3, maxLength: 100 },
                email: { bsonType: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
                password: { bsonType: 'string', minLength: 8 },
                role: { enum: ['admin', 'rep', 'consultant', 'user'] },
                isActive: { bsonType: 'bool' },
                company: { bsonType: 'string', maxLength: 100 },
                department: { bsonType: 'string', maxLength: 100 },
                __v: { bsonType: 'int' }
            },
            additionalProperties: false
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});
print('  ✅ Schema validation aplicado para users');

db.runCommand({
    collMod: 'controls',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['id', 'nome', 'nota'],
            properties: {
                id: { bsonType: 'string', pattern: '^[0-9]+\\.[0-9]+$' },
                nome: { bsonType: 'string', minLength: 1 },
                nota: { enum: ['Implementado', 'Parcialmente implementado', 'Não implementado', 'Não se aplica'] },
                __v: { bsonType: 'int' }
            },
            additionalProperties: false
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});
print('  ✅ Schema validation aplicado para controls');

print('✅ Schema validation aplicado com sucesso!');

print('');
print('🎉 Automação do MongoDB Atlas concluída com sucesso!');
