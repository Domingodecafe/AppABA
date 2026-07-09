import Link from "next/link";
import { notFound } from "next/navigation";
import { updateLearner } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ learnerId: string }>;
};

export default async function EditLearnerPage({ params }: PageProps) {
  const { learnerId } = await params;
  const learner = await prisma.learner.findUnique({
    where: { id: learnerId }
  });

  if (!learner) {
    notFound();
  }

  const saveLearner = updateLearner.bind(null, learner.id);

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Editar criança</h1>
        <p>Atualize os dados cadastrais sem alterar o histórico de treinos e sessões já registrados.</p>
      </section>

      <section className="surface p-5">
        <form action={saveLearner} className="grid gap-4">
          <div className="form-grid">
            <label>
              Nome
              <input name="name" required defaultValue={learner.name} />
            </label>
            <label>
              Data de nascimento
              <input name="birthDate" type="date" defaultValue={formatDateInput(learner.birthDate)} />
            </label>
            <label>
              Nível de suporte
              <select name="supportLevel" defaultValue={learner.supportLevel}>
                <option>Nível 1 de suporte</option>
                <option>Nível 2 de suporte</option>
                <option>Nível 3 de suporte</option>
              </select>
            </label>
            <label>
              Status
              <select name="active" defaultValue={learner.active ? "active" : "inactive"}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </label>
          </div>

          <label>
            Observações clínicas
            <textarea name="notes" defaultValue={learner.notes ?? ""} placeholder="Resumo breve e necessário." />
          </label>

          <div className="flex flex-wrap gap-3">
            <button className="btn" type="submit">
              Salvar alterações
            </button>
            <Link href="/learners" className="btn secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

function formatDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}
