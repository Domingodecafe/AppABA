import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treinos Clínico-Educacionais",
  description: "MVP local para treino de repertórios por seleção e registro de tentativas."
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/learners", label: "Crianças" },
  { href: "/stimuli", label: "Estímulos" },
  { href: "/programs", label: "Treinos" },
  { href: "/run", label: "Executar" },
  { href: "/reports", label: "Relatórios" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b border-[#e4ded1] bg-white/86">
          <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
            <Link href="/" className="grid gap-1">
              <strong className="text-lg">Treinos Clínico-Educacionais</strong>
              <span className="text-sm text-[#56635b]">MVP local de apoio, sem decisão clínica automática</span>
            </Link>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-[#eef4ec]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
