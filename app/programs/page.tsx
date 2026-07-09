import Link from "next/link";
import { createTrainingProgram } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { jsonStringArray } from "@/lib/training/adapters";
import { relationTypes, trainingTypes } from "@/lib/training/options";

export default async function ProgramsPage() {
  const [learners, stimuli, programs] = await Promise.all([
    prisma.learner.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.stimulus.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.trainingProgram.findMany({
      include: { learner: true, targetStimulus: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Construtor de treinos</h1>
        <p>
          Escolha uma imagem da biblioteca como estímulo modelo/alvo e use qualquer outra imagem ativa como alternativa.
          As escolhas são randomizadas automaticamente durante a execução.
        </p>
      </section>

      <section className="surface p-5">
        <h2 className="mb-4 text-xl font-bold">Novo treino</h2>
        <form action={createTrainingProgram} className="grid gap-4">
          <div className="form-grid">
            <label>
              Nome do treino
              <input name="name" required placeholder="Ouvinte: cachorro" />
            </label>
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
              Tipo de treino
              <select name="type" defaultValue="Ouvinte">
                {trainingTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Relação alvo
              <select name="relationType" defaultValue="nome_para_imagem">
                {relationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Instrução/SD
              <input name="instruction" required placeholder="Toque no cachorro" />
            </label>
            <label>
              Tamanho do campo
              <select name="fieldSize" defaultValue="4">
                <option value="2">2 alternativas</option>
                <option value="3">3 alternativas</option>
                <option value="4">4 alternativas</option>
                <option value="6">6 alternativas</option>
              </select>
            </label>
            <label>
              Limite de tentativas
              <input name="trialLimit" type="number" min="1" step="1" placeholder="Opcional. Ex.: 12" />
            </label>
            <label>
              Status
              <select name="active" defaultValue="active">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </label>
          </div>

          <label>
            Estímulo modelo/alvo
            <select name="targetStimulusId" required>
              <option value="">Selecione uma imagem da biblioteca</option>
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
                  <input type="checkbox" name="distractorStimulusIds" value={stimulus.id} />
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
              <input name="avoidSamePositionTwice" type="checkbox" defaultChecked />
              Evitar alvo na mesma posição consecutiva
            </label>
          </div>

          <label>
            Critério de domínio
            <textarea name="masteryCriterion" placeholder="80% de acerto independente em duas sessões consecutivas" />
          </label>

          <button className="btn w-fit" type="submit">
            Salvar treino
          </button>
        </form>
      </section>

      <section className="surface responsive-table p-5">
        <h2 className="mb-4 text-xl font-bold">Treinos criados</h2>
        <table>
          <thead>
            <tr>
              <th>Treino</th>
              <th>Criança</th>
              <th>Tipo</th>
              <th>Modelo/alvo</th>
              <th>Campo</th>
              <th>Limite</th>
              <th>Distratores</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id}>
                <td className="font-bold">{program.name}</td>
                <td>{program.learner.name}</td>
                <td>{program.type}</td>
                <td>{program.targetStimulus.name}</td>
                <td>{program.fieldSize}</td>
                <td>{program.trialLimit ?? "Sem limite"}</td>
                <td>{jsonStringArray(program.distractorStimulusIds).length}</td>
                <td>{program.active ? "Ativo" : "Inativo"}</td>
                <td>
                  <Link href={`/programs/${program.id}/edit`} className="btn secondary min-h-0 px-3 py-2 text-sm">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
