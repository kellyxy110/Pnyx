import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const spaces = [
  ["artificial-intelligence", "Artificial Intelligence"], ["programming", "Programming"], ["web", "Web3"], ["mobile", "Mobile"], ["cloud", "Cloud"], ["data", "Data"], ["cybersecurity", "Cybersecurity"], ["design", "Design"], ["business", "Business"], ["education", "Education"], ["hardware", "Hardware"], ["cryptocurrency", "Cryptocurrency"],
] as const;

async function main() {
  for (const [slug, name] of spaces) {
    await prisma.space.upsert({ where: { slug }, update: { name }, create: { slug, name, description: `A thoughtful community for ${name.toLowerCase()} conversations and organised knowledge.` } });
  }
}

main().finally(() => prisma.$disconnect());
