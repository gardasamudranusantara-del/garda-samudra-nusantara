import { insertInquiry } from "@/lib/gsnDataStore";
import { notifyOwner } from "@/lib/ownerNotifications";

const divisionNames = {
  fresh: "Garda Fresh",
  green: "Garda Green",
  prime: "Garda Prime"
};

export async function POST(request) {
  try {
    const data = await request.json();
    const products = Array.isArray(data.selectedProducts) ? data.selectedProducts.filter(Boolean) : [];

    if (!products.length && !data.message) {
      return Response.json({ message: "No qualified NusaBot lead data to save." }, { status: 400 });
    }

    const lead = {
      priority: products.length > 1 ? "Medium" : "Low",
      score: products.length ? 45 : 25,
      reasons: "captured from NusaBot product conversation"
    };

    await insertInquiry(
      {
        fullName: data.fullName || "NusaBot Visitor",
        companyName: data.companyName || "",
        email: data.email || "",
        whatsapp: data.whatsapp || "",
        country: data.country || "",
        city: data.city || "",
        selectedDivision: divisionNames[data.divisionId] || "NusaBot",
        selectedProducts: products,
        quantity: data.quantity || "",
        monthlyRequirement: "",
        packagingRequest: data.packagingRequest || "",
        productSpecification: data.productSpecification || "",
        targetPrice: "",
        message: data.message || "NusaBot qualified product conversation.",
        source: "nusabot"
      },
      lead
    );
    await notifyOwner({
      title: "New NusaBot Lead",
      message: "NusaBot captured a qualified product conversation.",
      channels: ["telegram", "whatsapp"],
      lines: [
        `Division: ${divisionNames[data.divisionId] || "NusaBot"}`,
        `Buyer: ${data.fullName || "NusaBot Visitor"}`,
        `Company: ${data.companyName || "-"}`,
        `WhatsApp: ${data.whatsapp || "-"}`,
        `Country: ${data.country || "-"}`,
        `Products: ${products.join(", ") || "-"}`,
        `Summary: ${data.message || "Product conversation"}`
      ]
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ message: error.message || "Unable to save NusaBot lead." }, { status: 500 });
  }
}
