import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/product-components";
import { templates } from "@/lib/mock-data";

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Templates"
        title="Generated and saved playbooks"
        description="Prospecting, recruiting, HR, invoice, client request, vendor, and custom sequences ready to adapt."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="pt-5">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-white">
                <FileText className="h-4 w-4" />
              </div>
              <Badge className="mt-5" tone="violet">{template.category}</Badge>
              <h3 className="mt-3 text-lg font-semibold text-neutral-950">{template.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{template.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {template.steps.map((step) => <Badge key={step}>{step}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

