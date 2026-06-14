import { getAuthorizedAdmin } from "@/lib/adminAuth";
import { insertAiAuditLog } from "@/lib/gsnDataStore";
import { callLLM } from "@/lib/ai-employee/llm-provider";
import { getToolByName, getToolsForRole } from "@/lib/ai-employee/tools";
import { buildSystemPrompt } from "@/lib/ai-employee/system-prompts";

function mapAdminRoleToAiRole(role) {
  if (["ceo", "cso", "owner"].includes(role)) return "direksi";
  if (role === "hr") return "sdm";
  if (["finance", "marketing", "procurement"].includes(role)) return role;
  return "staff";
}

function getBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

async function getUserFromRequest(request) {
  let admin = await getAuthorizedAdmin(request);
  let userToken = request.headers.get("x-admin-session") || "";

  if (!admin) {
    const bearer = getBearerToken(request);
    if (bearer) {
      const headers = new Headers(request.headers);
      headers.set("x-admin-session", bearer);
      admin = await getAuthorizedAdmin(new Request(request.url, { headers }));
      userToken = bearer;
    }
  }

  if (!admin) {
    return null;
  }

  return {
    userId: admin.username,
    username: admin.username,
    adminRole: admin.role,
    role: mapAdminRoleToAiRole(admin.role),
    userToken,
    baseUrl: request.url
  };
}

async function logAudit(entry) {
  try {
    await insertAiAuditLog({
      admin_username: entry.username || entry.userId,
      user_role: entry.role,
      tool_name: entry.toolName,
      input_params: entry.input,
      output_result: entry.output,
      status: entry.status
    });
  } catch (error) {
    console.error("[AI_EMPLOYEE_AUDIT_ERROR]", error);
  }
}

function summarizeToolCall(toolCall) {
  if (toolCall.name === "create_expense") {
    const amount = Number(toolCall.arguments?.amount || 0);
    const category = toolCall.arguments?.category || "pengeluaran";
    const description = toolCall.arguments?.description ? ` (${toolCall.arguments.description})` : "";
    return `Mencatat pengeluaran Rp${amount.toLocaleString("id-ID")} untuk ${category}${description}.`;
  }

  if (toolCall.name === "add_prospect") {
    return `Menambahkan prospek baru: ${toolCall.arguments?.companyName || "perusahaan baru"}.`;
  }

  return `Menjalankan aksi ${toolCall.name}.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const ctx = await getUserFromRequest(request);

    if (!ctx) {
      return Response.json({ reply: "Sesi admin tidak valid. Silakan login ulang.", history: [] }, { status: 401 });
    }

    const tools = getToolsForRole(ctx.role);
    const systemPrompt = buildSystemPrompt(ctx.role);
    const history = Array.isArray(body.history) ? body.history : [];

    if (body.pendingAction) {
      const { toolCall, confirmed } = body.pendingAction;
      const tool = getToolByName(toolCall?.name);

      if (!tool) {
        return Response.json({ reply: "Aksi tidak ditemukan atau sudah kedaluwarsa.", history }, { status: 400 });
      }

      if (!tool.allowedRoles.includes(ctx.role)) {
        await logAudit({
          userId: ctx.userId,
          username: ctx.username,
          role: ctx.role,
          toolName: tool.name,
          input: toolCall.arguments,
          output: null,
          status: "denied"
        });
        return Response.json({ reply: "Maaf, role kamu tidak punya izin untuk aksi ini.", history }, { status: 403 });
      }

      if (!confirmed) {
        await logAudit({
          userId: ctx.userId,
          username: ctx.username,
          role: ctx.role,
          toolName: tool.name,
          input: toolCall.arguments,
          output: null,
          status: "cancelled"
        });
        return Response.json({ reply: "Aksi dibatalkan.", history });
      }

      const result = await tool.execute(toolCall.arguments || {}, ctx);
      await logAudit({
        userId: ctx.userId,
        username: ctx.username,
        role: ctx.role,
        toolName: tool.name,
        input: toolCall.arguments,
        output: result,
        status: "executed"
      });

      const updatedHistory = [
        ...history,
        { role: "assistant", content: "", toolCalls: [toolCall] },
        { role: "tool", content: "", toolResults: [{ toolCallId: toolCall.id, name: toolCall.name, result }] }
      ];
      const finalResponse = await callLLM(updatedHistory, tools, systemPrompt);

      return Response.json({
        reply: finalResponse.text || "Selesai, data berhasil diproses.",
        history: [...updatedHistory, { role: "assistant", content: finalResponse.text || "Selesai." }]
      });
    }

    if (!body.message || typeof body.message !== "string") {
      return Response.json({ reply: "Pesan tidak boleh kosong.", history }, { status: 400 });
    }

    const newHistory = [...history, { role: "user", content: body.message }];
    const llmResponse = await callLLM(newHistory, tools, systemPrompt);

    if (!llmResponse.toolCalls.length) {
      return Response.json({
        reply: llmResponse.text,
        history: [...newHistory, { role: "assistant", content: llmResponse.text }]
      });
    }

    const toolCall = llmResponse.toolCalls[0];
    const tool = getToolByName(toolCall.name);

    if (!tool) {
      return Response.json({
        reply: "Aku belum punya tool untuk permintaan itu. Coba gunakan perintah lain yang berkaitan dengan prospek atau finance.",
        history: newHistory
      });
    }

    if (!tool.allowedRoles.includes(ctx.role)) {
      await logAudit({
        userId: ctx.userId,
        username: ctx.username,
        role: ctx.role,
        toolName: tool.name,
        input: toolCall.arguments,
        output: null,
        status: "denied"
      });
      return Response.json({
        reply: "Maaf, role kamu tidak punya izin untuk mengakses data atau aksi tersebut.",
        history: newHistory
      });
    }

    if (tool.isWriteAction) {
      const summary = summarizeToolCall(toolCall);
      await logAudit({
        userId: ctx.userId,
        username: ctx.username,
        role: ctx.role,
        toolName: tool.name,
        input: toolCall.arguments,
        output: null,
        status: "proposed"
      });

      return Response.json({
        reply: `${summary}\n\nKonfirmasi untuk melanjutkan?`,
        history: newHistory,
        pendingAction: { toolCall, summary }
      });
    }

    const result = await tool.execute(toolCall.arguments || {}, ctx);
    await logAudit({
      userId: ctx.userId,
      username: ctx.username,
      role: ctx.role,
      toolName: tool.name,
      input: toolCall.arguments,
      output: result,
      status: "executed"
    });

    const historyWithToolResult = [
      ...newHistory,
      { role: "assistant", content: "", toolCalls: [toolCall] },
      { role: "tool", content: "", toolResults: [{ toolCallId: toolCall.id, name: toolCall.name, result }] }
    ];
    const finalResponse = await callLLM(historyWithToolResult, tools, systemPrompt);

    return Response.json({
      reply: finalResponse.text,
      history: [...historyWithToolResult, { role: "assistant", content: finalResponse.text }]
    });
  } catch (error) {
    console.error("[AI_EMPLOYEE_ERROR]", error);
    return Response.json(
      { reply: error.message || "AI Employee sedang bermasalah.", history: [] },
      { status: 500 }
    );
  }
}
