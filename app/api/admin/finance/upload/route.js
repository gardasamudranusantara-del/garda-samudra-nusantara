import { requireAdminPermission } from "@/lib/adminAuth";
import { getSupabaseStorageConfig, insertAdminActivity, isSupabaseConfigured } from "@/lib/gsnDataStore";

const bucketName = "finance-documents";
const allowedKinds = new Set(["expense", "payment", "supplier", "tax", "general"]);
const maxFileSize = 10 * 1024 * 1024;

function cleanFileName(name = "finance-document") {
  const safeName = String(name)
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safeName || "finance-document";
}

function cleanKind(kind = "general") {
  return allowedKinds.has(kind) ? kind : "general";
}

async function ensureBucket(supabaseUrl, supabaseServiceKey) {
  const response = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      apikey: supabaseServiceKey
    }
  });

  if (response.ok) {
    return true;
  }

  const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      apikey: supabaseServiceKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: bucketName,
      name: bucketName,
      public: true,
      file_size_limit: maxFileSize
    })
  });

  return createResponse.ok;
}

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ message: "Supabase is not configured yet." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = cleanKind(String(formData.get("kind") || "general"));

  if (!file || typeof file.arrayBuffer !== "function") {
    return Response.json({ message: "Please choose a document to upload." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return Response.json({ message: "Maximum upload size is 10 MB." }, { status: 400 });
  }

  const { supabaseUrl, supabaseServiceKey } = getSupabaseStorageConfig();
  await ensureBucket(supabaseUrl, supabaseServiceKey);

  const today = new Date().toISOString().slice(0, 10);
  const objectPath = `finance/${kind}/${today}/${Date.now()}-${cleanFileName(file.name)}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${objectPath}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: await file.arrayBuffer()
  });

  if (!uploadResponse.ok) {
    const message = await uploadResponse.text();
    return Response.json(
      {
        message: message || "Upload failed. Make sure the Supabase Storage bucket finance-documents exists."
      },
      { status: 500 }
    );
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`;

  await insertAdminActivity({
    admin: permission.admin,
    action: "upload_finance_attachment",
    label: `Uploaded ${kind} attachment ${file.name}`,
    referenceType: "finance_attachment",
    referenceId: objectPath,
    metadata: {
      after: {
        kind,
        file_name: file.name || "",
        file_size: file.size || 0,
        file_type: file.type || "",
        url: publicUrl
      }
    }
  });

  return Response.json({
    ok: true,
    bucket: bucketName,
    path: objectPath,
    url: publicUrl
  });
}
