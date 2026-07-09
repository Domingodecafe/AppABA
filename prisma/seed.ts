import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.trialResult.deleteMany();
  await prisma.session.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.stimulusRelation.deleteMany();
  await prisma.stimulus.deleteMany();
  await prisma.learner.deleteMany();

  const learner = await prisma.learner.create({
    data: {
      name: "Criança exemplo",
      supportLevel: "Nível 3 de suporte",
      notes: "Perfil fictício para demonstração local. Não usar dados reais no seed.",
      active: true
    }
  });

  const dog = await prisma.stimulus.create({
    data: {
      name: "cachorro",
      category: "animal",
      className: "animal",
      functionText: "n/a",
      characteristics: "tem pelo, late",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
      notes: "Seed fictício",
      active: true
    }
  });

  const toothbrush = await prisma.stimulus.create({
    data: {
      name: "escova de dentes",
      category: "higiene",
      className: "objeto",
      functionText: "escovar dentes",
      characteristics: "tem cerdas",
      imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600",
      active: true
    }
  });

  const cup = await prisma.stimulus.create({
    data: {
      name: "copo",
      category: "utensílio",
      className: "objeto",
      functionText: "beber",
      characteristics: "recipiente",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
      active: true
    }
  });

  const bed = await prisma.stimulus.create({
    data: {
      name: "cama",
      category: "casa",
      className: "móvel",
      functionText: "dormir",
      characteristics: "macia",
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
      active: true
    }
  });

  const apple = await prisma.stimulus.create({
    data: {
      name: "maçã",
      category: "alimento",
      className: "fruta",
      functionText: "comer",
      characteristics: "vermelha",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600",
      active: true
    }
  });

  await prisma.stimulusRelation.createMany({
    data: [
      { type: "nome_para_imagem", sourceStimulusId: dog.id, targetStimulusId: dog.id },
      { type: "funcao_para_item", sourceStimulusId: cup.id, targetStimulusId: cup.id },
      { type: "igual_a", sourceStimulusId: apple.id, targetStimulusId: apple.id }
    ]
  });

  const distractors = [toothbrush.id, cup.id, bed.id, apple.id];

  await prisma.trainingProgram.createMany({
    data: [
      {
        learnerId: learner.id,
        name: "Ouvinte: cachorro",
        type: "Ouvinte",
        relationType: "nome_para_imagem",
        instruction: "Toque no cachorro",
        fieldSize: 4,
        trialLimit: 12,
        targetStimulusId: dog.id,
        distractorStimulusIds: distractors,
        responseMode: "tocar",
        randomizePositions: true,
        avoidSamePositionTwice: true,
        masteryCriterion: "80% de acerto independente em duas sessões consecutivas",
        active: true
      },
      {
        learnerId: learner.id,
        name: "LRFFC: beber",
        type: "LRFFC",
        relationType: "funcao_para_item",
        instruction: "Qual usamos para beber?",
        fieldSize: 3,
        trialLimit: 12,
        targetStimulusId: cup.id,
        distractorStimulusIds: [dog.id, bed.id, apple.id],
        responseMode: "tocar",
        randomizePositions: true,
        avoidSamePositionTwice: true,
        masteryCriterion: "Responder independente em 8 de 10 tentativas",
        active: true
      },
      {
        learnerId: learner.id,
        name: "Pareamento: maçã",
        type: "Pareamento",
        relationType: "igual_a",
        instruction: "Ache o igual",
        fieldSize: 2,
        trialLimit: 12,
        targetStimulusId: apple.id,
        distractorStimulusIds: [cup.id, toothbrush.id],
        responseMode: "tocar",
        randomizePositions: true,
        avoidSamePositionTwice: true,
        masteryCriterion: "Parear sem prompt em 90% das tentativas",
        active: true
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
