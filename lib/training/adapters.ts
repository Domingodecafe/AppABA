import type { Prisma } from "@prisma/client";
import type { TrainingProgramLike } from "./types";

type ProgramWithJson = {
  id: string;
  instruction: string;
  fieldSize: number;
  trialLimit?: number | null;
  targetStimulusId: string;
  distractorStimulusIds: Prisma.JsonValue;
  randomizePositions: boolean;
  avoidSamePositionTwice: boolean;
};

export function toTrainingProgramLike(program: ProgramWithJson): TrainingProgramLike {
  return {
    id: program.id,
    instruction: program.instruction,
    fieldSize: program.fieldSize,
    trialLimit: program.trialLimit ?? null,
    targetStimulusId: program.targetStimulusId,
    distractorStimulusIds: jsonStringArray(program.distractorStimulusIds),
    randomizePositions: program.randomizePositions,
    avoidSamePositionTwice: program.avoidSamePositionTwice
  };
}

export function jsonStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
