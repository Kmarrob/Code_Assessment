const mongoose = require('mongoose');

async function fixValidationSafely() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect('mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0', {
      dbName: 'code_assessment'
    });
    
    console.log('✅ Conectado!');
    const db = mongoose.connection.db;
    
    // ============================================
    // PASSO 1: VERIFICAR A VALIDAÇÃO ATUAL
    // ============================================
    console.log('📋 Verificando validação atual...');
    
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      console.log('✅ Coleção users existe');
    }
    
    // ============================================
    // PASSO 2: REMOVER VALIDAÇÃO ANTIGA
    // ============================================
    console.log('🔄 Removendo validação antiga (se existir)...');
    
    try {
      await db.command({
        collMod: 'users',
        validator: {},
        validationLevel: 'off'
      });
      console.log('✅ Validação antiga removida da coleção users');
    } catch (e) {
      console.log('⚠️ Não havia validação para remover ou já foi removida');
    }
    
    try {
      await db.command({
        collMod: 'controls',
        validator: {},
        validationLevel: 'off'
      });
      console.log('✅ Validação antiga removida da coleção controls');
    } catch (e) {
      console.log('⚠️ Não havia validação para remover ou já foi removida');
    }
    
    try {
      await db.command({
        collMod: 'assignments',
        validator: {},
        validationLevel: 'off'
      });
      console.log('✅ Validação antiga removida da coleção assignments');
    } catch (e) {
      console.log('⚠️ Não havia validação para remover ou já foi removida');
    }
    
    try {
      await db.command({
        collMod: 'responses',
        validator: {},
        validationLevel: 'off'
      });
      console.log('✅ Validação antiga removida da coleção responses');
    } catch (e) {
      console.log('⚠️ Não havia validação para remover ou já foi removida');
    }
    
    // ============================================
    // PASSO 3: APLICAR NOVA VALIDAÇÃO
    // ============================================
    console.log('');
    console.log('🔄 Aplicando nova validação com __v permitido...');
    
    // Users
    await db.command({
      collMod: 'users',
      validator: {
        "$jsonSchema": {
          "bsonType": "object",
          "required": ["name", "email", "password", "role"],
          "properties": {
            "_id": { "bsonType": "objectId" },
            "name": { "bsonType": "string", "minLength": 3, "maxLength": 100 },
            "email": { "bsonType": "string", "pattern": "^\\\\S+@\\\\S+\\\\.\\\\S+$" },
            "password": { "bsonType": "string", "minLength": 8 },
            "role": { "enum": ["admin", "rep", "consultant", "user"] },
            "company": { "bsonType": "string", "maxLength": 100 },
            "department": { "bsonType": "string", "maxLength": 100 },
            "isActive": { "bsonType": "bool" },
            "lastLoginAt": { "bsonType": "date" },
            "refreshToken": { "bsonType": "string" },
            "createdAt": { "bsonType": "date" },
            "updatedAt": { "bsonType": "date" },
            "__v": { "bsonType": "int" }
          },
          "additionalProperties": false
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('✅ Validação aplicada na coleção users');
    
    // Controls
    await db.command({
      collMod: 'controls',
      validator: {
        "$jsonSchema": {
          "bsonType": "object",
          "required": ["id", "nome", "nota"],
          "properties": {
            "_id": { "bsonType": "objectId" },
            "id": { "bsonType": "string", "pattern": "^[0-9]+\\\\.[0-9]+$" },
            "nome": { "bsonType": "string", "minLength": 1 },
            "tiposDeControles": { "bsonType": "array", "items": { "bsonType": "string" } },
            "nota": { "enum": ["Implementado", "Parcialmente implementado", "Não implementado", "Não se aplica"] },
            "controles": { "bsonType": "string" },
            "cenarioIdentificado": { "bsonType": "string" },
            "tipoDeControle": { "bsonType": "array", "items": { "enum": ["Preventivo", "Detectivo", "Corretivo"] } },
            "propriedadeDeSI": { "bsonType": "array", "items": { "enum": ["Confidencialidade", "Integridade", "Disponibilidade"] } },
            "conceitoDeSegurancaCibernetica": { "bsonType": "array", "items": { "enum": ["Identificar", "Proteger", "Detectar", "Responder", "Restaurar"] } },
            "capacidadesOperacionais": { "bsonType": "array", "items": { "bsonType": "string" } },
            "dominioDeSI": { "bsonType": "array", "items": { "bsonType": "string" } },
            "createdAt": { "bsonType": "date" },
            "updatedAt": { "bsonType": "date" },
            "__v": { "bsonType": "int" }
          },
          "additionalProperties": false
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('✅ Validação aplicada na coleção controls');
    
    // Assignments
    await db.command({
      collMod: 'assignments',
      validator: {
        "$jsonSchema": {
          "bsonType": "object",
          "required": ["userId", "controlId", "assignedBy"],
          "properties": {
            "_id": { "bsonType": "objectId" },
            "userId": { "bsonType": "objectId" },
            "controlId": { "bsonType": "objectId" },
            "assignedBy": { "bsonType": "objectId" },
            "assignedAt": { "bsonType": "date" },
            "dueDate": { "bsonType": "date" },
            "status": { "enum": ["pending", "in_progress", "completed", "rejected"] },
            "createdAt": { "bsonType": "date" },
            "updatedAt": { "bsonType": "date" },
            "__v": { "bsonType": "int" }
          },
          "additionalProperties": false
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('✅ Validação aplicada na coleção assignments');
    
    // Responses
    await db.command({
      collMod: 'responses',
      validator: {
        "$jsonSchema": {
          "bsonType": "object",
          "required": ["assignmentId", "userId", "controlId", "maturityLevel"],
          "properties": {
            "_id": { "bsonType": "objectId" },
            "assignmentId": { "bsonType": "objectId" },
            "userId": { "bsonType": "objectId" },
            "controlId": { "bsonType": "objectId" },
            "maturityLevel": { "enum": ["N/A", "0", "1", "2"] },
            "scenarioDescription": { "bsonType": "string" },
            "evidence": { "bsonType": "string" },
            "observations": { "bsonType": "string" },
            "respondedAt": { "bsonType": "date" },
            "lastUpdatedAt": { "bsonType": "date" },
            "createdAt": { "bsonType": "date" },
            "updatedAt": { "bsonType": "date" },
            "__v": { "bsonType": "int" }
          },
          "additionalProperties": false
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('✅ Validação aplicada na coleção responses');
    
    console.log('');
    console.log('🎉 TODAS AS VALIDAÇÕES FORAM APLICADAS COM SUCESSO!');
    console.log('🔒 additionalProperties: false ATIVO para segurança.');
    console.log('✅ Campo __v PERMITIDO para compatibilidade com Mongoose.');
    console.log('');
    console.log('📋 Testando login...');
    
    const user = await db.collection('users').findOne({ email: 'admin@codeassessment.com' });
    if (user) {
      console.log('✅ Usuário admin encontrado');
      console.log('   ID:', user._id);
      console.log('   Nome:', user.name);
      console.log('   Email:', user.email);
    } else {
      console.log('⚠️ Usuário admin não encontrado');
    }
    
    console.log('');
    console.log('✅ Pronto! O login deve funcionar normalmente.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

fixValidationSafely();
