import { requireAdminPermission } from "@/lib/adminAuth";
import { getSupabaseStorageConfig, isSupabaseConfigured } from "@/lib/gsnDataStore";

const bucketName = "finance-documents";

async function getBucket(supabaseUrl, supabaseServiceKey) {
  return fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      apikey: supabaseServiceKey
    }
  });
}

async function createBucket(supabaseUrl, supabaseServiceKey) {
  return fetch(`${supabaseUrl}/storage/v1/bucket`, {
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
      file_size_limit: 10485760,
      allowed_mime_types: [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ]
    })
  });
}

function bucketResponse(bucket) {
  return {
    ok: true,
    ready: true,
    bucket: bucketName,
    isPublic: Boolean(bucket.public),
    message: bucket.public
      ? "Finance document storage is ready and public URLs can be opened."
      : "Finance document storage exists. If dashboard links cannot open, make the bucket public or add read policies."
  };
}

async function requireStoragePermission(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return { error: Response.json({ message: permission.message }, { status: permission.status }) };
  }

  if (!isSupabaseConfigured()) {
    return { error: Response.json({ ok: false, ready: false, message: "Supabase is not configured yet." }, { status: 500 }) };
  }

  const { supabaseUrl, supabaseServiceKey } = getSupabaseStorageConfig();
  return { permission, supabaseUrl, supabaseServiceKey };
}

export async function GET(request) {
  const context = await requireStoragePermission(request);
  if (context.error) {
    return context.error;
  }

  const response = await getBucket(context.supabaseUrl, context.supabaseServiceKey);

  if (!response.ok) {
    return Response.json({
      ok: true,
      ready: false,
      bucket: bucketName,
      message: "Bucket finance-documents was not found. Create it in Supabase Storage before using finance uploads in production."
    });
  }

  const bucket = await response.json();
  return Response.json(bucketResponse(bucket));
}

export async function POST(request) {
  const context = await requireStoragePermission(request);
  if (context.error) {
    return context.error;
  }

  const existing = await getBucket(context.supabaseUrl, context.supabaseServiceKey);
  if (existing.ok) {
    const bucket = await existing.json();
    return Response.json(bucketResponse(bucket));
  }

  const created = await createBucket(context.supabaseUrl, context.supabaseServiceKey);
  if (!created.ok) {
    const message = await created.text();
    return Response.json(
      {
        ok: false,
        ready: false,
        bucket: bucketName,
        message: message || "Unable to create finance-documents bucket from dashboard. Create it manually in Supabase Storage."
      },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    ready: true,
    bucket: bucketName,
    isPublic: true,
    message: "Bucket finance-documents has been created and is ready for finance uploads."
  });
}
