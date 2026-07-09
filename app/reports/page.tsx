import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ completed?: string }>;
};

export default async function ReportsPage({ searchParams }: PageProps) {
  const { completed } = await searchParams;
  const [completedSessions, trials] = await Promise.all([
    prisma.session.findMany({
      where: { endedAt: { not: null } },
      include: {
        learner: true,
        trainingProgram: true,
        trials: true
      },
      orderBy: { endedAt: "desc" },
      take: 30
    }),
    prisma.trialResult.findMany({
      include: {
        learner: true,
        trainingProgram: true,
        targetStimulus: true,
        selectedStimulus: true
      },
      orderBy: { createdAt: "desc" },
      take: 120
    })
  ]);

  const totalTrials = trials.length;
  const correctTrials = trials.filter((trial) => trial.correct).length;
  const independentTrials = trials.filter((trial) => trial.promptLevel === "Independente").length;
  const errorTrials = totalTrials - correctTrials;
  const averageLatency =
    totalTrials > 0 ? Math.round(trials.reduce((sum, trial) => sum + trial.latencyMs, 0) / totalTrials) : 0;

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Relatórios</h1>
        <p>Resumo das sessões concluídas e das tentativas registradas localmente.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Metric label="Tentativas" value={totalTrials.toString()} />
        <Metric label="% acerto" value={percent(correctTrials, totalTrials)} />
        <Metric label="% independente" value={percent(independentTrials, totalTrials)} />
        <Metric label="Erros" value={errorTrials.toString()} />
        <Metric label="Latência média" value={`${averageLatency} ms`} />
      </section>

      <section className="surface responsive-table p-5">
        <h2 className="mb-4 text-xl font-bold">Treinos concluídos</h2>
        <table>
          <thead>
            <tr>
              <th>Encerramento</th>
              <th>Criança</th>
              <th>Treino</th>
              <th>Limite</th>
              <th>Tentativas</th>
              <th>Acertos</th>
              <th>Erros</th>
              <th>% acerto</th>
              <th>Independentes</th>
              <th>Latência média</th>
            </tr>
          </thead>
          <tbody>
            {completedSessions.map((session) => {
              const stats = sessionStats(session.trials);
              return (
                <tr key={session.id} className={completed === session.id ? "bg-[#eef4ec]" : undefined}>
                  <td>{session.endedAt ? formatDate(session.endedAt) : "-"}</td>
                  <td>{session.learner.name}</td>
                  <td className="font-bold">{session.trainingProgram.name}</td>
                  <td>{session.trainingProgram.trialLimit ?? "Sem limite"}</td>
                  <td>{stats.total}</td>
                  <td>{stats.correct}</td>
                  <td>{stats.errors}</td>
                  <td>{percent(stats.correct, stats.total)}</td>
                  <td>{stats.independent}</td>
                  <td>{stats.averageLatency} ms</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="surface responsive-table p-5">
        <h2 className="mb-4 text-xl font-bold">Tentativas detalhadas</h2>
        <table>
          <thead>
            <tr>
              <th>Data/hora</th>
              <th>Criança</th>
              <th>Treino</th>
              <th>Alvo</th>
              <th>Selecionado</th>
              <th>Resultado</th>
              <th>Prompt</th>
              <th>Latência</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial) => (
              <tr key={trial.id}>
                <td>{formatDate(trial.createdAt)}</td>
                <td>{trial.learner.name}</td>
                <td>{trial.trainingProgram.name}</td>
                <td>{trial.targetStimulus.name}</td>
                <td>{trial.selectedStimulus.name}</td>
                <td>{trial.correct ? "Acerto" : "Erro"}</td>
                <td>{trial.promptLevel}</td>
                <td>{trial.latencyMs} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="surface p-5">
      <p className="text-sm font-bold text-[#56635b]">{label}</p>
      <strong className="mt-3 block text-3xl">{value}</strong>
    </article>
  );
}

function sessionStats(trials: Array<{ correct: boolean; promptLevel: string; latencyMs: number }>) {
  const total = trials.length;
  const correct = trials.filter((trial) => trial.correct).length;
  const independent = trials.filter((trial) => trial.promptLevel === "Independente").length;
  const averageLatency = total > 0 ? Math.round(trials.reduce((sum, trial) => sum + trial.latencyMs, 0) / total) : 0;

  return {
    total,
    correct,
    errors: total - correct,
    independent,
    averageLatency
  };
}

function percent(part: number, total: number): string {
  if (total === 0) {
    return "0%";
  }

  return `${Math.round((part / total) * 100)}%`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}
