import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const TENANT_DOCUMENT_BUCKET = "tenant-documents";
export const MAX_TENANT_DOCUMENT_SIZE_BYTES = 30 * 1024 * 1024;

const mimeTypesByExtension = new Map([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".zip", "application/zip"]
]);

export type TenantDocumentUploadInput = {
  tenantId: string;
  clientId: string;
  caseId: string;
  file: File;
  documentType: string;
  category: string;
  summary: string;
  tags?: readonly string[];
  actions?: readonly string[];
  supabaseClient?: SupabaseClient;
};

export type TenantDocumentUploadResult = {
  documentId: string;
  storagePath: string;
  uploadedAt: string;
};

function slugifyFileName(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const extension = lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
  const baseName = lastDotIndex >= 0 ? fileName.slice(0, lastDotIndex) : fileName;
  const base = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${base || "documento"}${extension}`;
}

function inferMimeType(file: File) {
  if (file.type) {
    return file.type;
  }

  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";

  return mimeTypesByExtension.get(extension) ?? "application/octet-stream";
}

export async function uploadTenantDocument(
  input: TenantDocumentUploadInput
): Promise<TenantDocumentUploadResult> {
  if (!(input.file instanceof File) || input.file.size === 0) {
    throw new Error("Selecione um arquivo valido antes de continuar.");
  }

  if (input.file.size > MAX_TENANT_DOCUMENT_SIZE_BYTES) {
    throw new Error("O arquivo selecionado excede o limite de 30 MB.");
  }

  const supabase = input.supabaseClient ?? getSupabaseServerClient();
  const documentId = `doc-${randomUUID()}`;
  const storedFileName = slugifyFileName(input.file.name);
  const storagePath = `${input.tenantId}/${input.clientId}/${input.caseId}/${documentId}/${storedFileName}`;
  const mimeType = inferMimeType(input.file);
  const uploadedAt = new Date().toISOString().slice(0, 10);
  const fileBuffer = Buffer.from(await input.file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(TENANT_DOCUMENT_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Falha ao enviar arquivo para o storage: ${uploadError.message}`);
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    tenant_id: input.tenantId,
    client_id: input.clientId,
    case_id: input.caseId,
    file_name: input.file.name,
    original_file_name: input.file.name,
    document_type: input.documentType,
    category: input.category,
    tags: input.tags ?? [],
    ai_status: "not_analyzed",
    summary: input.summary,
    page_count: 0,
    uploaded_at: uploadedAt,
    preview_label: "Aguardando leitura OCR e revisao humana.",
    storage_bucket: TENANT_DOCUMENT_BUCKET,
    storage_path: storagePath,
    storage_mime_type: mimeType,
    storage_size_bytes: input.file.size,
    actions: input.actions ?? ["Ler com OCR", "Classificar documento", "Acionar Clara"]
  });

  if (insertError) {
    await supabase.storage.from(TENANT_DOCUMENT_BUCKET).remove([storagePath]);
    throw new Error(`Falha ao registrar metadados do documento: ${insertError.message}`);
  }

  return {
    documentId,
    storagePath,
    uploadedAt
  };
}
