import { startSession } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RunPage() {
  const [learners, programs] = await Promise.all([
    prisma.learner.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.trainingProgram.findMany({
      where: { active: true },
      include: { learner: true, targetStimulus: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Executar treino</h1>
        <p>Escolha a criança e um treino ativo. A próxima tela é otimizada para tablet e baixa distração.</p>
      </section>

      <section className="surface p-5">
        <form action={startSession} className="grid gap-4">
          <div className="form-grid">
            <label>
              Criança
              <select name="learnerId" required>
                <option value="">Selecione</option>
                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>
                    {learner.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Treino ativo
              <select name="trainingProgramId" required>
                <option value="">Selecione</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} · {program.learner.name} · alvo: {program.targetStimulus.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn w-fit" type="submit">
            Iniciar sessão
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {programs.map((program) => (
          <article key={program.id} className="surface grid gap-2 p-4">
            <span className="pill w-fit">{program.type}</span>
            <h2 className="text-lg font-bold">{program.name}</h2>
            <p className="text-sm text-[#56635b]">{program.instruction}</p>
            <p className="text-sm">Criança vinculada: {program.learner.name}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
