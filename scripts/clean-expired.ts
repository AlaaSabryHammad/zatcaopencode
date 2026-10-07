import { prisma } from '../src/server/db';
import { cleanupSessions } from '../src/server/services/session.service';
import { cleanupOtp } from '../src/server/services/otp.service';
import { PostgresStore } from '../src/server/rate-limit/postgres';

async function main() {
  const s = await cleanupSessions();
  const o = await cleanupOtp();
  const rl = new PostgresStore();
  await rl.cleanup(Date.now());
  console.log(`cleaned: sessions=${s}, otp=${o}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
