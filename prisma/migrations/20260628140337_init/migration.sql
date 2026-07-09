-- CreateTable
CREATE TABLE "Learner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME,
    "supportLevel" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Stimulus" (
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
);

-- CreateTable
CREATE TABLE "StimulusRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "sourceStimulusId" TEXT NOT NULL,
    "targetStimulusId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StimulusRelation_sourceStimulusId_fkey" FOREIGN KEY ("sourceStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StimulusRelation_targetStimulusId_fkey" FOREIGN KEY ("targetStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "fieldSize" INTEGER NOT NULL,
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
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnerId" TEXT NOT NULL,
    "trainingProgramId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "Session_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "TrainingProgram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrialResult" (
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
    CONSTRAINT "TrialResult_targetStimulusId_fkey" FOREIGN KEY ("targetStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrialResult_selectedStimulusId_fkey" FOREIGN KEY ("selectedStimulusId") REFERENCES "Stimulus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
