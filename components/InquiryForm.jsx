"use client";

import { useEffect, useMemo, useState } from "react";

const whatsappNumber = "6285190907967";

const productGroups = {
  fresh: [
    {
      label: "Fresh Vegetables",
      products: [
        "Cabbage / Kol / Kubis",
        "Lettuce / Selada",
        "Water Spinach / Kangkung",
        "Carrot / Wortel",
        "Sweet Corn / Jagung Manis",
        "Mustard Greens / Sawi Hijau",
        "Potato / Kentang",
        "Garlic / Bawang Putih",
        "Shallot / Bawang Merah",
        "Tomato / Tomat",
        "Cassava / Singkong",
        "Green Onion / Daun Bawang",
        "Red Chili Pepper / Cabai Merah",
        "Cucumber / Timun",
        "Bird's Eye Chili / Cabai Rawit",
        "Pak Choi / Pakcoy",
        "Yardlong Beans / Kacang Panjang",
        "Aubergine / Terong",
        "Bitter Gourd / Pare",
        "Spinach / Bayam",
        "Lemon Basil / Kemangi"
      ]
    },
    {
      label: "Eggs",
      products: ["Horn Chicken Eggs", "Kampung Chicken Eggs", "Duck Eggs", "Quail Eggs"]
    },
    {
      label: "Rice",
      products: ["Premium Rice 5 kg", "Premium Rice 10 kg", "Premium Rice 25 kg", "Premium Rice 50 kg"]
    }
  ],
  green: [
    {
      label: "Eco Energy",
      products: [
        "Coconut Shell Charcoal / Arang Batok Kelapa",
        "Charcoal Briquette / Arang Briket",
        "Wood Pellet"
      ]
    }
  ],
  prime: [
    {
      label: "Premium Spices",
      products: [
        "Vanilla / Vanili",
        "Cinnamon / Kayu Manis",
        "Nutmeg / Pala",
        "Cloves / Cengkeh",
        "Black Pepper / Lada Hitam",
        "White Pepper / Lada Putih",
        "Turmeric / Kunyit",
        "Ginger / Jahe",
        "Galangal / Lengkuas",
        "Coriander Seed / Ketumbar",
        "Lemongrass / Serai",
        "Tamarind / Asam Jawa",
        "Kaffir Lime Leaf / Daun Jeruk",
        "Patchouli / Nilam"
      ]
    }
  ]
};

const divisions = [
  { id: "fresh", title: "Garda Fresh", icon: "LF", text: "Food supply and daily essentials" },
  { id: "green", title: "Garda Green", icon: "EG", text: "Eco energy commodities" },
  { id: "prime", title: "Garda Prime", icon: "GP", text: "Premium Indonesian spices" }
];

const formLabels = {
  en: {
    badge: "GLOBAL TRADE CONNECT",
    headline: "SEND YOUR COMMODITY INQUIRY TO GSN",
    description:
      "Share your product requirements with Garda Samudra Nusantara and our trading team will review your inquiry for quotation follow-up.",
    customer: "Customer Information",
    division: "Choose Division",
    products: "Product Inquiry",
    details: "Order Details",
    optionalDetails: "Add packaging, specification, and target price",
    hideOptionalDetails: "Hide additional details",
    message: "Additional Message",
    agreement: "I agree that Garda Samudra Nusantara may contact me regarding this inquiry.",
    submit: "SEND INQUIRY",
    sending: "SENDING...",
    whatsapp: "CONTACT VIA WHATSAPP",
    messagePlaceholder: "Write your detailed inquiry for Garda Samudra Nusantara..."
  },
  id: {
    badge: "GLOBAL TRADE CONNECT",
    headline: "KIRIM INQUIRY KOMODITAS ANDA KE GSN",
    description:
      "Bagikan kebutuhan produk Anda kepada Garda Samudra Nusantara dan tim kami akan meninjau inquiry Anda untuk follow-up quotation.",
    customer: "Informasi Pelanggan",
    division: "Pilih Divisi",
    products: "Inquiry Produk",
    details: "Detail Pesanan",
    optionalDetails: "Tambah packaging, spesifikasi, dan target price",
    hideOptionalDetails: "Sembunyikan detail tambahan",
    message: "Pesan Tambahan",
    agreement: "Saya setuju Garda Samudra Nusantara dapat menghubungi saya mengenai inquiry ini.",
    submit: "KIRIM INQUIRY",
    sending: "MENGIRIM...",
    whatsapp: "KONTAK VIA WHATSAPP",
    messagePlaceholder: "Tulis inquiry detail Anda untuk Garda Samudra Nusantara..."
  }
};

