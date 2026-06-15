import { PrismaClient } from "@prisma/client";
import { importTargetsFromCsv } from "./lib/services/target-service";

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst();
    const campaign = await prisma.campaign.findFirst({ where: { userId: user!.id } });
    
    const csv = `name,email,company\nTest Person,test@example.com,Test Inc`;

    console.log("Importing...");
    const result = await importTargetsFromCsv(user!.id, campaign!.id, csv);
    console.log("Success:", result.length);
  } catch (e) {
    console.error("Error occurred:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
