# Treinos Clínico-Educacionais

MVP local em Next.js para montar estímulos, configurar treinos por seleção, executar sessões em modo tablet e registrar tentativas.

Este app é uma ferramenta de apoio clínico/educacional. Ele não realiza diagnóstico, prescrição, decisão clínica automática nem substitui supervisão profissional.

## Stack

- Next.js + TypeScript + App Router
- Prisma
- SQLite no MVP
- Tailwind CSS
- Vitest para testes do motor de treino

## Como rodar

Nesta máquina, o ambiente atual expõe `pnpm`, mas não expõe `node`, `npm` e `npx` diretamente no PATH do PowerShell. Se você estiver usando Node instalado normalmente, pode usar `npm`. Se estiver no ambiente do Codex, use os comandos com `pnpm`.

### Com pnpm

```bash
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

### Com npm

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Depois abra `http://localhost:3000`.

## Fluxo do MVP

1. Cadastre ou revise crianças em `/learners`.
2. Cadastre estímulos em `/stimuli`.
3. Crie treinos em `/programs`.
4. Inicie uma sessão em `/run`.
5. Execute tentativas em modo tablet.
6. Confira dados em `/reports`.

## Seed

O seed cria:

- 1 criança fictícia.
- 5 estímulos iniciais.
- 3 treinos exemplo: Ouvinte, LRFFC e Pareamento.

Não use dados reais no seed ou em demonstrações públicas.

## Verificações

```bash
pnpm test
pnpm lint
pnpm build
```
