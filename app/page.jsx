"use client";

import { useEffect, useState } from "react";
import {
  brandValues,
  companyProfile,
  contactLinks,
  divisions,
  futureGoals
} from "@/data/company";
import DivisionPage from "@/components/DivisionPage";
import Footer from "@/components/Footer";
import GSNExportAssistant from "@/components/GSNExportAssistant";
import InquiryForm from "@/components/InquiryForm";
import Navbar from "@/components/Navbar";

const projects = [
  "Sourcing network expansion",
  "Export market development",
  "Eco-energy commodity supply",
  "Agricultural supply chain",
  "Global buyer partnership"
];

const primaryContactLabels = ["WhatsApp / Telephone", "Email", "Address", "Alamat"];

const partnershipCards = [
  {
    title: "Investor Opportunities",
    text: "Build scalable Indonesian commodity channels with sourcing, distribution, and long-term market development."
  },
  {
    title: "Business Collaboration",
    text: "Work with GSN for procurement, sourcing, recurring supply, and export-oriented commodity growth."
  },
  {
    title: "Sustainable Growth",
    text: "Support Indonesian products through responsible supply, eco-energy commodities, and reliable trade operations."
  }
];

const aboutCards = [
  {
    value: "3+",
    label: "Integrated Business Divisions",
    action: "divisions"
  },
  {
    value: "Global Partnership",
    label: "Trusted Relationship Worldwide",
    action: "global"
  }
];

const productCards = [
  {
    id: "fresh",
    number: "01",
    title: "Garda Fresh",
    accent: "fresh",
    image: "/images/fresh-division-card.webp",
    description:
      "Supplying selected fresh vegetables, eggs, and premium rice for food service, retail, and recurring procurement.",
    items: ["Fresh vegetables", "Premium rice", "Chicken eggs", "Duck eggs", "Quail eggs"],
    action: "Enter Division"
  },
  {
    id: "green",
    number: "02",
    title: "Garda Green",
    accent: "green",
    image: "/images/garda-green-card.webp",
    description:
      "Providing Indonesian eco-energy commodities for BBQ, shisha, biomass fuel, industrial, and retail buyers.",
    items: ["Coconut shell charcoal", "Charcoal briquette", "Wood pellet"],
    action: "Enter Division"
  },
  {
    id: "prime",
    number: "03",
    title: "Garda Prime",
    accent: "prime",
    image: "/images/prime-card.webp",
    description:
      "Supplying selected Indonesian spices for food manufacturing, spice trading, beverage, bakery, and fragrance markets.",
    items: ["Vanilla", "Cinnamon", "Nutmeg", "Cloves", "Pepper", "Patchouli"],
    action: "Enter Division"
  }
];

const whyCards = [
  {
    title: "Trusted Distribution",
    text: "Reliable commodity supply and professional communication for domestic and international buyers."
  },
  {
    title: "Sustainable Business",
    text: "Committed to responsible supply, eco-energy development, and long-term business growth."
  },
  {
    title: "Nationwide Network",
    text: "Connected sourcing and distribution networks designed to support multiple commodity categories."
  },
  {
    title: "Long-Term Partnership",
    text: "Focused on repeat cooperation, transparent requirements, and buyer-focused quotation support."
  }
];

const globalStats = [
  { value: "2", label: "International Market Routes" },
  { value: "3", label: "Integrated Business Divisions" },
  { value: "100%", label: "Commitment to Long-Term Partnerships" }
];

const buyerQuickFacts = [
  {
    number: "01",
    icon: "📦",
    title: "Products",
    label: "Product Portfolio",
    text: "We offer fresh vegetables, eggs, rice, coconut charcoal, charcoal briquettes, wood pellets, and premium Indonesian spices."
  },
  {
    number: "02",
    icon: "📋",
    title: "MOQ & Sampling",
    label: "MOQ & Sampling",
    text: "Minimum Order Quantity (MOQ) and sample availability vary depending on product type."
  },
  {
    number: "03",
    icon: "🚢",
    title: "Export Process",
    label: "Inquiry & Export Process",
    text: "Share your destination country, quantity, and specifications for a tailored quotation."
  }
];

