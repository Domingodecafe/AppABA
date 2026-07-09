import { PrismaClient } from "@prisma/client";
import { mkdirSync } from "node:fs";

const isVercel = process.env.VERCEL === "1";
const demoDatabasePath = "/tmp/appaba/dev.db";

if (isVercel) {
  mkdirSync("/tmp/appaba", { recursive: true });
  process.env.DATABASE_URL = `file:${demoDatabasePath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
  demoDatabaseReady?: Promise<void>;
};

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
});

function createPrismaClient() {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          await ensureDemoDatabaseReady();
          return query(args);
        }
      }
    }
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function ensureDemoDatabaseReady() {
  if (!isVercel) {
    return;
  }

  globalForPrisma.demoDatabaseReady ??= prepareDemoDatabase();
  await globalForPrisma.demoDatabaseReady;
}

async function prepareDemoDatabase() {
  const tables = await basePrisma.$queryRawUnsafe<Array<{ name: string }>>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Learner'"
  );

  if (tables.length === 0) {
    await runSqlStatements([
      `CREATE TABLE "Learner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "birthDate" DATETIME,
        "supportLevel" TEXT NOT NULL,
        "notes" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )`,
      `CREATE TABLE "Stimulus" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT,
        "className" TEXT,
        "functionText" TEXT,
        "characteristics" TEXT,
        "imageUrl" TEXT,
        "notes" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )`,
      `CREATE TABLE "StimulusRelation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "type" TEXT NOT NULL,
        "sourceStimulusId" TEXT NOT NULL,
        "targetStimulusId" TEXT NOT NULL,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StimulusRelation_sourceStimulusId_fkey" FOREIGN KEY ("sourceStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "StimulusRelation_targetStimulusId_fkey" FOREIGN KEY ("targetStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      `CREATE TABLE "TrainingProgram" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "learnerId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "relationType" TEXT NOT NULL,
        "instruction" TEXT NOT NULL,
        "fieldSize" INTEGER NOT NULL,
        "trialLimit" INTEGER,
        "targetStimulusId" TEXT NOT NULL,
        "distractorStimulusIds" JSONB NOT NULL,
        "responseMode" TEXT NOT NULL DEFAULT 'tocar',
        "randomizePositions" BOOLEAN NOT NULL DEFAULT true,
        "avoidSamePositionTwice" BOOLEAN NOT NULL DEFAULT true,
        "masteryCriterion" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "TrainingProgram_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "TrainingProgram_targetStimulusId_fkey" FOREIGN KEY ("targetStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      `CREATE TABLE "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "learnerId" TEXT NOT NULL,
        "trainingProgramId" TEXT NOT NULL,
        "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endedAt" DATETIME,
        "notes" TEXT,
        CONSTRAINT "Session_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Session_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "TrainingProgram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      `CREATE TABLE "TrialResult" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "learnerId" TEXT NOT NULL,
        "trainingProgramId" TEXT NOT NULL,
        "targetStimulusId" TEXT NOT NULL,
        "selectedStimulusId" TEXT NOT NULL,
        "presentedStimulusIds" JSONB NOT NULL,
        "correct" BOOLEAN NOT NULL,
        "promptLevel" TEXT NOT NULL,
        "latencyMs" INTEGER NOT NULL,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TrialResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "TrialResult_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "TrainingProgram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "TrialResult_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "TrialResult_targetStimulusId_fkey" FOREIGN KEY ("targetStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "TrialResult_selectedStimulusId_fkey" FOREIGN KEY ("selectedStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`
    ]);
  }

  const learnerCount = await basePrisma.learner.count();

  if (learnerCount === 0) {
    await seedDemoData();
  }
}

async function runSqlStatements(statements: string[]) {
  for (const statement of statements) {
    await basePrisma.$executeRawUnsafe(statement);
  }
}

async function seedDemoData() {
  const learner = await basePrisma.learner.create({
    data: {
      name: "Crianca exemplo",
      supportLevel: "Nivel 3 de suporte",
      notes: "Perfil ficticio para demonstracao online. Nao usar dados reais neste demo.",
      active: true
    }
  });

  const dog = await basePrisma.stimulus.create({
    data: {
      name: "cachorro",
      category: "animal",
      className: "animal",
      functionText: "n/a",
      characteristics: "tem pelo, late",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
      notes: "Seed ficticio",
      active: true
    }
  });

  const toothbrush = await basePrisma.stimulus.create({
    data: {
      name: "escova de dentes",
      category: "higiene",
      className: "objeto",
      functionText: "escovar dentes",
      characteristics: "tem cerdas",
      imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600",
      active: true
    }
  });

  const cup = await basePrisma.stimulus.create({
    data: {
      name: "copo",
      category: "utensilio",
      className: "objeto",
      functionText: "beber",
      characteristics: "recipiente",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
      active: true
    }
  });

  const bed = await basePrisma.stimulus.create({
    data: {
      name: "cama",
      category: "casa",
      className: "movel",
      functionText: "dormir",
      characteristics: "macia",
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
      active: true
    }
  });

  const apple = await basePrisma.stimulus.create({
    data: {
      name: "maca",
      category: "alimento",
      className: "fruta",
      functionText: "comer",
      characteristics: "vermelha",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600",
      active: true
    }
  });

  await basePrisma.stimulusRelation.createMany({
    data: [
      { type: "nome_para_imagem", sourceStimulusId: dog.id, targetStimulusId: dog.id },
      { type: "funcao_para_item", sourceStimulusId: cup.id, targetStimulusId: cup.id },
      { type: "igual_a", sourceStimulusId: apple.id, targetStimulusId: apple.id }
    ]
  });

  await basePrisma.trainingProgram.createMany({
    data: [
      {
        learnerId: learner.id,
        name: "Ouvinte: cachorro",
        type: "Ouvinte",
        relationType: "nome_para_imagem",
        instruction: "Toque no cachorro",
        fieldSize: 4,
        trialLimit: 12,
        targetStimulusId: dog.id,
        distractorStimulusIds: [toothbrush.id, cup.id, bed.id, apple.id],
        responseMode: "tocar",
        randomizePositions: true,
        avoidSamePositionTwice: true,
        masteryCriterion: "80% de acerto independente em duas sessoes consecutivas",
        active: true
      },
      {
        learnerId: learner.id,
        name: "LRFFC: beber",
        type: "LRFFC",
        relationType: "funcao_para_item",
        instruction: "Qual usamos para beber?",
        fieldSize: 3,
        trialLimit: 12,
        targetStimulusId: cup.id,
        distractorStimulusIds: [dog.id, bed.id, apple.id],
        responseMode: "tocar",
        randomizePositions: true,
        avoidSamePositionTwice: true,
        masteryCriterion: "Responder independente em 8 de 10 tentativas",
        active: true
      },
      {
        learnerId: learner.id,
        name: "Pareamento: maca",
        type: "Pareamento",
        relationType: "igual_a",
        instruction: "Ache o igual",
        fieldSize: 2,
        trialLimit: 12,
        targetStimulusId: apple.id,
        distractorStimulusIds: [cup.id, toothbrush.id],
        responseMode: "tocar",
        randomizePositions: true,
        avoidSamePositionTwice: true,
        masteryCriterion: "Parear sem prompt em 90% das tentativas",
        active: true
      }
    ]
  });
}
