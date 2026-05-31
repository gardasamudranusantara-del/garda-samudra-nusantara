import { insertInquiry } from "@/lib/gsnDataStore";

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
        fullName: "NusaBot Visitor",
        companyName: "",
        email: "",
        whatsapp: "",
        country: "",
        city: "",
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

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ message: error.message || "Unable to save NusaBot lead." }, { status: 500 });
  }
}
