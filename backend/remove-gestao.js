const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Carrega o .env da pasta atual
dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'code_assessment';

async function main() {
    if (!MONGODB_URI) {
        console.error('❌ ERRO: MONGODB_URI não encontrada no arquivo .env!');
        process.exit(1);
    }

    console.log('🔍 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('✅ Conectado com sucesso!');
    
    const Control = mongoose.model('Control', new mongoose.Schema({}, { strict: false }), 'controls');
    
    // 1. Contar
    const countBefore = await Control.countDocuments({
        capacidadesOperacionais: { $in: ['Gestão de terceiros'] }
    });
    console.log(`📊 Controles encontrados com "Gestão de terceiros": ${countBefore}`);
    
    if (countBefore === 0) {
        console.log('✅ Nenhum documento precisa de alteração.');
        await mongoose.disconnect();
        return;
    }
    
    // 2. Listar
    const affected = await Control.find({
        capacidadesOperacionais: { $in: ['Gestão de terceiros'] }
    }).lean();
    
    console.log('📋 Documentos identificados:');
    affected.forEach(c => {
        const identificador = c.nome || c.descricao || c.control || 'Nome não definido';
        console.log(`   - ID: ${c._id} | Referência: ${identificador}`);
    });
    
    // 3. Remover
    console.log('⚙️ Removendo o termo "Gestão de terceiros" dos arrays...');
    const result = await Control.updateMany(
        { capacidadesOperacionais: { $in: ['Gestão de terceiros'] } },
        { $pull: { capacidadesOperacionais: 'Gestão de terceiros' } }
    );
    
    console.log(`✅ Total de documentos modificados no Atlas: ${result.modifiedCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Conexão encerrada com segurança.');
}

main().catch(err => {
    console.error('❌ Erro crítico:', err);
    process.exit(1);
});