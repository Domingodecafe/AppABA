type TrialSessionReference = {
  id: string;
  learnerId: string;
  trainingProgramId: string;
  endedAt: Date | null;
  trainingProgram: {
    targetStimulusId: string;
  };
};

type TrialFormReferences = {
  sessionId: string;
  learnerId: string;
  trainingProgramId: string;
  targetStimulusId: string;
  selectedStimulusId: string;
  presentedStimulusIds: string[];
};

export function trialFormMatchesSession(
  session: TrialSessionReference | null,
  references: TrialFormReferences
): boolean {
  if (!session || session.endedAt) {
    return false;
  }

  return (
    session.id === references.sessionId &&
    session.learnerId === references.learnerId &&
    session.trainingProgramId === references.trainingProgramId &&
    session.trainingProgram.targetStimulusId === references.targetStimulusId &&
    references.presentedStimulusIds.includes(references.targetStimulusId) &&
    references.presentedStimulusIds.includes(references.selectedStimulusId)
  );
}

export function isPrismaForeignKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2003");
}
