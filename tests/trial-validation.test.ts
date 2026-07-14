import { describe, expect, it } from "vitest";
import { isPrismaForeignKeyError, trialFormMatchesSession } from "@/lib/trials/validation";

const session = {
  id: "session-1",
  learnerId: "learner-1",
  trainingProgramId: "program-1",
  endedAt: null,
  trainingProgram: {
    targetStimulusId: "dog"
  }
};

const references = {
  sessionId: "session-1",
  learnerId: "learner-1",
  trainingProgramId: "program-1",
  targetStimulusId: "dog",
  selectedStimulusId: "dog",
  presentedStimulusIds: ["dog", "cup", "bed"]
};

describe("trial validation", () => {
  it("accepts a trial form that matches the active session and presented stimuli", () => {
    expect(trialFormMatchesSession(session, references)).toBe(true);
  });

  it("rejects stale or inconsistent trial form references", () => {
    expect(trialFormMatchesSession(null, references)).toBe(false);
    expect(trialFormMatchesSession({ ...session, endedAt: new Date() }, references)).toBe(false);
    expect(trialFormMatchesSession(session, { ...references, sessionId: "missing" })).toBe(false);
    expect(trialFormMatchesSession(session, { ...references, selectedStimulusId: "not-presented" })).toBe(false);
    expect(trialFormMatchesSession(session, { ...references, targetStimulusId: "cup" })).toBe(false);
  });

  it("detects Prisma foreign key errors without depending on Prisma internals", () => {
    expect(isPrismaForeignKeyError({ code: "P2003" })).toBe(true);
    expect(isPrismaForeignKeyError({ code: "P2025" })).toBe(false);
    expect(isPrismaForeignKeyError(new Error("P2003"))).toBe(false);
  });
});