const emptyForm = {
  fullName: "",
  companyName: "",
  email: "",
  whatsapp: "",
  country: "",
  city: "",
  quantity: "",
  monthlyRequirement: "",
  packagingRequest: "",
  productSpecification: "",
  targetPrice: "",
  message: "",
  agreement: false
};

function createWhatsappText(form, selectedDivision, selectedProducts) {
  const divisionName = divisions.find((division) => division.id === selectedDivision)?.title || "GSN";

  return [
    "Hello Garda Samudra Nusantara, I would like to send an inquiry.",
    "",
    `Name: ${form.fullName || "-"}`,
    `Company: ${form.companyName || "-"}`,
    `Email: ${form.email || "-"}`,
    `WhatsApp: ${form.whatsapp || "-"}`,
    `Location: ${[form.city, form.country].filter(Boolean).join(", ") || "-"}`,
    `Division: ${divisionName}`,
    `Products: ${selectedProducts.length ? selectedProducts.join(", ") : "-"}`,
    `Quantity: ${form.quantity || "-"}`,
    `Monthly Requirement: ${form.monthlyRequirement || "-"}`,
    `Packaging Request: ${form.packagingRequest || "-"}`,
    `Specification: ${form.productSpecification || "-"}`,
    `Target Price: ${form.targetPrice || "-"}`,
    "",
    form.message || "-"
  ].join("\n");
}

function normalizeSmartProducts(divisionId, selectedProducts = []) {
  const availableProducts = (productGroups[divisionId] || []).flatMap((group) => group.products);

  return selectedProducts.map((product) => {
    const exactMatch = availableProducts.find((item) => item === product);
    if (exactMatch) {
      return exactMatch;
    }

    return availableProducts.find((item) => item.toLowerCase().startsWith(product.toLowerCase())) || product;
  });
}

