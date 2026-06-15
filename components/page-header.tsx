import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 overflow-hidden rounded-[2rem] border border-violet-500/15 bg-[radial-gradient(circle_at_90%_0%,rgba(167,139,250,0.20),transparent_30%),linear-gradient(135deg,#ffffff_0%,#fbf9ff_100%)] p-6 text-[#120b2f] shadow-2xl shadow-violet-950/10 backdrop-blur md:flex md:items-end md:justify-between md:gap-4">
      <div>
        {eyebrow ? <Badge tone="violet" className="mb-3">{eyebrow}</Badge> : null}
        <h1 className="text-3xl font-bold tracking-tight text-[#120b2f] md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#120b2f]/62 md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
