import { NextResponse } from "next/server";
import { isSupabaseConfigured, listInquiries } from "@/lib/gsnDataStore";

const productKnowledge = `
Company:
- Garda Samudra Nusantara (GSN) is an Indonesian international trading, distribution, and export-oriented commodity company based in Gresik, Indonesia.
- Brand values: Quality, Reliability, Consistency.
- Divisions: Garda Fresh, Garda Green, Garda Prime.
- Contact: WhatsApp +62 851-9090-7967, email gardasamudranusantara@gmail.com, Instagram @gsn.corp.

Vision:
- To become a trusted Indonesian trading and export partner that connects high-quality Indonesian commodities with global markets through quality, reliability, and consistency.

Mission:
- Provide dependable commodity supply.
- Build long-term international partnerships.
- Support Indonesian producers and local commodities.
- Serve buyers with responsive quotation and export assistance.
- Develop modern, sustainable, export-ready trading operations.

Garda Fresh:
- Fresh vegetables: cabbage/kol/kubis, lettuce/selada, water spinach/kangkung, carrot/wortel, sweet corn/jagung manis, mustard greens/sawi hijau, potato/kentang, garlic/bawang putih, shallot/bawang merah, tomato/tomat, cassava/singkong, green onion/daun bawang, red chili pepper/cabai merah, cucumber/timun, bird's eye chili/cabai rawit, pak choi/pakcoy, yardlong beans/kacang panjang, aubergine/terong, bitter gourd/pare, spinach/bayam, lemon basil/kemangi.
- Eggs: horn chicken eggs, kampung chicken eggs, duck eggs, quail eggs.
- Rice: premium rice 5 kg, 10 kg, 25 kg, 50 kg.
- Buyer fit: retailers, hotels, restaurants, catering, food service, distributors, daily supply and recurring procurement.

Garda Green:
- Coconut shell charcoal / arang batok kelapa: natural coconut-shell-based charcoal for BBQ, shisha, retail charcoal, industrial use, and export-oriented supply depending on specification.
- Charcoal briquette / arang briket: formed charcoal for stable burning, easier handling, consistent size, BBQ, shisha, retail, hospitality, and export packaging needs.
- Wood pellet: renewable biomass fuel from compressed wood material such as sawdust or wood residue; used for industrial heating, biomass boilers, power generation, and cleaner alternative energy programs.
- Buyer fit: biomass fuel buyers, BBQ and shisha importers, industrial energy users, retail charcoal distributors, sustainability-oriented energy procurement.

Garda Prime:
- Vanilla/vanili: premium aromatic spice for bakery, desserts, beverages, flavoring, fragrance.
- Cinnamon/kayu manis: aromatic bark spice for bakery, beverages, spice blends, herbal and food manufacturing.
- Nutmeg/pala: warm Indonesian spice for seasoning, bakery, beverages, sauces, spice trading.
- Cloves/cengkeh: aromatic flower buds for spice blends, beverages, food manufacturing, herbal products, fragrance-related industries.
- Black pepper/lada hitam: high-demand seasoning for food service, manufacturing, retail, and spice trading.
- White pepper/lada putih: clean spicy flavor for sauces, soups, seasoning blends, light-colored food applications.
- Turmeric/kunyit: yellow rhizome spice for curry, seasoning, herbal drinks, natural color, wellness-related products.
- Ginger/jahe: warm rhizome for beverages, herbal products, seasoning, bakery, and food manufacturing.
- Galangal/lengkuas: aromatic rhizome for Southeast Asian cuisine, spice pastes, soups, sauces.
- Coriander seed/ketumbar: warm citrus-like seed for spice blends, sauces, seasoning, processed food.
- Lemongrass/serai: citrus aromatic herb for tea, beverages, soups, sauces, seasoning, wellness products.
- Tamarind/asam jawa: sour fruit pulp for sauces, beverages, candies, seasoning, traditional cuisine.
- Kaffir lime leaf/daun jeruk: citrus aromatic leaf for Southeast Asian cuisine, soups, sauces, spice mixes.
- Patchouli/nilam: aromatic commodity for essential oil, fragrance, perfume, cosmetics, aromatic product industries.
- Buyer fit: spice importers, food manufacturers, bakeries, beverage brands, seasoning producers, fragrance and essential-oil buyers.

Commercial guidance:
- For quotation, ask for product, destination country, quantity, monthly requirement, packaging request, target price if any, and product specification.
- Sample requests may be available depending on product availability and destination.
- MOQ, payment terms, shipping time, and documentation depend on product, quantity, destination, and buyer requirement.
- If details are not confirmed, invite the customer to use the inquiry form, WhatsApp, or email.
`;

