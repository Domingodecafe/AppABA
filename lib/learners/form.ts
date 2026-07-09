export function parseLearnerForm(formData: FormData) {
  return {
    name: requiredString(formData, "name"),
    birthDate: nullableDate(formData.get("birthDate")),
    supportLevel: requiredString(formData, "supportLevel"),
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

function nullableDate(value: FormDataEntryValue | null): Date | null {
  const date = optionalString(value);

  if (!date) {
    return null;
  }

  return new Date(`${date}T00:00:00`);
}
