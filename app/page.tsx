import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [learners, stimuli, programs, sessions] = await Promise.all([
    prisma.learner.count(),
    prisma.stimulus.count(),
    prisma.trainingProgram.count(),
    prisma.session.count()
  ]);

  const cards = [
    { label: "Crianças cadastradas", value: learners },
    { label: "Estímulos cadastrados", value: stimuli },
    { label: "Programas criados", value: programs },
    { label: "Sessões realizadas", value: sessions }
  ];

  const actions = [
    { href: "/stimuli", label: "Biblioteca de Estímulos" },
    { href: "/programs", label: "Construtor de Treinos" },
    { href: "/run", label: "Executar Treino" },
    { href: "/reports", label: "Relatórios" }
  ];

  return (
    <div className="grid gap-6">
      <section className="page-title">
        <h1>Fluxo funcional de treino por seleção</h1>
        <p>
          App local para organizar estímulos, configurar treinos simples, executar em tablet e registrar dados por
          tentativa. Use apenas dados fictícios nesta primeira build.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="surface p-5">
            <p className="text-sm font-bold text-[#56635b]">{card.label}</p>
            <strong className="mt-3 block text-4xl">{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="surface grid gap-3 p-5 md:grid-cols-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="btn">
            {action.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
