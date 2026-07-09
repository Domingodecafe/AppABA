import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTrainingProgram } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { jsonStringArray } from "@/lib/training/adapters";
import { relationTypes, trainingTypes } from "@/lib/training/options";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ programId: string }>;
};

export default async function EditTrainingProgramPage({ params }: PageProps) {
  const { programId } = await params;

  const [program, learners, stimuli] = await Promise.all([
    prisma.trainingProgram.findUnique({
      where: { id: programId },
      include: { learner: true, targetStimulus: true }
    }),
    prisma.learner.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.stimulus.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  if (!program) {
    notFound();
  }

  const selectedDistractors = new Set(jsonStringArray(program.distractorStimulusIds));
  const saveTrainingProgram = updateTrainingProgram.bind(null, program.id);

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Editar treino</h1>
        <p>Atualize a configuração do treino. Sessões antigas continuam preservadas no relatório.</p>
      </section>

      <section className="surface p-5">
        <form action={saveTrainingProgram} className="grid gap-4">
          <div className="form-grid">
            <label>
              Nome do treino
              <input name="name" required defaultValue={program.name} />
            </label>
            <label>
              Criança
              <select name="learnerId" required defaultValue={program.learnerId}>
                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>
                    {learner.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo de treino
              <select name="type" defaultValue={program.type}>
                {trainingTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Relação alvo
              <select name="relationType" defaultValue={program.relationType}>
                {relationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Instrução/SD
              <input name="instruction" required defaultValue={program.instruction} />
            </label>
            <label>
              Tamanho do campo
              <select name="fieldSize" defaultValue={program.fieldSize.toString()}>
                <option value="2">2 alternativas</option>
                <option value="3">3 alternativas</option>
                <option value="4">4 alternativas</option>
                <option value="6">6 alternativas</option>
              </select>
            </label>
            <label>
              Limite de tentativas
              <input
                name="trialLimit"
                type="number"
                min="1"
                step="1"
                defaultValue={program.trialLimit ?? ""}
                placeholder="Opcional. Ex.: 12"
              />
            </label>
            <label>
              Status
              <select name="active" defaultValue={program.active ? "active" : "inactive"}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </label>
          </div>

          <label>
            Estímulo modelo/alvo
            <select name="targetStimulusId" required defaultValue={program.targetStimulusId}>
              {stimuli.map((stimulus) => (
                <option key={stimulus.id} value={stimulus.id}>
                  {stimulus.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="grid gap-3 rounded-lg border border-[#d8d2c4] p-4">
            <legend className="px-2 text-sm font-bold text-[#56635b]">Distratores / imagens de escolha</legend>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-[#e4ded1] bg-white">
              {stimuli.map((stimulus) => (
                <label
                  key={stimulus.id}
                  className="grid cursor-pointer grid-cols-[auto_64px_1fr] items-center gap-3 border-b border-[#eee8dc] p-3 font-medium last:border-b-0 hover:bg-[#f7faf6]"
                >
                  <input
                    type="checkbox"
                    name="distractorStimulusIds"
                    value={stimulus.id}
                    defaultChecked={selectedDistractors.has(stimulus.id)}
                  />
                  {stimulus.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stimulus.imageUrl} alt="" className="h-14 w-16 rounded-md object-cover" />
                  ) : (
                    <span className="grid h-14 w-16 place-items-center rounded-md bg-[#eef4ec] text-xs text-[#56635b]">
                      Sem imagem
                    </span>
                  )}
                  <span>
                    <strong className="block">{stimulus.name}</strong>
                    <span className="text-sm text-[#56635b]">
                      {stimulus.category ?? "sem categoria"} · {stimulus.className ?? "sem classe"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 md:grid-cols-2">
            <span className="pill w-fit bg-[#eef4ec]">Escolhas randomizadas automaticamente</span>
            <label className="flex-row items-center gap-2">
              <input name="avoidSamePositionTwice" type="checkbox" defaultChecked={program.avoidSamePositionTwice} />
              Evitar alvo na mesma posição consecutiva
            </label>
          </div>

          <label>
            Critério de domínio
            <textarea
              name="masteryCriterion"
              defaultValue={program.masteryCriterion ?? ""}
              placeholder="80% de acerto independente em duas sessões consecutivas"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button className="btn" type="submit">
              Salvar alterações
            </button>
            <Link href="/programs" className="btn secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
