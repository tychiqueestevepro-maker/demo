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
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    let mappedKey = normalized;
    
    if (normalized.includes("firstname")) mappedKey = "firstName";
    else if (normalized.includes("fullname")) mappedKey = "fullName";
    else if (normalized.includes("candidate") || normalized.includes("prospect") || normalized.includes("target")) mappedKey = "firstName";
    else if (normalized.includes("company")) mappedKey = "company";
    else if (normalized.includes("role") || normalized.includes("title")) mappedKey = "role";
    else if (normalized.includes("name")) mappedKey = "name";

    const value = values[mappedKey] ?? values[key] ?? values[key.toLowerCase()];
    return value ?? match;
  };

  return template
    .replace(/\{\{\s*([^}]+?)\s*\}\}/g, replaceKey)
    .replace(/\{\s*([^}]+?)\s*\}/g, replaceKey)
    .replace(/\(\s*([^)]+?)\s*\)/g, replaceKey)
    .replace(/\[\s*([^\]]+?)\s*\]/g, replaceKey);
}
