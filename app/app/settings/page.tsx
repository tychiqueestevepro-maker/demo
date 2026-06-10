import { Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/product-components";
import { settingsSections } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Workspace preferences"
        description="Profile, campaign types, default follow-up delays, statuses, AI preferences, and notification preferences."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsSections.map((section) => (
          <Card key={section.title}>
            <CardContent className="pt-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-white">
                  <Settings className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-neutral-950">{section.title}</h3>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => <Badge key={item} className="mr-2 rounded-md">{item}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
