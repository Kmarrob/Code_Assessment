// backend/scripts/diagnostico-a6.ts
//
// Script de diagnóstico: lista todas as perguntas do A.6 (6.x)
// agrupadas por controlId, com contagem.

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!mongoUri || !dbName) {
    console.error('[ERRO] MONGODB_URI ou MONGODB_DB_NAME não definidas');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName });

  const col = mongoose.connection.db!.collection('auditcontrolquestions');

  const all = await col
    .find({ controlId: { $regex: '^6\\.' } })
    .sort({ controlId: 1, order: 1 })
    .toArray();

  const grouped: Record<string, Array<{ order: number; text: string }>> = {};

  for (const q of all) {
    const ctrl = String(q.controlId || '');
    if (!ctrl) continue;

    if (!grouped[ctrl]) {
      grouped[ctrl] = [];
    }

    grouped[ctrl]!.push({
      order: Number(q.order) || 0,
      text: String(q.text || '').substring(0, 80),
    });
  }

  console.log('');
  console.log('========================================');
  console.log('DIAGNOSTICO A.6 PESSOAS');
  console.log('========================================');
  console.log('');

  const sortedControls = Object.keys(grouped).sort();

  for (const ctrl of sortedControls) {
    const list = grouped[ctrl] || [];

    console.log(`=== ${ctrl} (${list.length} perguntas) ===`);

    for (const p of list) {
      console.log(`  Ordem ${p.order}: ${p.text}`);
    }

    console.log('');
  }

  console.log('========================================');
  console.log(`TOTAL A.6: ${all.length}`);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[ERRO FATAL]', err);
  process.exit(1);
});