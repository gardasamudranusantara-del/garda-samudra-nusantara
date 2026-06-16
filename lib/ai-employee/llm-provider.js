const ACTIVE_PROVIDER = "gemini";
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function geminiToolsFromDefinitions(tools) {
  return [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }))
    }
  ];
}

function geminiContentsFromMessages(messages) {
  const contents = [];

  messages.forEach((message) => {
    if (message.role === "user") {
      contents.push({ role: "user", parts: [{ text: message.content }] });
      return;
    }

    if (message.role === "assistant") {
      const parts = [];
      if (message.content) {
        parts.push({ text: message.content });
      }
      (message.toolCalls || []).forEach((toolCall) => {
        parts.push({
          functionCall: {
            name: toolCall.name,
            args: toolCall.arguments || {}
          }
        });
      });
      contents.push({ role: "model", parts });
      return;
    }

    if (message.role === "tool") {
      const parts = (message.toolResults || []).map((toolResult) => ({
        functionResponse: {
          name: toolResult.name,
          response: { result: toolResult.result }
        }
      }));
      contents.push({ role: "user", parts });
    }
  });

  return contents;
}

export async function callGemini(messages, tools, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diset di environment.");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: geminiContentsFromMessages(messages),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      tools: tools.length ? geminiToolsFromDefinitions(tools) : undefined,
      generationConfig: { temperature: 0.2 }
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      return {
        text: "Jarvis sedang mencapai batas kuota sementara. Coba lagi beberapa menit ya.",
        toolCalls: []
      };
    }

    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const toolCalls = [];
  let text = "";

  parts.forEach((part) => {
    if (part.text) {
      text += part.text;
    }
    if (part.functionCall) {
      toolCalls.push({
        id: `${part.functionCall.name}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: part.functionCall.name,
        arguments: part.functionCall.args || {}
      });
    }
  });

  return { text, toolCalls };
}

export async function callLLM(messages, tools, systemPrompt) {
  if (ACTIVE_PROVIDER === "gemini") {
    return callGemini(messages, tools, systemPrompt);
  }

  throw new Error("Provider AI belum tersedia.");
}
