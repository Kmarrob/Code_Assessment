// backend/scripts/seed-audit-control-questions.ts
//
// Script de inserção em lote das perguntas de auditoria por
// controle (Anexo A — ISO 27001:2022).
//
// Lê um arquivo JSON e insere as perguntas na coleção
// AuditControlQuestion, pulando as que já existirem (mesmo
// controlId + text).
//
// USO:
//   cd backend
//   npx ts-node scripts/seed-audit-control-questions.ts
//
// Para rodar apontando para outro arquivo JSON:
//   npx ts-node scripts/seed-audit-control-questions.ts scripts/data/outro.json
//
// O script NÃO altera nem exclui perguntas existentes. Só adiciona.
//
// v50.2.14 — Correção: mongoose.connect agora recebe o segundo
// parâmetro { dbName } para garantir que o banco correto seja
// usado. Antes, o Mongoose caía no banco padrão ("test") quando
// a URI não especificava o banco.

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Importa o model — usa o mesmo caminho já existente
import { AuditControlQuestion } from '../src/models/audit/models/AuditControlQuestion';

interface SeedQuestion {
  controlId: string;
  controlName: string;
  controlGroup: string;
  controlDescription: string;
  text: string;
  objective: string;
  guidance: string;
  evidenceExpected: string;
  order: number;
  active: boolean;
}

async function main() {
  // ============================================================
  // 1. Resolver o caminho do JSON
  // ============================================================

  const jsonPathArg = process.argv[2];
  const jsonPath = jsonPathArg
    ? path.resolve(process.cwd(), jsonPathArg)
    : path.resolve(__dirname, 'data', 'audit-control-questions-a5.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`[ERRO] Arquivo JSON nao encontrado: ${jsonPath}`);
    process.exit(1);
  }

  console.log(`[INFO] Lendo arquivo: ${jsonPath}`);

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const questions: SeedQuestion[] = JSON.parse(raw);

  console.log(`[OK] ${questions.length} pergunta(s) encontrada(s) no JSON`);

  // ============================================================
  // 2. Conectar ao MongoDB (COM dbName explícito)
  // ============================================================

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!mongoUri) {
    console.error('[ERRO] MONGODB_URI nao definida no .env');
    process.exit(1);
  }

  if (!dbName) {
    console.error('[ERRO] MONGODB_DB_NAME nao definida no .env');
    process.exit(1);
  }

  console.log('[INFO] Conectando ao MongoDB...');
  console.log(`[INFO] DB_NAME alvo: ${dbName}`);

  // v50.2.14 — passa dbName explicitamente para garantir o banco correto
  await mongoose.connect(mongoUri, { dbName });

  const currentDb = mongoose.connection.db?.databaseName;
  console.log(`[OK] Conectado. DB atual: ${currentDb}`);

  if (currentDb !== dbName) {
    console.error(
      `[ERRO] Banco conectado (${currentDb}) diferente do esperado (${dbName}). Abortando.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  // ============================================================
  // 3. Processar cada pergunta
  // ============================================================

  const createdBy =
    process.env.SEED_CREATED_BY ||
    '6a32e842849ecccf680768da'; // ID do admin master (fallback)

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const q of questions) {
    try {
      // Verifica se ja existe (mesmo controlId + text)
      const existing = await AuditControlQuestion.findOne({
        controlId: q.controlId,
        text: q.text,
      });

      if (existing) {
        console.log(
          `[SKIP] ${q.controlId} ordem ${q.order} - ja existe`
        );
        skipped++;
        continue;
      }

      await AuditControlQuestion.create({
        controlId: q.controlId,
        controlName: q.controlName,
        controlGroup: q.controlGroup,
        controlDescription: q.controlDescription,
        text: q.text,
        objective: q.objective,
        guidance: q.guidance,
        evidenceExpected: q.evidenceExpected,
        order: q.order,
        active: q.active,
        createdBy,
      });

      console.log(
        `[OK]   ${q.controlId} ordem ${q.order} - "${q.text.substring(0, 60)}..."`
      );
      inserted++;
    } catch (err: any) {
      console.error(`[ERRO] ${q.controlId} ordem ${q.order}:`, err.message);
      errors.push(`${q.controlId} ordem ${q.order}: ${err.message}`);
    }
  }

  // ============================================================
  // 4. Relatorio final
  // ============================================================

  console.log('');
  console.log('========================================');
  console.log('RELATORIO');
  console.log('========================================');
  console.log(`Banco usado:  ${currentDb}`);
  console.log(`Inseridas:    ${inserted}`);
  console.log(`Ja existiam:  ${skipped}`);
  console.log(`Erros:        ${errors.length}`);

  if (errors.length > 0) {
    console.log('');
    console.log('Erros detalhados:');
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  // ============================================================
  // 5. Desconectar
  // ============================================================

  await mongoose.disconnect();
  console.log('');
  console.log('[OK] Desconectado');
  console.log('[OK] Concluido');

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[ERRO FATAL]', err);
  process.exit(1);
});