import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/product-components";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TemplatesPage() {
  const { userId } = await getServerUser();

  const playbooks = await prisma.campaignPlaybook.findMany({
    where: { userId },
    include: {
      campaign: true,
      stages: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedTemplates = playbooks.map((pb) => ({
    id: pb.id,
    category: pb.campaign?.type?.replace(/_/g, " ") || "Custom sequence",
    title: pb.name,
    description: pb.description || "Custom AI generated sequence.",
    steps: pb.stages.map((s) => `Day ${s.delayDays}: ${s.name}`),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Templates"
        title="Generated and saved playbooks"
        description="Prospecting, recruiting, HR, invoice, client request, vendor, and custom sequences ready to adapt."
      />
      
      {formattedTemplates.length === 0 && (
        <div className="rounded-3xl border border-violet-500/15 bg-white p-12 text-center shadow-xl shadow-violet-950/5">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-violet-600">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-[#120b2f]">No saved playbooks yet</h3>
          <p className="mt-2 text-sm text-[#120b2f]/58 max-w-md mx-auto">
            Playbooks are automatically saved here when you create and generate new sequences using the AI assistant.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {formattedTemplates.map((template) => (
          <Card key={template.id} className="transition hover:-translate-y-1">
            <CardContent className="pt-5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
                <FileText className="h-4 w-4" />
              </div>
              <Badge className="mt-5" tone="violet">{template.category}</Badge>
              <h3 className="mt-3 text-lg font-semibold text-neutral-950">{template.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{template.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {template.steps.map((step, idx) => <Badge key={`${template.id}-step-${idx}`}>{step}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
