import { PageHeader, SourceGroups } from "@/components/product-components";

export default function DataDirectoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Data Directory"
        title="Campaign and target sources"
        description="View campaign sources, target sources, missing sources, and recently used records in one place."
      />
      <SourceGroups />
    </>
  );
}