const futureTimeline = [
  {
    period: "March - June 2026",
    title: "Strengthen Sourcing Network",
    text: "Build a more reliable supplier and handling network for selected Indonesian commodity categories."
  },
  {
    period: "July 2026",
    title: "Export-Ready Product Lines",
    text: "Expand product lines that are easier for international buyers to review, compare, and request."
  },
  {
    period: "July 2026 onward",
    title: "International Buyer Partnerships",
    text: "Develop repeat buyer relationships through clearer quotation support and long-term collaboration channels."
  }
];

const pageText = {
  en: {
    projects,
    partnershipCards,
    aboutCards,
    productCards,
    whyCards,
    globalStats,
    buyerQuickFacts,
    futureGoals,
    futureTimeline,
    footerValues: brandValues,
    heroKicker: "Quality | Reliability | Consistency",
    heroTitle: "Indonesian Commodities,",
    heroHighlight: "Ready For Global Trade",
    heroDescription:
      "Garda Samudra Nusantara connects selected Indonesian commodities with buyers who value quality, reliability, and consistency. Through Garda Fresh, Garda Green, and Garda Prime, we support fresh food supply, eco-energy commodities, and premium Indonesian spices with responsive trading assistance.",
    requestQuotation: "Request Quotation",
    exploreDivisions: "Explore Divisions",
    inquiryForm: "Inquiry Form",
    businessCollaboration: "Business Collaboration",
    whatsappGsn: "WhatsApp GSN",
    longTermRoadmap: "Long-Term Roadmap",
    aboutKicker: "About GSN",
    aboutTitle: "Building trusted Indonesian commodity access for global buyers.",
    aboutDescription:
      "GSN is an integrated trading company focused on selected agricultural products, eco-energy commodities, and premium spices from Indonesia. We help buyers clarify requirements and move from inquiry to quotation with professional follow-up.",
    divisionsKicker: "Divisions",
    divisionsTitle: "Three divisions built around practical buyer needs.",
    divisionsDescription:
      "Explore fresh food supply, eco-energy commodities, and Indonesian spices through a company designed for clear communication and long-term cooperation.",
    projectsKicker: "Business Information",
    projectsTitle: "Essential details for product sourcing and export cooperation.",
    projectDescription:
      "Strategic development designed to strengthen GSN's sourcing, distribution, and buyer partnership ecosystem.",
    partnershipKicker: "Partnership Pathways",
    partnershipTitle: "Collaboration routes for buyers, investors, and long-term commodity partners.",
    partnershipDescription:
      "Choose the partnership direction that matches your sourcing, procurement, investment, or export development needs.",
    discussPartnership: "Discuss Partnership",
    goalsKicker: "Future Goals",
    goalsTitle: "GSN's roadmap toward stronger Indonesian commodity recognition.",
    contactKicker: "Contact",
    contactTitle: "Start your commodity inquiry with GSN.",
    contactDescription: companyProfile.closing,
    enteringDivision: "Entering Division",
    globalLoadingOne: "INITIALIZING GLOBAL NETWORK...",
    globalLoadingTwo: "CONNECTING INTERNATIONAL ROUTES...",
    futureLoadingOne: "INITIALIZING GSN FUTURE ROADMAP...",
    futureLoadingTwo: "SCANNING LONG-TERM GROWTH PATHWAYS...",
    backToGsn: "Back to GSN",
    globalKicker: "Global Market Vision",
    globalTitle: "Connecting Indonesia To Global Opportunities",
    globalDescription:
      "GSN is committed to expanding Indonesian commodities into international markets through strategic partnerships, sustainable distribution, and reliable global networks.",
    whyKicker: "Why GSN",
    whyTitle: "Why GSN",
    whyDescription:
      "Building trusted distribution and commodity solutions through quality, sustainability, and long-term partnerships.",
    futureOverlayKicker: "Long-Term Roadmap",
    futureOverlayTitle: "Future direction for stronger GSN commodity growth.",
    futureOverlayDescription:
      "GSN is building a long-term path around stronger sourcing, export readiness, product expansion, handling standards, and global buyer recognition.",
    contacts: contactLinks,
    footerDescription: "Trading, distribution, and development of Indonesia's leading commodities."
  },
  id: {
    projects: [
      "Perluasan jaringan pemasok",
      "Pengembangan pasar ekspor",
      "Pasokan komoditas eco-energy",
      "Rantai pasok pertanian",
      "Kemitraan buyer global"
    ],
    partnershipCards: [
      {
        title: "Peluang Investor",
        text: "Bangun jalur komoditas Indonesia yang scalable melalui sourcing, distribusi, dan pengembangan pasar jangka panjang."
      },
      {
        title: "Kolaborasi Bisnis",
        text: "Bekerja sama dengan GSN untuk pengadaan, sourcing, pasokan berulang, dan pertumbuhan komoditas berorientasi ekspor."
      },
      {
        title: "Pertumbuhan Berkelanjutan",
        text: "Dukung produk Indonesia melalui pasokan bertanggung jawab, komoditas eco-energy, dan operasional perdagangan yang andal."
      }
    ],
    aboutCards: [
      { value: "3+", label: "Divisi Bisnis Terintegrasi", action: "divisions" },
      { value: "Global Partnership", label: "Trusted Relationship Worldwide", action: "global" }
    ],
    productCards: [
      {
        id: "fresh",
        number: "01",
        title: "Garda Fresh",
        accent: "fresh",
        image: "/images/fresh-division-card.webp",
        description:
          "Menyediakan sayuran segar, telur, dan beras premium untuk food service, retail, dan kebutuhan pengadaan berulang.",
        items: ["Sayuran segar", "Beras premium", "Telur ayam", "Telur bebek", "Telur puyuh"],
        action: "Masuk Divisi"
      },
      {
        id: "green",
        number: "02",
        title: "Garda Green",
        accent: "green",
        image: "/images/garda-green-card.webp",
        description:
          "Menyediakan komoditas eco-energy Indonesia untuk buyer BBQ, shisha, biomass fuel, industri, dan retail.",
        items: ["Arang batok kelapa", "Arang briket", "Wood pellet"],
        action: "Masuk Divisi"
      },
      {
        id: "prime",
        number: "03",
        title: "Garda Prime",
        accent: "prime",
        image: "/images/prime-card.webp",
        description:
          "Menyediakan rempah Indonesia pilihan untuk manufaktur makanan, perdagangan rempah, minuman, bakery, dan fragrance.",
        items: ["Vanili", "Kayu manis", "Pala", "Cengkeh", "Lada", "Nilam"],
        action: "Masuk Divisi"
      }
    ],
    whyCards: [
      {
        title: "Distribusi Tepercaya",
        text: "Pasokan komoditas yang andal dan komunikasi profesional untuk buyer domestik maupun internasional."
      },
      {
        title: "Bisnis Berkelanjutan",
        text: "Berkomitmen pada pasokan bertanggung jawab, pengembangan eco-energy, dan pertumbuhan bisnis jangka panjang."
      },
      {
        title: "Jaringan Nasional",
        text: "Jaringan sourcing dan distribusi yang dirancang untuk mendukung berbagai kategori komoditas."
      },
      {
        title: "Kemitraan Jangka Panjang",
        text: "Fokus pada kerja sama berulang, kebutuhan yang transparan, dan dukungan quotation yang berorientasi buyer."
      }
    ],
    globalStats: [
      { value: "2", label: "Rute Pasar Internasional" },
      { value: "3", label: "Divisi Bisnis Terintegrasi" },
      { value: "100%", label: "Komitmen Untuk Kemitraan Jangka Panjang" }
    ],
    buyerQuickFacts: [
      {
        number: "01",
        icon: "📦",
        title: "Produk",
        label: "Portofolio Produk",
        text: "Kami menawarkan sayuran segar, telur, beras, arang batok kelapa, arang briket, wood pellet, dan rempah premium Indonesia."
      },
      {
        number: "02",
        icon: "📋",
        title: "MOQ & Sampling",
        label: "MOQ & Sampling",
        text: "Minimum Order Quantity (MOQ) dan ketersediaan sampel dapat berbeda tergantung jenis produk."
      },
      {
        number: "03",
        icon: "🚢",
        title: "Proses Ekspor",
        label: "Inquiry & Proses Ekspor",
        text: "Bagikan negara tujuan, quantity, dan spesifikasi untuk quotation yang disesuaikan."
      }
    ],
    futureTimeline: [
      {
        period: "Maret - Juni 2026",
        title: "Memperkuat Jaringan Sourcing",
        text: "Membangun jaringan pemasok dan handling yang lebih andal untuk kategori komoditas Indonesia pilihan."
      },
      {
        period: "Juli 2026",
        title: "Lini Produk Siap Ekspor",
        text: "Memperluas lini produk yang lebih mudah ditinjau, dibandingkan, dan diminta oleh buyer internasional."
      },
      {
        period: "Mulai Juli 2026",
        title: "Kemitraan Buyer Internasional",
        text: "Mengembangkan hubungan buyer berulang melalui dukungan quotation yang lebih jelas dan kanal kolaborasi jangka panjang."
      }
    ],
    futureGoals: [
      "Memperluas jaringan sourcing dan distribusi yang andal di Indonesia",
      "Mengembangkan akses pasar internasional yang lebih kuat untuk komoditas Indonesia",
      "Menambah lini produk strategis berdasarkan kebutuhan buyer",
      "Meningkatkan standar produk, handling, dan kapasitas pasokan",
      "Membangun GSN sebagai partner komoditas Indonesia yang dikenal buyer global"
    ],
    footerValues: ["Kualitas", "Keandalan", "Konsistensi"],
    heroKicker: "Kualitas | Keandalan | Konsistensi",
    heroTitle: "Komoditas Indonesia,",
    heroHighlight: "Siap Untuk Perdagangan Global",
    heroDescription:
      "Garda Samudra Nusantara menghubungkan komoditas Indonesia pilihan dengan buyer yang mengutamakan kualitas, keandalan, dan konsistensi. Melalui Garda Fresh, Garda Green, dan Garda Prime, kami mendukung pasokan pangan segar, komoditas eco-energy, dan rempah premium Indonesia dengan layanan perdagangan yang responsif.",
    requestQuotation: "Minta Quotation",
    exploreDivisions: "Lihat Divisi",
    inquiryForm: "Form Inquiry",
    businessCollaboration: "Business Collaboration",
    whatsappGsn: "WhatsApp GSN",
    longTermRoadmap: "Roadmap Jangka Panjang",
    aboutKicker: "Tentang GSN",
    aboutTitle: "Membangun akses komoditas Indonesia tepercaya untuk buyer global.",
    aboutDescription:
      "GSN adalah perusahaan perdagangan terintegrasi yang berfokus pada produk pertanian pilihan, komoditas eco-energy, dan rempah premium dari Indonesia. Kami membantu buyer memperjelas kebutuhan dan bergerak dari inquiry menuju quotation dengan follow-up profesional.",
    divisionsKicker: "Divisi",
    divisionsTitle: "Tiga divisi yang dibangun berdasarkan kebutuhan buyer.",
    divisionsDescription:
      "Jelajahi pasokan pangan segar, komoditas eco-energy, dan rempah Indonesia melalui perusahaan yang dirancang untuk komunikasi jelas dan kerja sama jangka panjang.",
    projectsKicker: "Informasi Bisnis",
    projectsTitle: "Detail penting untuk sourcing produk dan kerja sama ekspor.",
    projectDescription:
      "Pengembangan strategis untuk memperkuat ekosistem sourcing, distribusi, dan kemitraan buyer GSN.",
    partnershipKicker: "Jalur Kemitraan",
    partnershipTitle: "Rute kolaborasi untuk buyer, investor, dan partner komoditas jangka panjang.",
    partnershipDescription:
      "Pilih arah kemitraan yang sesuai dengan kebutuhan sourcing, pengadaan, investasi, atau pengembangan ekspor.",
    discussPartnership: "Diskusikan Kemitraan",
    goalsKicker: "Tujuan Ke Depan",
    goalsTitle: "Roadmap GSN menuju pengakuan komoditas Indonesia yang lebih kuat.",
    contactKicker: "Kontak",
    contactTitle: "Mulai inquiry komoditas Anda bersama GSN.",
    contactDescription:
      "GSN hadir untuk buyer yang menghargai komunikasi yang dapat diandalkan, produk pilihan, dan kemitraan komoditas jangka panjang dari Indonesia.",
    enteringDivision: "Masuk Divisi",
    globalLoadingOne: "MEMULAI JARINGAN GLOBAL...",
    globalLoadingTwo: "MENGHUBUNGKAN RUTE INTERNASIONAL...",
    futureLoadingOne: "MEMULAI ROADMAP MASA DEPAN GSN...",
    futureLoadingTwo: "MEMINDAI ARAH PERTUMBUHAN JANGKA PANJANG...",
    backToGsn: "Kembali ke GSN",
    globalKicker: "Visi Pasar Global",
    globalTitle: "Menghubungkan Indonesia Dengan Peluang Global",
    globalDescription:
      "GSN berkomitmen memperluas komoditas Indonesia ke pasar internasional melalui kemitraan strategis, distribusi berkelanjutan, dan jaringan global yang andal.",
    whyKicker: "Mengapa GSN",
    whyTitle: "Mengapa GSN",
    whyDescription:
      "Membangun solusi distribusi dan komoditas tepercaya melalui kualitas, keberlanjutan, dan kemitraan jangka panjang.",
    futureOverlayKicker: "Roadmap Jangka Panjang",
    futureOverlayTitle: "Arah masa depan untuk pertumbuhan komoditas GSN yang lebih kuat.",
    futureOverlayDescription:
      "GSN membangun arah jangka panjang melalui sourcing yang lebih kuat, kesiapan ekspor, perluasan produk, standar handling, dan pengakuan buyer global.",
    contacts: contactLinks.map((contact) =>
      contact.label === "Address" ? { ...contact, label: "Alamat" } : contact
    ),
    footerDescription: "Perdagangan, distribusi, dan pengembangan komoditas unggulan Indonesia."
  }
};

