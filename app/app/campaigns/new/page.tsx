import { CampaignWizard, PageHeader } from "@/components/product-components";

export default function NewCampaignPage() {
  return (
    <>
      <PageHeader
        eyebrow="Create Campaign"
        title="Build the campaign step by step"
        description="Purpose, context, rules, targets, and an editable AI playbook stay separated so the user understands each choice."
      />
      <CampaignWizard />
    </>
  );
}

