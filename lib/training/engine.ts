import type { BuiltTrial, SessionProgress, StimulusLike, TrainingProgramLike } from "./types";

export function buildTrial(
  program: TrainingProgramLike,
  stimuli: StimulusLike[],
  previousTargetPosition?: number
): BuiltTrial {
  const targetStimulus = stimuli.find((stimulus) => stimulus.id === program.targetStimulusId);

  if (!targetStimulus) {
    throw new Error("Estímulo alvo não encontrado");
  }

  const requestedDistractors = program.distractorStimulusIds
    .map((id) => stimuli.find((stimulus) => stimulus.id === id))
    .filter((stimulus): stimulus is StimulusLike => Boolean(stimulus))
    .filter((stimulus) => stimulus.id !== targetStimulus.id);

  const fallbackDistractors = stimuli.filter(
    (stimulus) =>
      stimulus.id !== targetStimulus.id &&
      !requestedDistractors.some((distractor) => distractor.id === stimulus.id)
  );

  const fieldSize = normalizeFieldSize(program.fieldSize);
  const alternatives = [targetStimulus, ...requestedDistractors, ...fallbackDistractors].slice(0, fieldSize);

  if (alternatives.length < 2) {
    throw new Error("O treino precisa de pelo menos duas alternativas");
  }

  const arranged = shuffleWithTargetRule(
    alternatives,
    targetStimulus.id,
    program.avoidSamePositionTwice,
    previousTargetPosition
  );

  return {
    instruction: program.instruction,
    targetStimulus,
    alternatives: arranged,
    targetPosition: arranged.findIndex((stimulus) => stimulus.id === targetStimulus.id)
  };
}

export function gradeSelection(selectedStimulusId: string, targetStimulusId: string): boolean {
  return selectedStimulusId === targetStimulusId;
}

export function getSessionProgress(completedTrials: number, trialLimit?: number | null): SessionProgress {
  const normalizedCompleted = Math.max(0, completedTrials);

  if (!trialLimit || trialLimit < 1) {
    return {
      currentTrialNumber: normalizedCompleted + 1,
      completedTrials: normalizedCompleted,
      remainingTrials: null,
      isComplete: false
    };
  }

  const cappedCompleted = Math.min(normalizedCompleted, trialLimit);
  const remainingTrials = Math.max(0, trialLimit - cappedCompleted);

  return {
    currentTrialNumber: Math.min(cappedCompleted + 1, trialLimit),
    completedTrials: cappedCompleted,
    remainingTrials,
    isComplete: remainingTrials === 0
  };
}

function normalizeFieldSize(fieldSize: number): number {
  if ([2, 3, 4, 6].includes(fieldSize)) {
    return fieldSize;
  }

  return 4;
}

function shuffleWithTargetRule(
  alternatives: StimulusLike[],
  targetStimulusId: string,
  avoidSamePositionTwice: boolean,
  previousTargetPosition?: number
): StimulusLike[] {
  const shuffled = fisherYates(alternatives);
  const targetPosition = shuffled.findIndex((stimulus) => stimulus.id === targetStimulusId);

  if (
    !avoidSamePositionTwice ||
    previousTargetPosition === undefined ||
    previousTargetPosition < 0 ||
    shuffled.length < 2 ||
    targetPosition !== previousTargetPosition
  ) {
    return shuffled;
  }

  const swapIndex = targetPosition === 0 ? 1 : 0;
  const next = [...shuffled];
  [next[targetPosition], next[swapIndex]] = [next[swapIndex], next[targetPosition]];
  return next;
}

function fisherYates<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}
