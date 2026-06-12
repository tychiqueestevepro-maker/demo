import { DataDirectoryWorkspace, PageHeader } from "@/components/product-components";

export default function DataDirectoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Data Directory"
        title="Campaign documents and prospect notes"
        description="Store the documents attached to each campaign, plus the notes and useful information linked to each prospect."
      />
      <DataDirectoryWorkspace />
    </>
  );
}