export default function InquiryForm() {
  const [selectedDivision, setSelectedDivision] = useState("fresh");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");
  const [language, setLanguage] = useState("en");
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  const activeGroups = productGroups[selectedDivision];
  const whatsappHref = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(createWhatsappText(form, selectedDivision, selectedProducts))}`,
    [form, selectedDivision, selectedProducts]
  );

  function applySmartInquiry(detail) {
    if (!productGroups[detail.divisionId]) {
      return;
    }

    window.__gsnSmartInquiryApplied = true;
    setSelectedDivision(detail.divisionId);
    setSelectedProducts(normalizeSmartProducts(detail.divisionId, Array.isArray(detail.selectedProducts) ? detail.selectedProducts : []));
    setForm((current) => ({
      ...current,
      quantity: detail.quantity || current.quantity,
      packagingRequest: detail.packagingRequest || current.packagingRequest,
      productSpecification: detail.productSpecification || current.productSpecification,
      message: detail.message || current.message
    }));
  }

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("gsn-language");
    if (savedLanguage === "id" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    function handleLanguage(event) {
      if (event.detail === "id" || event.detail === "en") {
        setLanguage(event.detail);
      }
    }

    function handleSelectDivision(event) {
      if (window.__gsnSmartInquiryApplied) {
        window.__gsnSmartInquiryApplied = false;
        return;
      }

      if (productGroups[event.detail]) {
        chooseDivision(event.detail);
      }
    }

    function handleSmartInquiry(event) {
      applySmartInquiry(event.detail || {});
    }

    const storedSmartInquiry = window.sessionStorage.getItem("gsn-smart-inquiry");
    if (storedSmartInquiry) {
      try {
        applySmartInquiry(JSON.parse(storedSmartInquiry));
        window.sessionStorage.removeItem("gsn-smart-inquiry");
      } catch {
        window.sessionStorage.removeItem("gsn-smart-inquiry");
      }
    }

    window.addEventListener("gsn:language", handleLanguage);
    window.addEventListener("gsn:selectDivision", handleSelectDivision);
    window.addEventListener("gsn:smartInquiry", handleSmartInquiry);
    return () => {
      window.removeEventListener("gsn:language", handleLanguage);
      window.removeEventListener("gsn:selectDivision", handleSelectDivision);
      window.removeEventListener("gsn:smartInquiry", handleSmartInquiry);
    };
  }, []);

  const text = formLabels[language];

  function updateField(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function chooseDivision(divisionId) {
    setSelectedDivision(divisionId);
    setSelectedProducts([]);
  }

  function toggleProduct(product) {
    setSelectedProducts((current) =>
      current.includes(product)
        ? current.filter((item) => item !== product)
        : [...current, product]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setNotice("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          selectedDivision,
          selectedProducts
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send inquiry.");
      }

      setStatus("success");
      setNotice("INQUIRY SENT SUCCESSFULLY");
      setForm(emptyForm);
      setSelectedProducts([]);
      window.setTimeout(() => setStatus("idle"), 3600);
    } catch (error) {
      setStatus("error");
      setNotice(error.message);
    }
  }

  return (
    <section className="gsn-form-neo-section" id="gsnformneo" aria-labelledby="gsnformneo-title">
      <div className="gsn-form-orbit" aria-hidden="true">
        {Array.from({ length: 34 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--i": index + 1,
              left: `${(index * 29) % 100}%`,
              top: `${(index * 43) % 100}%`
            }}
          ></span>
        ))}
      </div>
      <div className="gsn-form-grid">
        <form className="gsn-inquiry-card" onSubmit={handleSubmit}>
          <div className="gsn-form-heading">
            <p className="neo-badge">{text.badge}</p>
            <h2 id="gsnformneo-title">{text.headline}</h2>
            <strong>QUALITY - RELIABILITY - CONSISTENCY</strong>
            <p>{text.description}</p>
          </div>

          <fieldset className="neo-fieldset">
            <legend>{text.customer}</legend>
            <div className="neo-input-grid">
              <label>
                <span>Full Name</span>
                <input name="fullName" value={form.fullName} onChange={updateField} required />
              </label>
              <label>
                <span>WhatsApp Number</span>
                <input name="whatsapp" value={form.whatsapp} onChange={updateField} required />
              </label>
              <label>
                <span>Destination Country</span>
                <input name="country" value={form.country} onChange={updateField} required />
              </label>
            </div>
          </fieldset>

          <fieldset className="neo-fieldset">
            <legend>{text.division}</legend>
            <div className="neo-division-grid">
              {divisions.map((division) => (
                <button
                  className={selectedDivision === division.id ? "is-active" : ""}
                  key={division.id}
                  onClick={() => chooseDivision(division.id)}
                  type="button"
                >
                  <span>{division.icon}</span>
                  <strong>{division.title}</strong>
                  <small>{division.text}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="neo-fieldset">
            <legend>{text.products}</legend>
            <div className="neo-product-groups">
              {activeGroups.map((group) => (
                <div className="neo-product-group" key={group.label}>
                  <h3>{group.label}</h3>
                  <div className="neo-product-grid">
                    {group.products.map((product) => (
                      <label className={selectedProducts.includes(product) ? "is-checked" : ""} key={product}>
                        <input
                          checked={selectedProducts.includes(product)}
                          onChange={() => toggleProduct(product)}
                          type="checkbox"
                        />
                        <span>{product}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="neo-fieldset">
            <legend>{text.details}</legend>
            <div className="neo-input-grid">
              <label>
                <span>Quantity</span>
                <input name="quantity" value={form.quantity} onChange={updateField} />
              </label>
              <label>
                <span>Monthly Requirement</span>
                <input name="monthlyRequirement" value={form.monthlyRequirement} onChange={updateField} />
              </label>
            </div>
          </fieldset>

          <button
            className="neo-details-toggle"
            type="button"
            onClick={() => setShowAdvancedDetails((current) => !current)}
          >
            {showAdvancedDetails ? text.hideOptionalDetails : text.optionalDetails}
          </button>

          {showAdvancedDetails ? (
            <div className="neo-advanced-details">
              <div className="neo-input-grid">
                <label>
                  <span>Company Name</span>
                  <input name="companyName" value={form.companyName} onChange={updateField} />
                </label>
                <label>
                  <span>Email Address (Optional)</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} />
                </label>
                <label>
                  <span>City / Port</span>
                  <input name="city" value={form.city} onChange={updateField} />
                </label>
                <label>
                  <span>Packaging Request</span>
                  <textarea name="packagingRequest" value={form.packagingRequest} onChange={updateField}></textarea>
                </label>
                <label>
                  <span>Product Specification</span>
                  <textarea name="productSpecification" value={form.productSpecification} onChange={updateField}></textarea>
                </label>
                <label>
                  <span>Target Price (Optional)</span>
                  <input name="targetPrice" value={form.targetPrice} onChange={updateField} />
                </label>
              </div>

              <label className="neo-message-field">
                <span>{text.message}</span>
                <textarea
                  name="message"
                  onChange={updateField}
                  placeholder={text.messagePlaceholder}
                  value={form.message}
                ></textarea>
              </label>
            </div>
          ) : null}

          <label className="neo-agreement">
            <input
              checked={form.agreement}
              name="agreement"
              onChange={updateField}
              required
              type="checkbox"
            />
            <span>{text.agreement}</span>
          </label>

          <div className="neo-actions">
            <button className="neo-submit" disabled={status === "loading"} type="submit">
              {status === "loading" ? text.sending : text.submit}
            </button>
            <a className="neo-whatsapp" href={whatsappHref} rel="noreferrer" target="_blank">
              {text.whatsapp}
            </a>
          </div>

          {notice ? (
            <div className={`neo-status neo-status-${status}`} role="status">
              {notice}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
