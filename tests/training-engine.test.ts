import { describe, expect, it } from "vitest";
import { buildTrial, getSessionProgress, gradeSelection } from "@/lib/training/engine";
import type { StimulusLike, TrainingProgramLike } from "@/lib/training/types";

const stimuli: StimulusLike[] = [
  { id: "dog", name: "cachorro", imageUrl: "/stimuli/dog.png" },
  { id: "cup", name: "copo", imageUrl: "/stimuli/cup.png" },
  { id: "bed", name: "cama", imageUrl: "/stimuli/bed.png" },
  { id: "apple", name: "maçã", imageUrl: "/stimuli/apple.png" },
  { id: "brush", name: "escova", imageUrl: "/stimuli/brush.png" }
];

const program: TrainingProgramLike = {
  id: "program-1",
  instruction: "Toque no cachorro",
  fieldSize: 4,
  targetStimulusId: "dog",
  distractorStimulusIds: ["cup", "bed", "apple", "brush"],
  randomizePositions: false,
  avoidSamePositionTwice: true
};

describe("training engine", () => {
  it("builds a trial with the target and the configured number of alternatives", () => {
    const trial = buildTrial(program, stimuli);

    expect(trial.instruction).toBe("Toque no cachorro");
    expect(trial.targetStimulus.id).toBe("dog");
    expect(trial.alternatives).toHaveLength(4);
    expect(trial.alternatives.map((stimulus) => stimulus.id).sort()).toEqual(["apple", "bed", "cup", "dog"]);
  });

  it("keeps the target out of the previous position when another position is available", () => {
    const randomizedProgram = { ...program, randomizePositions: true };

    for (let index = 0; index < 25; index += 1) {
      const trial = buildTrial(randomizedProgram, stimuli, 0);
      expect(trial.targetPosition).not.toBe(0);
    }
  });

  it("randomizes alternatives even when an older program has randomization disabled", () => {
    for (let index = 0; index < 25; index += 1) {
      const trial = buildTrial(program, stimuli, 0);
      expect(trial.targetPosition).not.toBe(0);
    }
  });

  it("grades selected stimuli against the target", () => {
    expect(gradeSelection("dog", "dog")).toBe(true);
    expect(gradeSelection("cup", "dog")).toBe(false);
  });

  it("throws a clear error when a program points to a missing target", () => {
    expect(() =>
      buildTrial({ ...program, targetStimulusId: "missing" }, stimuli)
    ).toThrow("Estímulo alvo não encontrado");
  });
  it("supports an optional trial limit configured by the training program", () => {
    expect(getSessionProgress(0, 12)).toEqual({
      currentTrialNumber: 1,
      completedTrials: 0,
      remainingTrials: 12,
      isComplete: false
    });
    expect(getSessionProgress(11, 12)).toEqual({
      currentTrialNumber: 12,
      completedTrials: 11,
      remainingTrials: 1,
      isComplete: false
    });
    expect(getSessionProgress(12, 12)).toEqual({
      currentTrialNumber: 12,
      completedTrials: 12,
      remainingTrials: 0,
      isComplete: true
    });
    expect(getSessionProgress(12, null)).toEqual({
      currentTrialNumber: 13,
      completedTrials: 12,
      remainingTrials: null,
      isComplete: false
    });
  });
});
