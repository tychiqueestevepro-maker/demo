import { PrismaClient } from "@prisma/client";
import { importTargetsFromCsv } from "./lib/services/target-service";

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst();
    const campaign = await prisma.campaign.findFirst({ where: { userId: user!.id } });
    
    const csv = `Lead,First Name,Last Name,Title,Seniority,Company,Email,LinkedIn
-,Lucas Martin,,Head of Operations,,NovaGrowth Agency,lucas@example.com,https://linkedin.com/in/lucasmartin
-,Emma Dubois,,RevOps Manager,,ScaleBridge Consulting,emma@example.com,`;

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
