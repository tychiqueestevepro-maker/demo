export function normalizeCsvRecord(record: Record<string, string>) {
  const normalized = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key.trim().toLowerCase().replace(/\s+/g, "_"), value?.trim() ?? ""]),
  );

  return {
    name: pickCsvValue(normalized, "name", "full_name", "contact", "prospect", "lead", "first_name"),
    company: pickCsvValue(normalized, "company", "account", "organization", "company_name") || null,
    role: pickCsvValue(normalized, "role", "title", "job_title", "position", "seniority") || null,
    email: pickCsvValue(normalized, "email", "email_address", "mail") || null,
    phone: pickCsvValue(normalized, "phone", "phone_number", "mobile", "cell") || null,
    profileUrl: pickCsvValue(normalized, "profileurl", "profile_url", "linkedin", "linkedin_url", "profile", "linkedin_profile") || null,
    customChannelUrl: pickCsvValue(normalized, "customchannelurl", "custom_channel_url", "channel_url") || null,
    notes: pickCsvValue(normalized, "note", "notes", "context") || null,
  };
}

function pickCsvValue(record: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value) {
      return value;
    }
  }

  return "";
}
