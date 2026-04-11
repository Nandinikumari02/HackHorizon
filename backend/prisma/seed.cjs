/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaults = [
  { name: "General", description: "Default / mixed waste" },
  { name: "Plastic", description: "Plastics & packaging" },
  { name: "Paper", description: "Paper & cardboard" },
  { name: "Glass", description: "Glass bottles & jars" },
  { name: "Metal", description: "Cans & scrap metal" },
  { name: "E-Waste", description: "Electronics & batteries" },
  { name: "Organic", description: "Food & garden waste" },
];

async function main() {
  for (const c of defaults) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }
  console.log(`Seeded ${defaults.length} waste categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
