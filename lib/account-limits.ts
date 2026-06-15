export const PROSPECTS_PER_PAGE = 30;
export const MAX_PROSPECTS_PER_CAMPAIGN = 500;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
export const MAX_ACCOUNT_STORAGE_BYTES = 1024 * 1024 * 1024;

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${bytes} B`;
}
