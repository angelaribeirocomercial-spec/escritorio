const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const BUCKET = "tenant-documents";

const mimeTypes = new Map([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".zip", "application/zip"]
]);

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function requireArg(args, key) {
  const value = args[key];

  if (!value) {
    throw new Error(`Missing required argument --${key}`);
  }

  return value;
}

function slugifyFileName(fileName) {
  const parsed = path.parse(fileName);
  const base = parsed.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${base || "documento"}${parsed.ext.toLowerCase()}`;
}

function getSupabaseAdminClient() {
  loadLocalEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Configure SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY, before running documents:upload."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function uploadDocument() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(requireArg(args, "file"));
  const tenantId = requireArg(args, "tenant-id");
  const clientId = requireArg(args, "client-id");
  const caseId = requireArg(args, "case-id");
  const documentType = requireArg(args, "document-type");
  const category = requireArg(args, "category");

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stat = fs.statSync(filePath);

  if (!stat.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }

  const originalFileName = path.basename(filePath);
  const storedFileName = slugifyFileName(args["file-name"] || originalFileName);
  const documentId = args["document-id"] || `doc-${crypto.randomUUID()}`;
  const uploadedAt = new Date().toISOString().slice(0, 10);
  const storagePath = `${tenantId}/${clientId}/${caseId}/${documentId}/${storedFileName}`;
  const mimeType =
    args["mime-type"] ||
    mimeTypes.get(path.extname(originalFileName).toLowerCase()) ||
    "application/octet-stream";
  const tags = args.tags ? args.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
  const pageCount = Number.parseInt(args["page-count"] || "0", 10);

  if (Number.isNaN(pageCount) || pageCount < 0) {
    throw new Error("--page-count must be a non-negative integer.");
  }

  const supabase = getSupabaseAdminClient();
  const fileBuffer = fs.readFileSync(filePath);
  const {
    data: existingBuckets,
    error: listBucketsError
  } = await supabase.storage.listBuckets();

  if (listBucketsError) {
    throw new Error(`Failed to inspect storage buckets: ${listBucketsError.message}`);
  }

  if (!existingBuckets?.some((bucket) => bucket.name === BUCKET || bucket.id === BUCKET)) {
    const { error: createBucketError } = await supabase.storage.createBucket(BUCKET, {
      public: false
    });

    if (createBucketError) {
      throw new Error(`Failed to create storage bucket: ${createBucketError.message}`);
    }
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    tenant_id: tenantId,
    client_id: clientId,
    case_id: caseId,
    file_name: args["file-name"] || originalFileName,
    original_file_name: originalFileName,
    document_type: documentType,
    category,
    tags,
    ai_status: "not_analyzed",
    summary: args.summary || "Documento enviado por CLI e aguardando processamento.",
    page_count: pageCount,
    uploaded_at: uploadedAt,
    preview_label: "Preview pendente de processamento.",
    storage_bucket: BUCKET,
    storage_path: storagePath,
    storage_mime_type: mimeType,
    storage_size_bytes: stat.size,
    actions: ["Classificar documento", "Vincular ao fluxo da Clara"]
  });

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Failed to register document metadata: ${insertError.message}`);
  }

  console.log(
    JSON.stringify(
      {
        documentId,
        bucket: BUCKET,
        path: storagePath,
        sizeBytes: stat.size,
        mimeType
      },
      null,
      2
    )
  );
}

uploadDocument().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
