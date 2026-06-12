import { getAuthorizedAdmin, requireAdminPermission } from "@/lib/adminAuth";
import { deleteAttendanceRecord, getAttendanceRecord, insertAdminActivity, listAttendanceRecords, updateAttendanceRecord, upsertAttendanceRecord } from "@/lib/gsnDataStore";

function cleanAttendancePayload(data = {}) {
  return {
    attendance_date: String(data.attendance_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    status: String(data.status || "Present").slice(0, 40),
    work_mode: String(data.work_mode || "Office").slice(0, 40),
    location: String(data.location || "").slice(0, 180),
    notes: String(data.notes || "").slice(0, 400)
  };
}

export async function GET(request) {
  const admin = await getAuthorizedAdmin(request);
  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const records = await listAttendanceRecords();
  return Response.json({ records });
}

export async function POST(request) {
  const admin = await getAuthorizedAdmin(request);
  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const action = data.action === "check_out" ? "check_out" : "check_in";
  const now = new Date().toISOString();
  const payload = cleanAttendancePayload(data);
  const existingRecords = await listAttendanceRecords();
  const existingToday = existingRecords.find((record) => (
    record.username === admin.username &&
    String(record.attendance_date || "").slice(0, 10) === payload.attendance_date
  ));
  const result = await upsertAttendanceRecord({
    ...payload,
    username: admin.username,
    role: admin.role,
    check_in_at: action === "check_in" ? now : existingToday?.check_in_at || null,
    check_out_at: action === "check_out" ? now : existingToday?.check_out_at || null
  });

  await insertAdminActivity({
    admin,
    action: action === "check_in" ? "attendance_check_in" : "attendance_check_out",
    label: `${admin.username} ${action === "check_in" ? "checked in" : "checked out"}`,
    referenceType: "attendance",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: result?.[0] || null
    }
  });

  return Response.json({ ok: true, record: result?.[0] || null });
}

export async function PATCH(request) {
  const permission = await requireAdminPermission(request, "settings");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const id = String(data.id || "");
  if (!id) {
    return Response.json({ message: "Attendance record id is required." }, { status: 400 });
  }

  const before = await getAttendanceRecord(id);
  const updates = cleanAttendancePayload(data);
  const result = await updateAttendanceRecord(id, {
    ...updates,
    check_in_at: data.check_in_at || before?.check_in_at || null,
    check_out_at: data.check_out_at || before?.check_out_at || null
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "update_attendance",
    label: `Updated attendance for ${before?.username || "admin user"}`,
    referenceType: "attendance",
    referenceId: id,
    metadata: {
      before,
      after: result?.[0] || null
    }
  });

  return Response.json({ ok: true, record: result?.[0] || null });
}

export async function DELETE(request) {
  const permission = await requireAdminPermission(request, "settings");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ message: "Attendance record id is required." }, { status: 400 });
  }

  const before = await getAttendanceRecord(id);
  const result = await deleteAttendanceRecord(id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_attendance",
    label: `Deleted attendance for ${before?.username || "admin user"}`,
    referenceType: "attendance",
    referenceId: id,
    metadata: {
      before,
      after: null
    }
  });

  return Response.json({ ok: true, result });
}
