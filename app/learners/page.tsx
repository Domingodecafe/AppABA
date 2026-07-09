import Link from "next/link";
import { createLearner } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LearnersPage() {
  const learners = await prisma.learner.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Crianças</h1>
        <p>Cadastro mínimo para vincular treinos e sessões. Evite inserir dados reais nesta fase de MVP.</p>
      </section>

      <section className="surface p-5">
        <h2 className="mb-4 text-xl font-bold">Nova criança</h2>
        <form action={createLearner} className="grid gap-4">
          <div className="form-grid">
            <label>
              Nome
              <input name="name" required placeholder="Criança exemplo" />
            </label>
            <label>
              Data de nascimento
              <input name="birthDate" type="date" />
            </label>
            <label>
              Nível de suporte
              <select name="supportLevel" defaultValue="Nível 3 de suporte">
                <option>Nível 1 de suporte</option>
                <option>Nível 2 de suporte</option>
                <option>Nível 3 de suporte</option>
              </select>
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
            Observações clínicas
            <textarea name="notes" placeholder="Resumo breve e necessário para uso local." />
          </label>
          <button className="btn w-fit" type="submit">
            Salvar criança
          </button>
        </form>
      </section>

      <section className="surface responsive-table p-5">
        <h2 className="mb-4 text-xl font-bold">Cadastradas</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Suporte</th>
              <th>Status</th>
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {learners.map((learner) => (
              <tr key={learner.id}>
                <td className="font-bold">{learner.name}</td>
                <td>{learner.supportLevel}</td>
                <td>{learner.active ? "Ativo" : "Inativo"}</td>
                <td>{learner.notes ?? "Sem observações"}</td>
                <td>
                  <Link href={`/learners/${learner.id}/edit`} className="btn secondary min-h-0 px-3 py-2 text-sm">
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
