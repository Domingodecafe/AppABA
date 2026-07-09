import Link from "next/link";
import { notFound } from "next/navigation";
import { updateStimulus } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ stimulusId: string }>;
};

export default async function EditStimulusPage({ params }: PageProps) {
  const { stimulusId } = await params;
  const stimulus = await prisma.stimulus.findUnique({
    where: { id: stimulusId }
  });

  if (!stimulus) {
    notFound();
  }

  const saveStimulus = updateStimulus.bind(null, stimulus.id);

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Editar estímulo</h1>
        <p>Corrija dados da biblioteca sem recriar o item. Treinos que usam este estímulo continuam vinculados a ele.</p>
      </section>

      <section className="surface p-5">
        <form action={saveStimulus} className="grid gap-4">
          <div className="form-grid">
            <label>
              Nome do estímulo
              <input name="name" required defaultValue={stimulus.name} />
            </label>
            <label>
              Categoria
              <input name="category" defaultValue={stimulus.category ?? ""} placeholder="animal" />
            </label>
            <label>
              Classe
              <input name="className" defaultValue={stimulus.className ?? ""} placeholder="objeto, animal, fruta" />
            </label>
            <label>
              Função
              <input name="functionText" defaultValue={stimulus.functionText ?? ""} placeholder="beber, dormir, comer" />
            </label>
            <label>
              Características
              <input name="characteristics" defaultValue={stimulus.characteristics ?? ""} placeholder="tem pelo, late" />
            </label>
            <label>
              Imagem
              <input name="imageUrl" defaultValue={stimulus.imageUrl ?? ""} placeholder="https://... ou /imagens/item.png" />
            </label>
            <label>
              Status
              <select name="active" defaultValue={stimulus.active ? "active" : "inactive"}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </label>
          </div>

          <label>
            Observações
            <textarea name="notes" defaultValue={stimulus.notes ?? ""} />
          </label>

          <div className="flex flex-wrap gap-3">
            <button className="btn" type="submit">
              Salvar alterações
            </button>
            <Link href="/stimuli" className="btn secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
