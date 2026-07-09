import { createStimulus } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export default async function StimuliPage() {
  const stimuli = await prisma.stimulus.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }]
  });

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Biblioteca de estímulos</h1>
        <p>Cadastre itens reutilizáveis nos treinos. Imagens usam URL ou caminho local textual nesta versão.</p>
      </section>

      <section className="surface p-5">
        <h2 className="mb-4 text-xl font-bold">Novo estímulo</h2>
        <form action={createStimulus} className="grid gap-4">
          <div className="form-grid">
            <label>
              Nome do estímulo
              <input name="name" required placeholder="cachorro" />
            </label>
            <label>
              Categoria
              <input name="category" placeholder="animal" />
            </label>
            <label>
              Classe
              <input name="className" placeholder="objeto, animal, fruta" />
            </label>
            <label>
              Função
              <input name="functionText" placeholder="beber, dormir, comer" />
            </label>
            <label>
              Características
              <input name="characteristics" placeholder="tem pelo, late" />
            </label>
            <label>
              Imagem
              <input name="imageUrl" placeholder="https://... ou /imagens/item.png" />
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
            Observações
            <textarea name="notes" />
          </label>
          <button className="btn w-fit" type="submit">
            Salvar estímulo
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stimuli.map((stimulus) => (
          <article key={stimulus.id} className="surface overflow-hidden">
            {stimulus.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stimulus.imageUrl} alt={stimulus.name} className="h-44 w-full object-cover" />
            ) : (
              <div className="grid h-44 place-items-center bg-[#eef4ec] text-sm font-bold text-[#56635b]">
                Sem imagem
              </div>
            )}
            <div className="grid gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold">{stimulus.name}</h2>
                <span className="pill">{stimulus.active ? "Ativo" : "Inativo"}</span>
              </div>
              <p className="text-sm text-[#56635b]">
                {stimulus.category ?? "sem categoria"} · {stimulus.className ?? "sem classe"}
              </p>
              <p className="text-sm">
                <strong>Função:</strong> {stimulus.functionText ?? "n/a"}
              </p>
              <p className="text-sm">
                <strong>Características:</strong> {stimulus.characteristics ?? "n/a"}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
