import mongoose from "mongoose";
import dotenv from "dotenv";
import { Plan } from "./src/models/Plan.js";
dotenv.config();

async function checkPlans() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/code_assessment";
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado ao MongoDB");

    const total = await Plan.countDocuments();
    console.log(`📊 Total de planos: ${total}`);

    const activePublic = await Plan.countDocuments({ isActive: true, isPublic: true });
    console.log(`📊 Planos ativos e públicos: ${activePublic}`);

    const plans = await Plan.find({});
    console.log("📋 Detalhes:");
    plans.forEach(p => {
      console.log(`  - ${p.displayName}: isActive=${p.isActive}, isPublic=${p.isPublic}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

checkPlans();
