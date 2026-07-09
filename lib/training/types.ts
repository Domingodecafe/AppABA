export type StimulusLike = {
  id: string;
  name: string;
  imageUrl?: string | null;
  category?: string | null;
  className?: string | null;
  functionText?: string | null;
  characteristics?: string | null;
};

export type TrainingProgramLike = {
  id: string;
  instruction: string;
  fieldSize: number;
  trialLimit?: number | null;
  targetStimulusId: string;
  distractorStimulusIds: string[];
  randomizePositions: boolean;
  avoidSamePositionTwice: boolean;
};

export type BuiltTrial = {
  instruction: string;
  targetStimulus: StimulusLike;
  alternatives: StimulusLike[];
  targetPosition: number;
};

export type SessionProgress = {
  currentTrialNumber: number;
  completedTrials: number;
  remainingTrials: number | null;
  isComplete: boolean;
};