export default function HomePage() {
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [language, setLanguage] = useState("en");
  const [globalMode, setGlobalMode] = useState("idle");
  const [divisionPulse, setDivisionPulse] = useState(false);
  const [loadingDivisionId, setLoadingDivisionId] = useState(null);
  const [pendingInquiryDivision, setPendingInquiryDivision] = useState(null);
  const activeDivision = divisions.find((division) => division.id === selectedDivision);
  const loadingDivision = divisions.find((division) => division.id === loadingDivisionId);
  const text = pageText[language];

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

    window.addEventListener("gsn:language", handleLanguage);
    return () => window.removeEventListener("gsn:language", handleLanguage);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 700);
    const revealItems = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.18 }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDivision || !pendingInquiryDivision) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("gsn:selectDivision", { detail: pendingInquiryDivision }));
      document.getElementById("gsnformneo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingInquiryDivision(null);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [pendingInquiryDivision, selectedDivision]);

  if (activeDivision) {
    return (
      <DivisionPage
        division={activeDivision}
        goBack={() => {
          setSelectedDivision(null);
          window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
        }}
        requestInquiry={(divisionId) => openInquiryForm(divisionId)}
      />
    );
  }

  function handleMouseMove(event) {
    event.currentTarget.style.setProperty("--mouse-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${event.clientY}px`);
  }

  function scrollToDivisions() {
    setDivisionPulse(true);
    const productsSection = document.getElementById("products");
    productsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setDivisionPulse(false), 1800);
  }

  function openMarketExperience(type = "global") {
    setGlobalMode(`${type}-loading`);
    window.setTimeout(() => setGlobalMode(`${type}-active`), 1800);
  }

  function handleAboutAction(action) {
    if (action === "divisions") {
      scrollToDivisions();
      return;
    }

    if (action === "global") {
      openMarketExperience("global");
      return;
    }

    openMarketExperience("future");
  }

  function enterDivision(divisionId) {
    setLoadingDivisionId(divisionId);
    window.setTimeout(() => {
      setSelectedDivision(divisionId);
      setLoadingDivisionId(null);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 1700);
  }

  function openInquiryForm(divisionId) {
    setLoadingDivisionId(null);
    setPendingInquiryDivision(divisionId);
    setSelectedDivision(null);
  }

  return (
    <main className="future-site" onMouseMove={handleMouseMove}>
      {!loaded ? (
        <div className="loading-screen" aria-label="Loading Garda Samudra Nusantara">
          <img src="/logos/gsn-clear-logo.png" alt="" />
          <span>GSN.CORP</span>
        </div>
      ) : null}

      <div className="cursor-light" aria-hidden="true"></div>
      <div className="particle-field" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--i": index + 1,
              left: `${(index * 37) % 96}%`,
              top: `${(index * 53) % 92}%`
            }}
          ></span>
        ))}
      </div>

      <div className="future-frame">
        <Navbar onSelectDivision={setSelectedDivision} />

        <section className="future-hero" id="home" aria-labelledby="hero-title">
          <div className="hero-light hero-light-left"></div>
          <div className="hero-light hero-light-right"></div>

          <div className="future-hero-content reveal">
            <p className="future-kicker">{text.heroKicker}</p>
            <h1 id="hero-title">
              {text.heroTitle}
              {" "}
              <span>{text.heroHighlight}</span>
            </h1>
            <p>{text.heroDescription}</p>
            <div className="future-actions">
              <a className="future-button primary" href="#gsnformneo">{text.requestQuotation}</a>
              <a className="future-button secondary" href="#products">{text.exploreDivisions}</a>
            </div>
          </div>

          <div className="hologram-stage reveal" aria-label="Floating futuristic GSN hologram">
            <div className="energy-ring ring-one"></div>
            <div className="energy-ring ring-two"></div>
            <div className="energy-ring ring-three"></div>
            <div className="hologram-logo">
              <img src="/logos/gsn-clear-logo.png" alt="GSN logo" />
            </div>
            <div className="neon-platform"></div>
          </div>
        </section>

        <section className="future-section about-section reveal" id="about">
          <div className="section-intro">
            <p className="future-kicker">{text.aboutKicker}</p>
            <h2>{text.aboutTitle}</h2>
            <p>{text.aboutDescription}</p>
          </div>
          <div className="about-action-grid">
            {text.aboutCards.map((card) => (
              <button
                className="spotlight-card about-action-card"
                key={card.label}
                onClick={() => handleAboutAction(card.action)}
                type="button"
              >
                <span>{card.value}</span>
                <p>{card.label}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="future-section partnership-compact-section" id="partnership">
          <div className="section-intro center">
            <p className="future-kicker">{text.partnershipKicker}</p>
            <h2>{text.partnershipTitle}</h2>
            <p>{text.partnershipDescription}</p>
          </div>
          <div className="partnership-grid">
            {text.partnershipCards.map((card) => (
              <article className="spotlight-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
          <div className="partnership-cta-row">
            <a className="future-button primary" href="#gsnformneo">{text.discussPartnership}</a>
            <button className="future-button secondary" type="button" onClick={() => openMarketExperience("future")}>
              {text.longTermRoadmap}
            </button>
          </div>
        </section>

        <section
          className={`future-section products-future-section ${divisionPulse ? "division-cinematic" : ""}`}
          id="products"
        >
          <div className="section-intro center">
            <p className="future-kicker">{text.divisionsKicker}</p>
            <h2>{text.divisionsTitle}</h2>
            <p>{text.divisionsDescription}</p>
          </div>
          <div className="future-product-grid">
            {text.productCards.map((product) => (
              <article className={`future-product-card product-${product.accent}`} key={product.id}>
                <img src={product.image} alt={`${product.title} commodity products`} />
                <div>
                  <span>{product.number}</span>
                  <h3>{product.title.toUpperCase()}</h3>
                  <p>{product.description}</p>
                  <ul>
                    {product.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="product-card-actions">
                    <button type="button" onClick={() => enterDivision(product.id)}>
                      {product.action}
                    </button>
                    <button className="send-inquiry-button" type="button" onClick={() => openInquiryForm(product.id)}>
                      {text.inquiryForm}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="future-section buyer-summary-section reveal" id="projects">
          <div className="section-intro center">
            <p className="future-kicker">{text.projectsKicker}</p>
            <h2>{text.projectsTitle}</h2>
          </div>
          <div className="buyer-summary-grid">
            {text.buyerQuickFacts.map((item) => (
              <article className="spotlight-card buyer-summary-card" key={item.title}>
                <span>
                  <strong>{item.number}</strong>
                  <i aria-hidden="true">{item.icon}</i>
                </span>
                <small>{item.label}</small>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <InquiryForm />

        <section className="future-section contact-future-section reveal" id="contact">
          <div className="section-intro center">
            <p className="future-kicker">{text.contactKicker}</p>
            <h2>{text.contactTitle}</h2>
            <p>{text.contactDescription}</p>
          </div>
          <div className="contact-grid future-contact-grid">
            {text.contacts.filter((contact) => primaryContactLabels.includes(contact.label)).map((contact) => (
              <a
                className="contact-card"
                href={contact.href}
                key={contact.label}
                rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                target={contact.href.startsWith("http") ? "_blank" : undefined}
              >
                <span>{contact.label}</span>
                <strong>{contact.value}</strong>
              </a>
            ))}
          </div>
        </section>

        <Footer contacts={text.contacts} values={text.footerValues} description={text.footerDescription} />
      </div>

      <GSNExportAssistant />

      {globalMode !== "idle" ? (
        <GlobalMarketExperience
          mode={globalMode}
          onClose={() => setGlobalMode("idle")}
          text={text}
        />
      ) : null}

      {loadingDivision ? (
        <DivisionLoading division={loadingDivision} text={text} />
      ) : null}
    </main>
  );
}

function DivisionLoading({ division, text }) {
  const loadingLogos = {
    fresh: "/logos/garda-fresh-loading.png",
    green: "/logos/garda-green-loading.png",
    prime: "/logos/garda-prime-loading.png"
  };
  const slogans = {
    fresh: "Fresh Starts Here",
    green: "powering a greener future",
    prime: "Premium Spices, Global Standards"
  };
  const loadingLogo = loadingLogos[division.id] || "/logos/gsn-clear-logo.png";
  const slogan = slogans[division.id] || "Quality | Reliability | Consistency";

  return (
    <div className={`division-loading-overlay loading-${division.id}`} role="status" aria-live="polite">
      <div className="division-loader-mark">
        <img src={loadingLogo} alt="" />
        <div>
          <span>{text.enteringDivision}</span>
          <h2>{division.name}</h2>
          <p>{slogan}</p>
        </div>
      </div>
      <div className="division-loader-bar" aria-hidden="true">
        <span></span>
      </div>
    </div>
  );
}

function GlobalMarketExperience({ mode, onClose, text }) {
  const loading = mode.endsWith("loading");
  const futureMode = mode.startsWith("future");

  return (
    <section className={`global-market-overlay ${futureMode ? "future-roadmap-overlay" : ""} ${loading ? "is-loading" : "is-active"}`} aria-modal="true" role="dialog">
      <div className="global-noise" aria-hidden="true"></div>
      <div className="global-particles" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, index) => (
          <span key={index} style={{ "--i": index + 1 }}></span>
        ))}
      </div>

      {loading ? (
        <div className="global-loader">
          <img src="/logos/gsn-clear-logo.png" alt="" />
          <div className="scanner-line"></div>
          <p>{futureMode ? text.futureLoadingOne : text.globalLoadingOne}</p>
          <p>{futureMode ? text.futureLoadingTwo : text.globalLoadingTwo}</p>
        </div>
      ) : futureMode ? (
        <div className="global-market-page future-roadmap-page">
          <button className="global-close" onClick={onClose} type="button">
            {text.backToGsn}
          </button>

          <div className="global-copy">
            <p className="future-kicker">{text.futureOverlayKicker}</p>
            <h2>{text.futureOverlayTitle}</h2>
            <p>{text.futureOverlayDescription}</p>
          </div>

          <div className="future-roadmap-stage" aria-label="GSN future roadmap">
            <div className="roadmap-core">
              <img src="/logos/gsn-clear-logo.png" alt="" />
              <strong>GSN FUTURE</strong>
              <div className="roadmap-slogan">
                <span>Quality</span>
                <span>Reliability</span>
                <span>Consistency</span>
              </div>
            </div>
            <div className="roadmap-orbit orbit-a"></div>
            <div className="roadmap-orbit orbit-b"></div>
            <div className="roadmap-orbit orbit-c"></div>
          </div>

          <div className="future-roadmap-grid future-roadmap-timeline">
            {text.futureTimeline.map((goal, index) => (
              <article key={goal.period}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{goal.period}</strong>
                <h3>{goal.title}</h3>
                <p>{goal.text}</p>
              </article>
            ))}
          </div>

          <div className="partnership-cta-row future-roadmap-actions">
            <a className="future-button primary" href="#partnership" onClick={onClose}>{text.businessCollaboration}</a>
            <a className="future-button secondary" href="#gsnformneo" onClick={onClose}>{text.inquiryForm}</a>
          </div>
        </div>
      ) : (
        <div className="global-market-page">
          <button className="global-close" onClick={onClose} type="button">
            {text.backToGsn}
          </button>

          <div className="global-copy">
            <p className="future-kicker">{text.globalKicker}</p>
            <h2>{text.globalTitle}</h2>
            <p>{text.globalDescription}</p>
          </div>

          <div className="global-map" aria-label="Global market connection map from Gresik">
            <img
              className="global-map-image"
              src="/images/global-market-map.webp"
              alt="Purple cyber map of Indonesia and Southeast Asia"
            />
          </div>

          <div className="global-stats">
            {text.globalStats.map((stat) => (
              <article key={stat.label}>
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>

          <div className="why-gsn">
            <div className="section-intro center">
              <p className="future-kicker">{text.whyKicker}</p>
              <h2>{text.whyTitle}</h2>
              <p>{text.whyDescription}</p>
            </div>
            <div className="why-grid">
              {text.whyCards.map((card) => (
                <article key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="global-roadmap-section">
            <div className="section-intro center">
              <p className="future-kicker">{text.futureOverlayKicker}</p>
              <h2>{text.futureOverlayTitle}</h2>
              <p>{text.futureOverlayDescription}</p>
            </div>

            <div className="future-roadmap-stage" aria-label="GSN long-term global partnership roadmap">
              <div className="roadmap-core">
                <img src="/logos/gsn-clear-logo.png" alt="" />
                <strong>GSN FUTURE</strong>
                <div className="roadmap-slogan">
                  <span>Quality</span>
                  <span>Reliability</span>
                  <span>Consistency</span>
                </div>
              </div>
              <div className="roadmap-orbit orbit-a"></div>
              <div className="roadmap-orbit orbit-b"></div>
              <div className="roadmap-orbit orbit-c"></div>
            </div>

            <div className="future-roadmap-grid future-roadmap-timeline">
              {text.futureTimeline.map((goal, index) => (
                <article key={goal.period}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{goal.period}</strong>
                  <h3>{goal.title}</h3>
                  <p>{goal.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
