import { createClient } from "@supabase/supabase-js";

const defaultBucket = "appaba-stimuli";

export function getUploadableStimulusImage(value: FormDataEntryValue | null): File | null {
  if (!(value instanceof File)) {
    return null;
  }

  if (!value.name || value.size === 0 || !value.type.startsWith("image/")) {
    return null;
  }

  return value;
}

export async function uploadStimulusImage(value: FormDataEntryValue | null): Promise<string | null> {
  const file = getUploadableStimulusImage(value);

  if (!file) {
    return null;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? defaultBucket;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase nao configurado para upload de imagens.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });

  const path = `stimuli/${crypto.randomUUID()}${fileExtension(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false
  });

  if (error) {
    throw new Error(`Falha ao enviar imagem para o Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function fileExtension(name: string): string {
  const extension = name.split(".").pop()?.toLowerCase();

  if (!extension || extension === name.toLowerCase()) {
    return "";
  }

  return `.${extension.replace(/[^a-z0-9]/g, "")}`;
}
