import { insertTrackingEvent } from "@/lib/gsnDataStore";

export async function POST(request) {
  try {
    const data = await request.json();
    const event = {
      event: String(data.event || "unknown").slice(0, 80),
      label: String(data.label || "").slice(0, 120),
      path: String(data.path || "").slice(0, 200),
      ts: new Date().toISOString()
    };

    console.info("[GSN_TRACK]", JSON.stringify(event));
    await insertTrackingEvent({
      ...event,
      source: data.source,
      metadata: data.metadata
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
