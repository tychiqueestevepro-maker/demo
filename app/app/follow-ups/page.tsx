import { FollowUpCampaignQueue, PageHeader } from "@/components/product-components";

export default function FollowUpsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Follow-ups"
        title="Campaign queue"
        description="Choose a campaign, then work its manual queue in order: replies first, urgent due actions next, blocked context before copy/send."
      />
      <FollowUpCampaignQueue />
    </>
  );
}
