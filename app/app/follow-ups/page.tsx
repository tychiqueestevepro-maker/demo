import { FollowUpQueue, PageHeader } from "@/components/product-components";
import { followUps } from "@/lib/mock-data";

export default function FollowUpsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Follow-ups"
        title="Global follow-up queue"
        description="Due date, campaign, target, reason, step, priority, message, and manual action buttons."
      />
      <FollowUpQueue rows={followUps} />
    </>
  );
}

