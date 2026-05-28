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
    value: "Global",
    label: "Market Vision",
    action: "global"
  },
  {
    value: "Long-Term",
    label: "Trusted Partnerships",
    action: "partnership"
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

const pageText = {
  en: {
    projects,
    partnershipCards,
    aboutCards,
    productCards,
    whyCards,
    globalStats,
    futureGoals,
    footerValues: brandValues,
    heroKicker: "Quality | Reliability | Consistency",
    heroTitle: "Indonesian Commodities,",
    heroHighlight: "Ready For Global Trade",
    heroDescription:
      "Garda Samudra Nusantara connects selected Indonesian commodities with buyers who value quality, reliability, and consistency. Through Garda Fresh, Garda Green, and Garda Prime, we support fresh food supply, eco-energy commodities, and premium Indonesian spices with responsive trading assistance.",
    requestQuotation: "Request Quotation",
    exploreDivisions: "Explore Divisions",
    inquiryForm: "Inquiry Form",
    aboutKicker: "About GSN",
    aboutTitle: "Building trusted Indonesian commodity access for global buyers.",
    aboutDescription:
      "GSN is an integrated trading company focused on selected agricultural products, eco-energy commodities, and premium spices from Indonesia. We help buyers clarify requirements and move from inquiry to quotation with professional follow-up.",
    divisionsKicker: "Divisions",
    divisionsTitle: "Three divisions built around practical buyer needs.",
    divisionsDescription:
      "Explore fresh food supply, eco-energy commodities, and Indonesian spices through a company designed for clear communication and long-term cooperation.",
    projectsKicker: "Projects",
    projectsTitle: "Future-ready development for stronger commodity supply.",
    projectDescription:
      "Strategic development designed to strengthen GSN's sourcing, distribution, and buyer partnership ecosystem.",
    partnershipKicker: "Partnership",
    partnershipTitle: "Built for buyers, investors, and long-term collaborators.",
    goalsKicker: "Future Goals",
    goalsTitle: "GSN's roadmap toward stronger Indonesian commodity recognition.",
    contactKicker: "Contact",
    contactTitle: "Start your commodity inquiry with GSN.",
    contactDescription: companyProfile.closing,
    enteringDivision: "Entering Division",
    globalLoadingOne: "INITIALIZING GLOBAL NETWORK...",
    globalLoadingTwo: "CONNECTING INTERNATIONAL ROUTES...",
    backToGsn: "Back to GSN",
    globalKicker: "Global Market Vision",
    globalTitle: "Connecting Indonesia To Global Opportunities",
    globalDescription:
      "GSN is committed to expanding Indonesian commodities into international markets through strategic partnerships, sustainable distribution, and reliable global networks.",
    whyKicker: "Why GSN",
    whyTitle: "Why GSN",
    whyDescription:
      "Building trusted distribution and commodity solutions through quality, sustainability, and long-term partnerships.",
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
      { value: "Global", label: "Visi Pasar Global", action: "global" },
      { value: "Jangka Panjang", label: "Kemitraan Tepercaya", action: "partnership" }
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
    aboutKicker: "Tentang GSN",
    aboutTitle: "Membangun akses komoditas Indonesia tepercaya untuk buyer global.",
    aboutDescription:
      "GSN adalah perusahaan perdagangan terintegrasi yang berfokus pada produk pertanian pilihan, komoditas eco-energy, dan rempah premium dari Indonesia. Kami membantu buyer memperjelas kebutuhan dan bergerak dari inquiry menuju quotation dengan follow-up profesional.",
    divisionsKicker: "Divisi",
    divisionsTitle: "Tiga divisi yang dibangun berdasarkan kebutuhan buyer.",
    divisionsDescription:
      "Jelajahi pasokan pangan segar, komoditas eco-energy, dan rempah Indonesia melalui perusahaan yang dirancang untuk komunikasi jelas dan kerja sama jangka panjang.",
    projectsKicker: "Proyek",
    projectsTitle: "Pengembangan masa depan untuk pasokan komoditas yang lebih kuat.",
    projectDescription:
      "Pengembangan strategis untuk memperkuat ekosistem sourcing, distribusi, dan kemitraan buyer GSN.",
    partnershipKicker: "Kemitraan",
    partnershipTitle: "Dibangun untuk buyer, investor, dan kolaborator jangka panjang.",
    goalsKicker: "Tujuan Ke Depan",
    goalsTitle: "Roadmap GSN menuju pengakuan komoditas Indonesia yang lebih kuat.",
    contactKicker: "Kontak",
    contactTitle: "Mulai inquiry komoditas Anda bersama GSN.",
    contactDescription:
      "GSN hadir untuk buyer yang menghargai komunikasi yang dapat diandalkan, produk pilihan, dan kemitraan komoditas jangka panjang dari Indonesia.",
    enteringDivision: "Masuk Divisi",
    globalLoadingOne: "MEMULAI JARINGAN GLOBAL...",
    globalLoadingTwo: "MENGHUBUNGKAN RUTE INTERNASIONAL...",
    backToGsn: "Kembali ke GSN",
    globalKicker: "Visi Pasar Global",
    globalTitle: "Menghubungkan Indonesia Dengan Peluang Global",
    globalDescription:
      "GSN berkomitmen memperluas komoditas Indonesia ke pasar internasional melalui kemitraan strategis, distribusi berkelanjutan, dan jaringan global yang andal.",
    whyKicker: "Mengapa GSN",
    whyTitle: "Mengapa GSN",
    whyDescription:
      "Membangun solusi distribusi dan komoditas tepercaya melalui kualitas, keberlanjutan, dan kemitraan jangka panjang.",
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

  function openGlobalMarket() {
    setGlobalMode("loading");
    window.setTimeout(() => setGlobalMode("active"), 1800);
  }

  function handleAboutAction(action) {
    if (action === "divisions") {
      scrollToDivisions();
      return;
    }

    if (action === "global") {
      openGlobalMarket();
      return;
    }

    document.getElementById("partnership")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
              <span>{text.heroHighlight}</span>
            </h1>
            <p>{text.heroDescription}</p>
            <div className="future-actions">
              <a className="future-button primary" href="#gsnformneo">{text.requestQuotation}</a>
              <a className="future-button secondary" href="#products">{text.exploreDivisions}</a>
              <a className="future-button secondary" href="#gsnformneo">{text.inquiryForm}</a>
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
                <img src={product.image} alt="" />
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

        <section className="future-section projects-section reveal" id="projects">
          <div className="section-intro">
            <p className="future-kicker">{text.projectsKicker}</p>
            <h2>{text.projectsTitle}</h2>
          </div>
          <div className="project-carousel" aria-label="GSN project concepts">
            {text.projects.map((project, index) => (
              <article className="project-card" key={project}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{project}</h3>
                <p>{text.projectDescription}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="future-section partnership-section reveal" id="partnership">
          <div className="section-intro center">
            <p className="future-kicker">{text.partnershipKicker}</p>
            <h2>{text.partnershipTitle}</h2>
          </div>
          <div className="partnership-grid">
            {text.partnershipCards.map((card) => (
              <article className="spotlight-card" key={card.title}>
                <span>✦</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <InquiryForm />

        <section className="future-section goals-section reveal">
          <div className="section-intro">
            <p className="future-kicker">{text.goalsKicker}</p>
            <h2>{text.goalsTitle}</h2>
          </div>
          <div className="goals-grid">
            {text.futureGoals.map((goal, index) => (
              <article className="goal-card" key={goal}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{goal}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="future-section contact-future-section reveal" id="contact">
          <div className="section-intro center">
            <p className="future-kicker">{text.contactKicker}</p>
            <h2>{text.contactTitle}</h2>
            <p>{text.contactDescription}</p>
          </div>
          <div className="contact-grid future-contact-grid">
            {text.contacts.map((contact) => (
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
  const loading = mode === "loading";

  return (
    <section className={`global-market-overlay ${loading ? "is-loading" : "is-active"}`} aria-modal="true" role="dialog">
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
          <p>{text.globalLoadingOne}</p>
          <p>{text.globalLoadingTwo}</p>
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
        </div>
      )}
    </section>
  );
}
