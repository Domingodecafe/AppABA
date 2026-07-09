import Link from "next/link";
import { endSession, recordTrialResult } from "@/app/actions";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { prisma } from "@/lib/prisma";
import { toTrainingProgramLike } from "@/lib/training/adapters";
import { buildTrial, getSessionProgress } from "@/lib/training/engine";
import type { StimulusLike } from "@/lib/training/types";

type PageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ feedback?: string }>;
};

const promptLevels = ["Independente", "Prompt visual", "Prompt gestual", "Prompt físico", "Correção"];

export default async function TabletRunPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { feedback } = await searchParams;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      learner: true,
      trainingProgram: {
        include: { targetStimulus: true }
      },
      trials: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!session) {
    return (
      <div className="surface grid gap-4 p-6">
        <h1 className="text-2xl font-bold">Sessão não encontrada</h1>
        <Link href="/run" className="btn w-fit">
          Voltar
        </Link>
      </div>
    );
  }

  if (session.endedAt) {
    return (
      <div className="surface grid gap-4 p-6">
        <h1 className="text-2xl font-bold">Sessão encerrada</h1>
        <p>Esta sessão já foi finalizada e está disponível em relatórios.</p>
        <Link href="/reports" className="btn w-fit">
          Ver relatórios
        </Link>
      </div>
    );
  }

  const attempts = await prisma.trialResult.count({ where: { sessionId } });
  const progress = getSessionProgress(attempts, session.trainingProgram.trialLimit);

  if (progress.isComplete) {
    return (
      <div className="surface grid gap-4 p-6">
        <h1 className="text-2xl font-bold">Limite de tentativas atingido</h1>
        <p>Este treino chegou ao limite configurado. Encerre a sessão para consolidar o relatório.</p>
        <form action={endSession} className="grid gap-3">
          <input type="hidden" name="sessionId" value={session.id} />
          <button className="btn w-fit" type="submit">
            Encerrar e ver relatórios
          </button>
        </form>
      </div>
    );
  }

  const stimuli = await prisma.stimulus.findMany({ where: { active: true } });
  const stimulusLikes: StimulusLike[] = stimuli.map((stimulus) => ({
    id: stimulus.id,
    name: stimulus.name,
    imageUrl: stimulus.imageUrl,
    category: stimulus.category,
    className: stimulus.className,
    functionText: stimulus.functionText,
    characteristics: stimulus.characteristics
  }));

  const lastPresented = session.trials[0]?.presentedStimulusIds;
  const lastPresentedIds = Array.isArray(lastPresented)
    ? lastPresented.filter((id): id is string => typeof id === "string")
    : [];
  const previousTargetPosition = lastPresentedIds.indexOf(session.trainingProgram.targetStimulusId);
  const trial = buildTrial(toTrainingProgramLike(session.trainingProgram), stimulusLikes, previousTargetPosition);
  const startedAtMs = Date.now();
  const progressLabel =
    progress.remainingTrials === null
      ? `Tentativas: ${progress.completedTrials}`
      : `Tentativa ${progress.currentTrialNumber} de ${session.trainingProgram.trialLimit}`;

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <ConfettiCelebration active={feedback === "correct"} />

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#56635b]">
            {session.learner.name} · {session.trainingProgram.name}
          </p>
          <h1 className="text-3xl font-black md:text-5xl">{trial.instruction}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill">{progressLabel}</span>
          {feedback ? (
            <span className={`pill ${feedback === "correct" ? "bg-[#eef4ec]" : "bg-[#fbe7e2]"}`}>
              {feedback === "correct" ? "Acerto registrado" : "Erro registrado"}
            </span>
          ) : null}
        </div>
      </section>

      <form action={recordTrialResult} className="grid gap-5">
        <input type="hidden" name="sessionId" value={session.id} />
        <input type="hidden" name="learnerId" value={session.learnerId} />
        <input type="hidden" name="trainingProgramId" value={session.trainingProgramId} />
        <input type="hidden" name="targetStimulusId" value={trial.targetStimulus.id} />
        <input
          type="hidden"
          name="presentedStimulusIds"
          value={JSON.stringify(trial.alternatives.map((stimulus) => stimulus.id))}
        />
        <input type="hidden" name="startedAtMs" value={startedAtMs} />

        <fieldset className="surface grid gap-3 p-4">
          <legend className="px-2 text-sm font-bold text-[#56635b]">Prompt usado</legend>
          <div className="grid gap-2 md:grid-cols-5">
            {promptLevels.map((level) => (
              <label key={level} className="flex-row items-center gap-2 rounded-lg border border-[#d8d2c4] bg-white p-3 font-bold">
                <input name="promptLevel" type="radio" value={level} defaultChecked={level === "Independente"} />
                {level}
              </label>
            ))}
          </div>
        </fieldset>

        <section className="choice-grid">
          {trial.alternatives.map((stimulus) => (
            <button
              key={stimulus.id}
              type="submit"
              name="selectedStimulusId"
              value={stimulus.id}
              className="surface grid min-h-56 gap-3 p-4 text-left transition hover:scale-[1.01] hover:border-[#4f6f52] focus:outline-none focus:ring-4 focus:ring-[#dceaf7]"
            >
              {stimulus.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stimulus.imageUrl} alt="" className="h-44 w-full rounded-lg object-cover" />
              ) : (
                <span className="grid h-44 place-items-center rounded-lg bg-[#eef4ec] text-sm font-bold text-[#56635b]">
                  Sem imagem
                </span>
              )}
              <span className="text-2xl font-black">{stimulus.name}</span>
            </button>
          ))}
        </section>

        <section className="model-card surface grid gap-3 p-4 text-center">
          <span className="text-sm font-bold text-[#56635b]">Estímulo modelo</span>
          {trial.targetStimulus.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trial.targetStimulus.imageUrl} alt="" className="mx-auto h-48 w-full rounded-lg object-cover" />
          ) : (
            <span className="grid h-48 place-items-center rounded-lg bg-[#eef4ec] text-sm font-bold text-[#56635b]">
              Sem imagem
            </span>
          )}
          <strong className="text-2xl">{trial.targetStimulus.name}</strong>
        </section>

        <label>
          Observação opcional da tentativa
          <textarea name="notes" placeholder="Ex.: olhou para o distrator antes de responder." />
        </label>
      </form>

      <section className="surface flex flex-wrap items-end justify-between gap-4 p-4">
        <form action={endSession} className="grid flex-1 gap-3 md:grid-cols-[1fr_auto]">
          <input type="hidden" name="sessionId" value={session.id} />
          <label>
            Observação da sessão
            <input name="notes" placeholder="Resumo breve antes de encerrar" />
          </label>
          <button className="btn danger self-end" type="submit">
            Encerrar sessão
          </button>
        </form>
        <Link href="/run" className="btn secondary">
          Pausar
        </Link>
      </section>
    </div>
  );
}
