-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrialResult" (
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
);
INSERT INTO "new_TrialResult" ("correct", "createdAt", "id", "latencyMs", "learnerId", "notes", "presentedStimulusIds", "promptLevel", "selectedStimulusId", "sessionId", "targetStimulusId", "trainingProgramId") SELECT "correct", "createdAt", "id", "latencyMs", "learnerId", "notes", "presentedStimulusIds", "promptLevel", "selectedStimulusId", "sessionId", "targetStimulusId", "trainingProgramId" FROM "TrialResult";
DROP TABLE "TrialResult";
ALTER TABLE "new_TrialResult" RENAME TO "TrialResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
