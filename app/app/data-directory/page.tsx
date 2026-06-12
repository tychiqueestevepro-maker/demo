import { DataDirectoryWorkspace, PageHeader } from "@/components/product-components";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DataDirectoryPage() {
  let userId;
  try {
    const user = await getServerUser();
    userId = user.userId;
  } catch {
    redirect("/login");
  }

  const campaigns = await prisma.campaign.findMany({ where: { userId } });
  const targets = await prisma.campaignTarget.findMany({ where: { userId } });
  const dataSources = await prisma.dataSource.findMany({ where: { userId } });

  const campaignsData = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status,
    type: c.type,
    goal: c.goal,
    targets: targets.filter(t => t.campaignId === c.id).length,
  }));

  const targetsData = targets.map(t => ({
    id: t.id,
    campaignId: t.campaignId,
    name: t.name,
  }));

  const dataSourcesData = dataSources.map(d => ({
    id: d.id,
    title: d.title,
    type: d.type,
    url: d.url || "",
    description: d.description || "",
    campaignId: d.campaignId || "",
    targetId: d.targetId || undefined,
    linkedCampaign: campaigns.find(c => c.id === d.campaignId)?.name,
    linkedTarget: targets.find(t => t.id === d.targetId)?.name,
    missing: false,
    importance: d.importance,
    lastChecked: d.lastCheckedAt ? new Date(d.lastCheckedAt).toLocaleDateString() : "Never",
  }));

  return (
    <>
      <PageHeader
        eyebrow="Data Directory"
        title="Campaign documents and prospect notes"
        description="Store the documents attached to each campaign, plus the notes and useful information linked to each prospect."
      />
      <DataDirectoryWorkspace 
        initialCampaigns={campaignsData} 
        initialTargets={targetsData} 
        initialDataSources={dataSourcesData} 
      />
    </>
  );
}