const instructions = `
You are NusaBot, the AI export assistant for Garda Samudra Nusantara (GSN).
Answer as a professional international trading representative.
Always answer in the same language as the customer's latest message. If the customer asks in Indonesian, answer in Indonesian. If the customer asks in English, answer in English.
Use only the GSN business information below. Do not invent certifications, prices, stock, MOQ, payment terms, lead times, countries served, or legal claims.
When the customer asks about a product, explain what it is, typical buyer use cases, and recommend the most suitable GSN division or product.
Keep responses concise, premium, friendly, and sales-oriented. Ask for destination, quantity, packaging, and specification when useful.
If a question is outside GSN business information, say: "Please contact our team directly for detailed assistance regarding your inquiry."

${productKnowledge}
`;

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const text = output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .map((content) => content.text || content.output_text || "")
    .join(" ")
    .trim();

  return text;
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function extractEmail(value) {
  return String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase() || "";
}

function extractPhone(value) {
  return normalizePhone(String(value || "").match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] || "");
}

function countTop(items, getter, limit = 5) {
  const counts = new Map();
  items.forEach((item) => {
    const values = getter(item);
    (Array.isArray(values) ? values : [values]).filter(Boolean).forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

async function buildSafeCrmContext(message) {
  if (!isSupabaseConfigured()) {
    return "";
  }

  try {
    const inquiries = await listInquiries();
    const topProducts = countTop(inquiries, (lead) => Array.isArray(lead.products) ? lead.products : []);
    const topCountries = countTop(inquiries, (lead) => lead.country);
    const highPriorityOpen = inquiries.filter((lead) => lead.lead_priority === "High" && !["Converted", "Closed"].includes(lead.status)).length;
    const email = extractEmail(message);
    const phone = extractPhone(message);
    const asksStatus = /\b(status|follow[\s-]?up|progress|update|lead|inquiry|quotation|quote|request|statusnya|progres|ditindaklanjuti)\b/i.test(message);
    const matchedLead = asksStatus && (email || phone)
      ? inquiries.find((lead) => {
        const emailMatches = email && String(lead.email || "").toLowerCase() === email;
        const phoneMatches = phone && normalizePhone(lead.whatsapp || lead.phone).endsWith(phone.slice(-9));
        return emailMatches || phoneMatches;
      })
      : null;

    return `
Safe CRM context from GSN dashboard:
- Recent lead count: ${inquiries.length}
- Current high-priority open leads: ${highPriorityOpen}
- Most requested product interests: ${topProducts.map(([name, count]) => `${name} (${count})`).join(", ") || "No product demand data yet"}
- Most common destination countries: ${topCountries.map(([name, count]) => `${name} (${count})`).join(", ") || "No country data yet"}
${matchedLead ? `- Exact matching inquiry found for the provided contact. Safe status: ${matchedLead.status || "New"}; priority: ${matchedLead.lead_priority || "Low"}; assigned owner: ${matchedLead.assigned_to || "GSN team"}; products: ${Array.isArray(matchedLead.products) ? matchedLead.products.join(", ") : "-"}; quantity: ${matchedLead.quantity || "-"}; created: ${matchedLead.created_at || "-"}. Do not reveal internal notes or private data.` : "- No exact contact-based inquiry status should be disclosed unless the customer provides matching email or WhatsApp and asks for status."}
Use dashboard demand trends only for general product recommendations. Do not expose other buyers, internal notes, email addresses, phone numbers, or company names.
`;
  } catch {
    return "";
  }
}

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey || apiKey.startsWith("replace_with_")) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  }

  const { message, history = [] } = await request.json();
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const recentHistory = Array.isArray(history)
    ? history
        .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.text === "string")
        .slice(-8)
        .map((item) => ({ role: item.role, content: item.text.slice(0, 900) }))
    : [];
  const crmContext = await buildSafeCrmContext(trimmedMessage);
  const dynamicInstructions = crmContext ? `${instructions}\n\n${crmContext}` : instructions;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: dynamicInstructions,
      input: [...recentHistory, { role: "user", content: trimmedMessage }],
      max_output_tokens: 420
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "Unable to generate NusaBot response" },
      { status: response.status }
    );
  }

  return NextResponse.json({
    answer:
      extractOutputText(data) ||
      "Please contact our team directly for detailed assistance regarding your inquiry."
  });
}
