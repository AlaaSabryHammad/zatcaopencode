/**
 * Seed entry point. Phase 1 only records the schema version; demo organization, users,
 * invoices etc. (design/CLAUDE_CODE_PROMPT.md §8) are added as their models land.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.systemInfo.upsert({
    where: { key: 'seed.phase' },
    update: { value: '1' },
    create: { key: 'seed.phase', value: '1' },
  });
  console.log('Seed complete (phase 1).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
