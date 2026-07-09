"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLearnerForm } from "@/lib/learners/form";
import { gradeSelection } from "@/lib/training/engine";

export async function createLearner(formData: FormData) {
  await prisma.learner.create({
    data: parseLearnerForm(formData)
  });

  revalidatePath("/");
  revalidatePath("/learners");
}

export async function updateLearner(learnerId: string, formData: FormData) {
  await prisma.learner.update({
    where: { id: learnerId },
    data: parseLearnerForm(formData)
  });

  revalidatePath("/");
  revalidatePath("/learners");
  revalidatePath(`/learners/${learnerId}/edit`);
  redirect("/learners");
}

export async function createStimulus(formData: FormData) {
  await prisma.stimulus.create({
    data: {
      name: requiredString(formData, "name"),
      category: optionalString(formData.get("category")),
      className: optionalString(formData.get("className")),
      functionText: optionalString(formData.get("functionText")),
      characteristics: optionalString(formData.get("characteristics")),
      imageUrl: optionalString(formData.get("imageUrl")),
      notes: optionalString(formData.get("notes")),
      active: formData.get("active") !== "inactive"
    }
  });

  revalidatePath("/");
  revalidatePath("/stimuli");
}

export async function createTrainingProgram(formData: FormData) {
  await prisma.trainingProgram.create({
    data: parseTrainingProgramForm(formData)
  });

  revalidatePath("/");
  revalidatePath("/programs");
}

export async function updateTrainingProgram(programId: string, formData: FormData) {
  await prisma.trainingProgram.update({
    where: { id: programId },
    data: parseTrainingProgramForm(formData)
  });

  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath(`/programs/${programId}/edit`);
  redirect("/programs");
}

export async function startSession(formData: FormData) {
  const learnerId = requiredString(formData, "learnerId");
  const trainingProgramId = requiredString(formData, "trainingProgramId");

  const session = await prisma.session.create({
    data: {
      learnerId,
      trainingProgramId
    }
  });

  revalidatePath("/");
  redirect(`/run/${session.id}`);
}

export async function recordTrialResult(formData: FormData) {
  const sessionId = requiredString(formData, "sessionId");
  const learnerId = requiredString(formData, "learnerId");
  const trainingProgramId = requiredString(formData, "trainingProgramId");
  const targetStimulusId = requiredString(formData, "targetStimulusId");
  const selectedStimulusId = requiredString(formData, "selectedStimulusId");
  const startedAtMs = Number(formData.get("startedAtMs") ?? Date.now());
  const presentedStimulusIds = JSON.parse(requiredString(formData, "presentedStimulusIds")) as string[];
  const correct = gradeSelection(selectedStimulusId, targetStimulusId);

  await prisma.trialResult.create({
    data: {
      sessionId,
      learnerId,
      trainingProgramId,
      targetStimulusId,
      selectedStimulusId,
      presentedStimulusIds,
      correct,
      promptLevel: requiredString(formData, "promptLevel"),
      latencyMs: Math.max(0, Date.now() - startedAtMs),
      notes: optionalString(formData.get("notes"))
    }
  });

  const [completedTrials, program] = await Promise.all([
    prisma.trialResult.count({ where: { sessionId } }),
    prisma.trainingProgram.findUnique({
      where: { id: trainingProgramId },
      select: { trialLimit: true }
    })
  ]);

  if (program?.trialLimit && completedTrials >= program.trialLimit) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { endedAt: new Date() }
    });

    revalidatePath("/");
    revalidatePath("/reports");
    redirect(`/reports?completed=${sessionId}`);
  }

  revalidatePath("/");
  revalidatePath("/reports");
  redirect(`/run/${sessionId}?feedback=${correct ? "correct" : "incorrect"}`);
}

export async function endSession(formData: FormData) {
  const sessionId = requiredString(formData, "sessionId");

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      notes: optionalString(formData.get("notes"))
    }
  });

  revalidatePath("/");
  revalidatePath("/reports");
  redirect("/reports");
}

function requiredString(formData: FormData, key: string): string {
  const value = optionalString(formData.get(key));

  if (!value) {
    throw new Error(`Campo obrigatório ausente: ${key}`);
  }

  return value;
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalPositiveNumber(value: FormDataEntryValue | null): number | undefined {
  const text = optionalString(value);

  if (!text) {
    return undefined;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

function parseTrainingProgramForm(formData: FormData) {
  const targetStimulusId = requiredString(formData, "targetStimulusId");
  const distractorStimulusIds = formData
    .getAll("distractorStimulusIds")
    .map(String)
    .filter((id) => id !== targetStimulusId);

  return {
    learnerId: requiredString(formData, "learnerId"),
    name: requiredString(formData, "name"),
    type: requiredString(formData, "type"),
    relationType: requiredString(formData, "relationType"),
    instruction: requiredString(formData, "instruction"),
    fieldSize: Number(formData.get("fieldSize") ?? 4),
    trialLimit: optionalPositiveNumber(formData.get("trialLimit")) ?? null,
    targetStimulusId,
    distractorStimulusIds,
    responseMode: "tocar",
    randomizePositions: true,
    avoidSamePositionTwice: formData.get("avoidSamePositionTwice") === "on",
    masteryCriterion: optionalString(formData.get("masteryCriterion")),
    active: formData.get("active") !== "inactive"
  };
}
