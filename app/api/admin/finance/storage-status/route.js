import { requireAdminPermission } from "@/lib/adminAuth";
import { getSupabaseStorageConfig, isSupabaseConfigured } from "@/lib/gsnDataStore";

const bucketName = "finance-documents";

export async function GET(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ ok: false, ready: false, message: "Supabase is not configured yet." }, { status: 500 });
  }

  const { supabaseUrl, supabaseServiceKey } = getSupabaseStorageConfig();
  const response = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      apikey: supabaseServiceKey
    }
  });

  if (!response.ok) {
    return Response.json({
      ok: true,
      ready: false,
      bucket: bucketName,
      message: "Bucket finance-documents was not found. Create it in Supabase Storage before using finance uploads in production."
    });
  }

  const bucket = await response.json();
  return Response.json({
    ok: true,
    ready: true,
    bucket: bucketName,
    isPublic: Boolean(bucket.public),
    message: bucket.public
      ? "Finance document storage is ready and public URLs can be opened."
      : "Finance document storage exists. If dashboard links cannot open, make the bucket public or add read policies."
  });
}
