export function parseStimulusForm(formData: FormData) {
  return {
    name: requiredString(formData, "name"),
    category: nullableString(formData.get("category")),
    className: nullableString(formData.get("className")),
    functionText: nullableString(formData.get("functionText")),
    characteristics: nullableString(formData.get("characteristics")),
    imageUrl: nullableString(formData.get("imageUrl")),
    notes: nullableString(formData.get("notes")),
    active: formData.get("active") !== "inactive"
  };
}

function requiredString(formData: FormData, key: string): string {
  const value = optionalString(formData.get(key));

  if (!value) {
    throw new Error(`Campo obrigatorio ausente: ${key}`);
  }

  return value;
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function nullableString(value: FormDataEntryValue | null): string | null {
  return optionalString(value) ?? null;
}
