type MessageTarget = {
  name?: string | null;
  company?: string | null;
  role?: string | null;
  email?: string | null;
  note?: string | null;
  notes?: string | null;
};

export function personalizeMessage(template: string, target: MessageTarget) {
  const name = target.name?.trim() || "there";
  const [firstName = name] = name.split(/\s+/);
  const values: Record<string, string> = {
    name,
    fullName: name,
    firstName,
    firstname: firstName,
    first_name: firstName,
    company: target.company?.trim() || "your company",
    role: target.role?.trim() || "your role",
    title: target.role?.trim() || "your role",
    email: target.email?.trim() || "",
    note: target.note?.trim() || target.notes?.trim() || "",
    notes: target.notes?.trim() || target.note?.trim() || "",
  };

  const replaceKey = (match: string, key: string) => {
    const value = values[key] ?? values[key.toLowerCase()];
    return value ?? match;
  };

  return template
    .replace(/\{\{\s*([\w.-]+)\s*\}\}/g, replaceKey)
    .replace(/\{\s*([\w.-]+)\s*\}/g, replaceKey)
    .replace(/\(\s*([\w.-]+)\s*\)/g, replaceKey)
    .replace(/\[\s*([\w.-]+)\s*\]/g, replaceKey);
}
