import mongoose from "mongoose";
import dotenv from "dotenv";
import { Plan } from "./src/models/Plan.js";
dotenv.config();

async function testPlans() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/code_assessment";
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado ao MongoDB");

    const count = await Plan.countDocuments();
    console.log("📊 Total de planos no banco:", count);

    const plans = await Plan.find({});
    console.log("📋 Planos:", plans.map((p) => ({ name: p.name, displayName: p.displayName, isPublic: p.isPublic })));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testPlans();
