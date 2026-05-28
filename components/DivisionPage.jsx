"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import GSNExportAssistant from "@/components/GSNExportAssistant";

const whatsappNumber = "6285190907967";

function whatsappLink(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function stockMessage(name) {
  return `Hello Garda Samudra Nusantara, I would like to ask about the stock and price for ${name}.`;
}

function useDivisionLanguage() {
  const [language, setLanguage] = useState("en");

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

  return language;
}

const commonText = {
  en: {
    back: "Back to Company",
    contact: "Contact",
    profile: "Division Profile",
    viewCatalog: "View Catalog",
    productCatalog: "Product Catalog",
    askStock: "Ask Stock",
    close: "Close",
    requestQuotation: "Request Quotation",
    supplyPartnership: "Supply Partnership",
    partnershipReady: "Partnership Ready",
    exportReady: "Export Ready",
    footerValues: ["Quality", "Reliability", "Consistency"],
    footerDescription: "Trading, distribution, and development of Indonesia's leading commodities."
  },
  id: {
    back: "Kembali ke Perusahaan",
    contact: "Kontak",
    profile: "Profil Divisi",
    viewCatalog: "Lihat Katalog",
    productCatalog: "Katalog Produk",
    askStock: "Tanya Stok",
    close: "Tutup",
    requestQuotation: "Minta Quotation",
    supplyPartnership: "Kemitraan Pasokan",
    partnershipReady: "Siap Bermitra",
    exportReady: "Siap Ekspor",
    footerValues: ["Kualitas", "Keandalan", "Konsistensi"],
    footerDescription: "Perdagangan, distribusi, dan pengembangan komoditas unggulan Indonesia."
  }
};

const divisionCopy = {
  en: {
    fresh: {
      kicker: "Food Supply Division",
      heroTitle: "Fresh supply for daily business growth.",
      heroText:
        "Garda Fresh is a food supply division focused on reliable distribution of fresh vegetables, eggs, and premium rice. We support households, retailers, culinary businesses, and procurement partners through quality products, consistent availability, and responsive service.",
      aboutKicker: "About Garda Fresh",
      aboutTitle: "Reliable food commodities with stable supply.",
      aboutText:
        "Garda Fresh helps connect high-demand daily food products with a professional supply network. Our focus is freshness, hygiene, flexible ordering, and dependable distribution for long-term partners.",
      catalogTitle: "Choose Garda Fresh commodities.",
      catalogText:
        "Browse marketplace-style catalog groups. Each product includes a visual card, short description, and practical ordering category.",
      closingTitle: "Built for consistent food distribution.",
      closingText:
        "We support flexible ordering, responsive communication, and stable product availability for partners who need trusted food supply."
    },
    green: {
      kicker: "Sustainable Energy Division",
      heroTitle: "Powering cleaner trade through renewable commodities.",
      heroText:
        "Garda Green focuses on eco-friendly energy commodities for industrial and export needs. Through coconut shell charcoal, charcoal briquette, and wood pellet supply, we help partners build greener operations with consistent quality and reliable distribution.",
      profileKicker: "Garda Green Profile",
      profileTitle: "Built for sustainable energy partnerships.",
      profileText:
        "A responsible commodity division designed for cleaner energy demand, stable supply planning, export development, and long-term industrial relationships.",
      catalogTitle: "Eco-energy commodities with professional supply standards.",
      closingTitle: "Powering a greener future with trusted Indonesian commodities."
    },
    prime: {
      kicker: "Premium Spice Division",
      heroTitle: "Elevating Indonesian spices for global markets.",
      heroText:
        "Garda Prime focuses on premium Indonesian spices with curated quality, strong aroma profiles, and export-oriented consistency for buyers, food industries, specialty traders, and long-term partners.",
      profileKicker: "Garda Prime Profile",
      profileTitle: "Premium sourcing, refined aroma, trusted partnerships.",
      profileText:
        "Built for the premium spice market, Garda Prime connects Indonesian agricultural excellence with national and international trade needs.",
      catalogKicker: "Spice Catalog",
      catalogTitle: "Curated Indonesian commodities with premium global potential.",
      closingTitle: "Premium Indonesian spices crafted for serious trade relationships."
    }
  },
  id: {
    fresh: {
      kicker: "Divisi Pasokan Pangan",
      heroTitle: "Pasokan segar untuk pertumbuhan bisnis harian.",
      heroText:
        "Garda Fresh adalah divisi pasokan pangan yang berfokus pada distribusi sayuran segar, telur, dan beras premium. Kami mendukung rumah tangga, retail, bisnis kuliner, dan partner pengadaan melalui produk berkualitas, ketersediaan yang konsisten, dan layanan responsif.",
      aboutKicker: "Tentang Garda Fresh",
      aboutTitle: "Komoditas pangan yang andal dengan pasokan stabil.",
      aboutText:
        "Garda Fresh menghubungkan produk pangan harian dengan jaringan pasokan profesional. Fokus kami adalah kesegaran, higienitas, fleksibilitas pemesanan, dan distribusi yang dapat diandalkan untuk partner jangka panjang.",
      catalogTitle: "Pilih komoditas Garda Fresh.",
      catalogText:
        "Jelajahi grup katalog bergaya marketplace. Setiap produk dilengkapi kartu visual, deskripsi singkat, dan kategori pemesanan praktis.",
      closingTitle: "Dibangun untuk distribusi pangan yang konsisten.",
      closingText:
        "Kami mendukung pemesanan fleksibel, komunikasi responsif, dan ketersediaan produk stabil untuk partner yang membutuhkan pasokan pangan tepercaya."
    },
    green: {
      kicker: "Divisi Energi Berkelanjutan",
      heroTitle: "Mendorong perdagangan yang lebih bersih melalui komoditas terbarukan.",
      heroText:
        "Garda Green berfokus pada komoditas eco-energy untuk kebutuhan industri dan ekspor. Melalui arang batok kelapa, arang briket, dan wood pellet, kami membantu partner membangun operasional yang lebih hijau dengan kualitas konsisten dan distribusi andal.",
      profileKicker: "Profil Garda Green",
      profileTitle: "Dibangun untuk kemitraan energi berkelanjutan.",
      profileText:
        "Divisi komoditas yang dirancang untuk kebutuhan energi lebih bersih, perencanaan pasokan stabil, pengembangan ekspor, dan hubungan industri jangka panjang.",
      catalogTitle: "Komoditas eco-energy dengan standar pasokan profesional.",
      closingTitle: "Mendorong masa depan yang lebih hijau dengan komoditas Indonesia tepercaya."
    },
    prime: {
      kicker: "Divisi Rempah Premium",
      heroTitle: "Mengangkat rempah Indonesia untuk pasar global.",
      heroText:
        "Garda Prime berfokus pada rempah premium Indonesia dengan kualitas terkurasi, profil aroma kuat, dan konsistensi berorientasi ekspor untuk buyer, industri makanan, trader spesialis, dan partner jangka panjang.",
      profileKicker: "Profil Garda Prime",
      profileTitle: "Sourcing premium, aroma terjaga, kemitraan tepercaya.",
      profileText:
        "Dibangun untuk pasar rempah premium, Garda Prime menghubungkan keunggulan pertanian Indonesia dengan kebutuhan perdagangan nasional dan internasional.",
      catalogKicker: "Katalog Rempah",
      catalogTitle: "Komoditas Indonesia terkurasi dengan potensi global premium.",
      closingTitle: "Rempah premium Indonesia untuk hubungan dagang yang serius."
    }
  }
};

const freshVisionMission = [
  {
    title: "Vision",
    text:
      "To become a trusted food supply distributor that provides fresh, high-quality, and accessible commodities for wider communities and business partners."
  },
  {
    title: "Mission",
    text:
      "Provide hygienic food products, maintain stable supply, offer competitive value, and deliver responsive professional service."
  },
  {
    title: "Why Garda Fresh",
    text:
      "Selected products, flexible ordering, practical packaging options, and reliable distribution for daily consumption and procurement needs."
  }
];

const catalogProducts = [
  {
    id: "vegetables",
    category: "Fresh Vegetables",
    title: "Vegetable Supply Catalog",
    description:
      "Fresh selected vegetables for culinary businesses, retailers, households, and daily food supply needs.",
    image: "/images/fresh-vegetable-card.webp",
    products: [
      { name: "Cabbage (Kol/Kubis)", note: "Fresh cabbage for food service, retail, and daily cooking.", image: "/images/fresh-cabbage.webp" },
      { name: "Lettuce (Selada)", note: "Crisp lettuce for fresh meals, restaurants, and retail supply.", image: "/images/fresh-lettuce.webp" },
      { name: "Water Spinach (Kangkung)", note: "Fresh kangkung for daily vegetable distribution.", image: "/images/fresh-water-spinach.webp" },
      { name: "Carrot (Wortel)", note: "Selected carrots for kitchens, retailers, and food preparation.", image: "/images/fresh-carrot.webp" },
      { name: "Sweet Corn (Jagung Manis)", note: "Fresh sweet corn for household and culinary supply.", image: "/images/fresh-sweet-corn.webp" },
      { name: "Mustard Greens (Sawi Hijau)", note: "Mustard greens with reliable supply for daily cooking.", image: "/images/fresh-mustard-greens.webp" },
      { name: "Potato (Kentang)", note: "Stable potato supply for retail and culinary operations.", image: "/images/fresh-potato.webp" },
      { name: "Garlic (Bawang Putih)", note: "Fresh garlic for staple cooking and wholesale needs.", image: "/images/fresh-garlic.webp" },
      { name: "Shallot (Bawang Merah)", note: "Essential seasoning commodity for kitchen supply.", image: "/images/fresh-shallot.webp" },
      { name: "Tomato (Tomat)", note: "Selected tomatoes for kitchen, retail, and fresh market needs.", image: "/images/fresh-tomato.webp" },
      { name: "Cassava (Singkong)", note: "Cassava supply for traditional food and culinary production.", image: "/images/fresh-cassava.webp" },
      { name: "Green Onion (Daun Bawang)", note: "Fresh green onion for seasoning and culinary needs.", image: "/images/fresh-green-onion.webp" },
      { name: "Red Chili Pepper (Cabai Merah)", note: "Fresh red chili supply for culinary and food production use.", image: "/images/fresh-birds-eye-chili.webp" },
      { name: "Cucumber (Timun)", note: "Clean and fresh cucumber for daily distribution.", image: "/images/fresh-cucumber.webp" },
      { name: "Bird's Eye Chili (Cabai Rawit)", note: "Fresh bird's eye chili for spicy culinary demand.", image: "/images/fresh-birds-eye-chili.webp" },
      { name: "Pak Choi (Pakcoy)", note: "Fresh pak choi for healthy daily vegetable supply.", image: "/images/fresh-pak-choi.webp" },
      {
        name: "Yardlong Beans (Kacang Panjang)",
        note: "Reliable long bean supply for daily cooking.",
        image: "/images/fresh-yardlong-beans.webp"
      },
      { name: "Aubergine (Terong)", note: "Fresh aubergine with selected market quality.", image: "/images/fresh-aubergine.webp" },
      { name: "Bitter Gourd (Pare)", note: "Fresh bitter gourd for traditional and daily cooking needs.", image: "/images/fresh-bitter-gourd.webp" },
      { name: "Spinach (Bayam)", note: "Fresh spinach for household, retail, and food-service supply.", image: "/images/fresh-spinach.webp" },
      { name: "Lemon Basil (Kemangi)", note: "Aromatic lemon basil for fresh culinary use.", image: "/images/fresh-lemon-basil.webp" }
    ]
  },
  {
    id: "eggs",
    category: "Egg Supply",
    title: "Egg Product Catalog",
    description:
      "Reliable protein supply with chicken eggs, duck eggs, and quail eggs for daily and bulk procurement.",
    image: "/images/fresh-eggs-card.webp",
    products: [
      {
        name: "Horn Chicken Eggs",
        note: "Stable chicken egg supply for daily consumption and business demand.",
        image: "/images/fresh-chicken-eggs.webp"
      },
      {
        name: "Kampung Chicken Eggs",
        note: "Kampung chicken eggs for premium daily protein needs.",
        image: "/images/fresh-kampung-eggs.webp"
      },
      {
        name: "Duck Eggs",
        note: "Duck egg supply for culinary and traditional food production.",
        image: "/images/fresh-duck-eggs.webp"
      },
      {
        name: "Quail Eggs",
        note: "Small egg supply for snacks, catering, and culinary use.",
        image: "/images/fresh-quail-eggs.webp"
      }
    ]
  },
  {
    id: "rice",
    category: "Premium Rice",
    title: "Premium Rice Catalog",
    description:
      "Premium rice with flexible kilogram options for household, retail, food-service, and institutional needs.",
    image: "/images/fresh-rice-card.webp",
    packs: [
      {
        size: "5 kg",
        note: "Practical package for household and small daily needs.",
        image: "/images/fresh-rice-5kg.webp"
      },
      {
        size: "10 kg",
        note: "Balanced package for family kitchens and small businesses.",
        image: "/images/fresh-rice-10kg.webp"
      },
      {
        size: "25 kg",
        note: "Efficient option for retailers, catering, and culinary operations.",
        image: "/images/fresh-rice-25kg.webp"
      },
      {
        size: "50 kg",
        note: "Bulk supply for larger procurement and institutional demand.",
        image: "/images/fresh-rice-50kg.webp"
      }
    ]
  }
];

const greenProfileCards = [
  {
    title: "Vision",
    text:
      "To become a globally competitive provider of eco-friendly energy commodities with consistent quality and trusted supply standards."
  },
  {
    title: "Mission",
    text:
      "Provide high-quality energy products, support cleaner alternative energy, maintain sustainable raw materials, and expand national and international markets."
  },
  {
    title: "Why Garda Green",
    text:
      "Export-oriented quality, responsible sourcing, consistent supply, and professional service for industrial and long-term commodity partnerships."
  }
];

const greenProducts = [
  {
    name: "Coconut Shell Charcoal",
    subtitle: "Arang Batok Kelapa",
    note:
      "Natural coconut shell charcoal with strong heat performance for industrial, retail, and export-oriented supply.",
    image: "/images/green-coconut-charcoal.webp"
  },
  {
    name: "Charcoal Briquette",
    subtitle: "Arang Briket",
    note:
      "Compact charcoal briquettes made for stable burning, practical handling, and consistent professional supply.",
    image: "/images/green-charcoal-briquette.webp"
  },
  {
    name: "Wood Pellet",
    subtitle: "Renewable Biomass Fuel",
    note:
      "Renewable wood pellet fuel for cleaner energy needs with scalable distribution and long-term supply potential.",
    image: "/images/green-wood-pellet.webp"
  }
];

const primeProfileCards = [
  {
    title: "Vision",
    text:
      "To become a premium Indonesian spice supplier recognized for quality, consistency, and trusted global market relationships."
  },
  {
    title: "Mission",
    text:
      "Deliver high-quality spices, preserve aroma and product standards, support local commodities, and build modern sustainable spice trading."
  },
  {
    title: "Why Garda Prime",
    text:
      "Curated Indonesian spices, premium sourcing standards, export-oriented quality, and long-term partnership support for global buyers."
  }
];

const primeProducts = [
  { name: "Vanilla / Vanili", note: "Premium Indonesian vanilla for export-oriented culinary, bakery, and flavor applications.", image: "/images/prime-vanilli.webp" },
  { name: "Cinnamon / Kayu Manis", note: "Cassia cinnamon with warm aroma, suitable for food, beverage, and spice trading needs.", image: "/images/prime-kayu-manis.webp" },
  { name: "Nutmeg / Pala", note: "Selected nutmeg from Indonesia, known for rich aroma and strong global market demand.", image: "/images/prime-pala.webp" },
  { name: "Cloves / Cengkeh", note: "Classic Indonesian cloves for food, beverage, fragrance, and industry supply chains.", image: "/images/prime-cengkeh.webp" },
  { name: "Black Pepper / Lada Hitam", note: "Bold black pepper with sharp aroma for culinary and wholesale spice markets.", image: "/images/prime-black-pepper.webp" },
  { name: "White Pepper / Lada Putih", note: "Clean and aromatic white pepper for premium spice distribution and food production.", image: "/images/prime-white-pepper.webp" },
  { name: "Turmeric / Kunyit", note: "Golden turmeric for food ingredients, herbal products, and natural color applications.", image: "/images/prime-kunyit.webp" },
  { name: "Ginger / Jahe", note: "Fresh ginger commodity for beverage, culinary, and wellness product needs.", image: "/images/prime-jahe.webp" },
  { name: "Galangal / Lengkuas", note: "Traditional aromatic rhizome for Indonesian cuisine and regional spice distribution.", image: "/images/prime-lengkuas.webp" },
  { name: "Coriander Seed / Ketumbar", note: "Selected coriander seed for seasoning, spice blending, and food production supply.", image: "/images/prime-ketumbar.webp" },
  { name: "Lemongrass / Serai", note: "Fresh aromatic lemongrass for culinary, beverage, and essential ingredient supply.", image: "/images/prime-serai.webp" },
  { name: "Tamarind / Asam Jawa", note: "Tamarind commodity with sour-sweet profile for sauces, beverages, and food processing.", image: "/images/prime-asam-jawa.webp" },
  { name: "Kaffir Lime Leaf / Daun Jeruk", note: "Fragrant citrus leaf commodity for restaurants, food production, and spice mixes.", image: "/images/prime-daun-jeruk.webp" },
  { name: "Patchouli / Nilam", note: "Premium patchouli commodity for fragrance, perfume, and essential oil industry demand.", image: "/images/prime-nilam.webp" }
];

const profileCardsByLanguage = {
  en: {
    fresh: freshVisionMission,
    green: greenProfileCards,
    prime: primeProfileCards
  },
  id: {
    fresh: [
      {
        title: "Visi",
        text: "Menjadi distributor pasokan pangan tepercaya yang menyediakan komoditas segar, berkualitas, dan mudah diakses untuk masyarakat luas dan partner bisnis."
      },
      {
        title: "Misi",
        text: "Menyediakan produk pangan higienis, menjaga stabilitas pasokan, memberikan nilai kompetitif, dan menghadirkan layanan profesional yang responsif."
      },
      {
        title: "Mengapa Garda Fresh",
        text: "Produk pilihan, pemesanan fleksibel, opsi packaging praktis, dan distribusi andal untuk kebutuhan konsumsi harian maupun pengadaan."
      }
    ],
    green: [
      {
        title: "Visi",
        text: "Menjadi penyedia komoditas energi ramah lingkungan yang kompetitif secara global dengan kualitas konsisten dan standar pasokan tepercaya."
      },
      {
        title: "Misi",
        text: "Menyediakan produk energi berkualitas, mendukung energi alternatif yang lebih bersih, menjaga keberlanjutan bahan baku, dan mengembangkan pasar nasional serta internasional."
      },
      {
        title: "Mengapa Garda Green",
        text: "Kualitas berorientasi ekspor, sourcing bertanggung jawab, pasokan konsisten, dan layanan profesional untuk kemitraan komoditas industri jangka panjang."
      }
    ],
    prime: [
      {
        title: "Visi",
        text: "Menjadi supplier rempah premium Indonesia yang dikenal karena kualitas, konsistensi, dan hubungan pasar global yang tepercaya."
      },
      {
        title: "Misi",
        text: "Menyediakan rempah berkualitas, menjaga aroma dan standar produk, mendukung komoditas lokal, dan membangun perdagangan rempah modern yang berkelanjutan."
      },
      {
        title: "Mengapa Garda Prime",
        text: "Rempah Indonesia terkurasi, standar sourcing premium, kualitas berorientasi ekspor, dan dukungan kemitraan jangka panjang untuk buyer global."
      }
    ]
  }
};

const greenProductsId = [
  {
    name: "Coconut Shell Charcoal",
    subtitle: "Arang Batok Kelapa",
    note:
      "Arang batok kelapa alami dengan performa panas yang kuat untuk kebutuhan industri, retail, dan pasokan berorientasi ekspor.",
    image: "/images/green-coconut-charcoal.webp"
  },
  {
    name: "Charcoal Briquette",
    subtitle: "Arang Briket",
    note:
      "Arang briket compact untuk pembakaran stabil, penggunaan praktis, dan pasokan profesional yang konsisten.",
    image: "/images/green-charcoal-briquette.webp"
  },
  {
    name: "Wood Pellet",
    subtitle: "Bahan Bakar Biomassa Terbarukan",
    note:
      "Wood pellet terbarukan untuk kebutuhan energi yang lebih bersih dengan potensi distribusi scalable dan pasokan jangka panjang.",
    image: "/images/green-wood-pellet.webp"
  }
];

const primeProductsId = primeProducts.map((product) => ({
  ...product,
  note:
    product.name.includes("Vanilla")
      ? "Vanili Indonesia premium untuk kebutuhan kuliner, bakery, flavor, dan aplikasi aroma."
      : product.name.includes("Cinnamon")
        ? "Kayu manis dengan aroma hangat untuk makanan, minuman, dan perdagangan rempah."
        : product.name.includes("Nutmeg")
          ? "Pala pilihan dari Indonesia dengan aroma kaya dan permintaan pasar global yang kuat."
          : product.name.includes("Cloves")
            ? "Cengkeh Indonesia klasik untuk makanan, minuman, fragrance, dan rantai pasok industri."
            : product.name.includes("Black Pepper")
              ? "Lada hitam beraroma tajam untuk pasar kuliner dan wholesale spice."
              : product.name.includes("White Pepper")
                ? "Lada putih bersih dan aromatik untuk distribusi rempah premium dan produksi makanan."
                : product.name.includes("Turmeric")
                  ? "Kunyit kuning untuk bahan makanan, produk herbal, dan aplikasi warna alami."
                  : product.name.includes("Ginger")
                    ? "Jahe untuk kebutuhan minuman, kuliner, dan produk wellness."
                    : product.name.includes("Galangal")
                      ? "Lengkuas aromatik untuk kuliner Indonesia dan distribusi rempah regional."
                      : product.name.includes("Coriander")
                        ? "Ketumbar pilihan untuk seasoning, spice blend, dan pasokan produksi makanan."
                        : product.name.includes("Lemongrass")
                          ? "Serai aromatik untuk kuliner, minuman, dan kebutuhan bahan esensial."
                          : product.name.includes("Tamarind")
                            ? "Asam jawa dengan profil asam-manis untuk saus, minuman, dan food processing."
                            : product.name.includes("Kaffir")
                              ? "Daun jeruk wangi untuk restoran, produksi makanan, dan campuran rempah."
                              : "Komoditas nilam premium untuk fragrance, perfume, dan kebutuhan industri essential oil."
}));

const specsByLanguage = {
  en: {
    title: "Product Specification Guidance",
    description:
      "Every quotation is prepared based on buyer requirements. Share these details so GSN can recommend the most suitable product standard.",
    fresh: [
      ["Product Category", "Fresh vegetables, eggs, and premium rice"],
      ["Common Packaging", "Retail packs, sacks, trays, cartons, or buyer-requested packaging"],
      ["Buyer Use", "Retail, food service, catering, hotels, restaurants, distributors"],
      ["Required Inquiry Details", "Product list, destination, quantity, monthly requirement, packaging, delivery expectation"]
    ],
    green: [
      ["Product Category", "Coconut shell charcoal, charcoal briquette, wood pellet"],
      ["Common Buyer Focus", "Size, shape, moisture, ash, fixed carbon, packaging, burning performance"],
      ["Buyer Use", "BBQ, shisha, retail charcoal, industrial fuel, biomass boilers, cleaner energy programs"],
      ["Required Inquiry Details", "Specification, target market, destination, quantity, packaging, monthly requirement"]
    ],
    prime: [
      ["Product Category", "Vanilla, cinnamon, nutmeg, cloves, peppers, turmeric, ginger, galangal, coriander, lemongrass, tamarind, kaffir lime leaf, patchouli"],
      ["Common Buyer Focus", "Grade, aroma, origin, cleanliness, moisture, cut or whole form, packaging"],
      ["Buyer Use", "Food manufacturing, bakery, beverages, seasoning, spice trading, fragrance, essential oil"],
      ["Required Inquiry Details", "Product, target grade, quantity, destination, packaging, documentation needs"]
    ]
  },
  id: {
    title: "Panduan Spesifikasi Produk",
    description:
      "Setiap quotation disiapkan berdasarkan kebutuhan buyer. Bagikan detail berikut agar GSN dapat merekomendasikan standar produk yang paling sesuai.",
    fresh: [
      ["Kategori Produk", "Sayuran segar, telur, dan beras premium"],
      ["Packaging Umum", "Kemasan retail, karung, tray, karton, atau packaging sesuai permintaan buyer"],
      ["Kebutuhan Buyer", "Retail, food service, catering, hotel, restoran, distributor"],
      ["Detail Inquiry", "Daftar produk, tujuan pengiriman, quantity, kebutuhan bulanan, packaging, estimasi delivery"]
    ],
    green: [
      ["Kategori Produk", "Arang batok kelapa, arang briket, wood pellet"],
      ["Fokus Buyer", "Ukuran, bentuk, moisture, ash, fixed carbon, packaging, performa pembakaran"],
      ["Kebutuhan Buyer", "BBQ, shisha, retail charcoal, industrial fuel, biomass boiler, program energi bersih"],
      ["Detail Inquiry", "Spesifikasi, target market, tujuan pengiriman, quantity, packaging, kebutuhan bulanan"]
    ],
    prime: [
      ["Kategori Produk", "Vanili, kayu manis, pala, cengkeh, lada, kunyit, jahe, lengkuas, ketumbar, serai, asam jawa, daun jeruk, nilam"],
      ["Fokus Buyer", "Grade, aroma, origin, kebersihan, moisture, bentuk potong atau utuh, packaging"],
      ["Kebutuhan Buyer", "Food manufacturing, bakery, minuman, seasoning, spice trading, fragrance, essential oil"],
      ["Detail Inquiry", "Produk, target grade, quantity, tujuan pengiriman, packaging, kebutuhan dokumen"]
    ]
  }
};

const trustByLanguage = {
  en: {
    title: "Why Buyers Can Trust GSN",
    description:
      "GSN supports buyers with clear communication, product-focused inquiry handling, and long-term commodity partnership orientation.",
    items: [
      ["Buyer Requirement Review", "We review product, quantity, destination, packaging, and specification before quotation."],
      ["Product Selection", "Products are discussed based on buyer use case, target market, and required standard."],
      ["Documentation Support", "Document needs can be reviewed according to commodity, destination, and buyer requirements."],
      ["Long-Term Supply Mindset", "GSN is built for repeat cooperation, responsive follow-up, and practical supply planning."]
    ]
  },
  id: {
    title: "Mengapa Buyer Bisa Percaya GSN",
    description:
      "GSN mendukung buyer melalui komunikasi jelas, penanganan inquiry berbasis produk, dan orientasi kemitraan komoditas jangka panjang.",
    items: [
      ["Review Kebutuhan Buyer", "Kami meninjau produk, quantity, tujuan, packaging, dan spesifikasi sebelum quotation."],
      ["Seleksi Produk", "Produk dibahas berdasarkan use case buyer, target market, dan standar yang dibutuhkan."],
      ["Dukungan Dokumen", "Kebutuhan dokumen dapat dibahas sesuai komoditas, negara tujuan, dan requirement buyer."],
      ["Mindset Pasokan Jangka Panjang", "GSN dibangun untuk kerja sama berulang, follow-up responsif, dan perencanaan supply yang praktis."]
    ]
  }
};

const smartInquiryConfig = {
  fresh: {
    title: "Fresh Supply Inquiry",
    titleId: "Inquiry Pasokan Fresh",
    accent: "fresh",
    groups: [
      {
        key: "products",
        label: "Fresh Vegetables",
        labelId: "Sayuran Segar",
        type: "multi",
        options: [
          "Cabbage", "Lettuce", "Water Spinach", "Carrot", "Sweet Corn", "Mustard Greens", "Potato",
          "Garlic", "Shallot", "Tomato", "Cassava", "Green Onion", "Red Chili Pepper", "Cucumber",
          "Bird's Eye Chili", "Pak Choi", "Yardlong Beans", "Aubergine", "Bitter Gourd", "Spinach", "Lemon Basil"
        ]
      },
      {
        key: "products",
        label: "Eggs",
        labelId: "Telur",
        type: "multi",
        options: ["Horn Chicken Eggs", "Kampung Chicken Eggs", "Duck Eggs", "Quail Eggs"]
      },
      {
        key: "products",
        label: "Rice",
        labelId: "Beras",
        type: "multi",
        options: ["Premium Rice 5 kg", "Premium Rice 10 kg", "Premium Rice 25 kg", "Premium Rice 50 kg"]
      },
      {
        key: "buyerRequirement",
        label: "Buyer Requirement",
        labelId: "Kebutuhan Buyer",
        type: "multi",
        options: ["Fresh Harvest", "Export Grade", "Organic", "Cold Storage", "Retail Ready", "Bulk Supply"]
      },
      {
        key: "packaging",
        label: "Packaging",
        labelId: "Packaging",
        type: "multi",
        options: ["Net Bag", "Carton Box", "Plastic Crate", "Vacuum Pack", "Custom Packaging"]
      },
      {
        key: "marketPurpose",
        label: "Market Purpose",
        labelId: "Tujuan Market",
        type: "multi",
        options: ["Supermarket", "Restaurant", "Distributor", "Traditional Market", "Hotel Supply", "International Export"]
      },
      {
        key: "eggSize",
        label: "Egg Size",
        labelId: "Ukuran Telur",
        type: "single",
        options: ["Small", "Medium", "Large"]
      },
      {
        key: "riceFocus",
        label: "Rice Focus",
        labelId: "Fokus Beras",
        type: "multi",
        options: ["Premium Grade", "White Clean Rice", "Low Broken", "Fragrant", "Export Standard"]
      },
      {
        key: "quantity",
        label: "Quantity Needed",
        labelId: "Kebutuhan Quantity",
        type: "single",
        options: ["Trial Order", "Weekly Supply", "Monthly Supply", "Custom Quantity"]
      }
    ]
  },
  green: {
    title: "Energy & Charcoal Export Inquiry",
    titleId: "Inquiry Ekspor Energi & Arang",
    accent: "green",
    groups: [
      {
        key: "products",
        label: "Product Type",
        labelId: "Jenis Produk",
        type: "multi",
        options: ["Coconut Shell Charcoal", "Charcoal Briquette", "Wood Pellet"]
      },
      {
        key: "buyerFocus",
        label: "Buyer Focus",
        labelId: "Fokus Buyer",
        type: "multi",
        options: ["Low Ash", "Long Burning", "Smokeless", "Odorless", "High Calorie", "Export Grade"]
      },
      {
        key: "moisture",
        label: "Moisture",
        labelId: "Moisture",
        type: "single",
        options: ["<5%", "<8%", "Custom"]
      },
      {
        key: "packaging",
        label: "Packaging",
        labelId: "Packaging",
        type: "multi",
        options: ["1kg Box", "5kg Box", "Master Box", "Jumbo Bag", "Custom Packaging"]
      },
      {
        key: "marketPurpose",
        label: "Market Purpose",
        labelId: "Tujuan Market",
        type: "multi",
        options: ["Shisha", "BBQ", "Restaurant", "Retail", "Distributor"]
      },
      {
        key: "quantity",
        label: "Quantity",
        labelId: "Quantity",
        type: "single",
        options: ["Trial Order", "1 Container", "5 Container", "Custom MOQ"]
      }
    ]
  },
  prime: {
    title: "Spices & Commodity Inquiry",
    titleId: "Inquiry Rempah & Komoditas",
    accent: "prime",
    groups: [
      {
        key: "products",
        label: "Product Category",
        labelId: "Kategori Produk",
        type: "multi",
        options: [
          "Vanilla", "Cinnamon", "Nutmeg", "Cloves", "Black Pepper", "White Pepper", "Turmeric",
          "Ginger", "Galangal", "Coriander Seed", "Lemongrass", "Tamarind", "Kaffir Lime Leaf", "Patchouli"
        ]
      },
      {
        key: "formType",
        label: "Form Type",
        labelId: "Bentuk Produk",
        type: "multi",
        options: ["Whole", "Powder", "Cut", "Slice", "Oil"]
      },
      {
        key: "buyerFocus",
        label: "Buyer Focus",
        labelId: "Fokus Buyer",
        type: "multi",
        options: ["Strong Aroma", "Low Moisture", "Clean Sorting", "Export Grade", "Organic"]
      },
      {
        key: "moisture",
        label: "Moisture",
        labelId: "Moisture",
        type: "single",
        options: ["<10%", "<12%", "Custom"]
      },
      {
        key: "packaging",
        label: "Packaging",
        labelId: "Packaging",
        type: "multi",
        options: ["PP Bag", "Kraft Bag", "Vacuum Pack", "Carton Box", "Custom Packaging"]
      },
      {
        key: "documentSupport",
        label: "Document Support",
        labelId: "Dukungan Dokumen",
        type: "multi",
        options: ["COO", "Phytosanitary", "Fumigation", "MSDS", "Lab Test"]
      }
    ]
  }
};

export default function DivisionPage({ division, goBack, requestInquiry }) {
  if (division.id === "fresh") {
    return (
      <>
        <GardaFreshDivision division={division} goBack={goBack} requestInquiry={requestInquiry} />
        <GSNExportAssistant />
      </>
    );
  }

  if (division.id === "green") {
    return (
      <>
        <GardaGreenDivision division={division} goBack={goBack} requestInquiry={requestInquiry} />
        <GSNExportAssistant />
      </>
    );
  }

  if (division.id === "prime") {
    return (
      <>
        <GardaPrimeDivision division={division} goBack={goBack} requestInquiry={requestInquiry} />
        <GSNExportAssistant />
      </>
    );
  }

  return (
    <main className={`division-page theme-${division.id}`}>
      <button className="back-button" type="button" onClick={goBack}>
        <span aria-hidden="true">←</span>
        Back to Company
      </button>

      <section className="division-hero" aria-labelledby={`${division.id}-title`}>
        <div className="division-hero-media">
          <img src={division.image} alt={division.imageAlt} />
        </div>

        <div className="division-hero-content">
          <p className="eyebrow">{division.name}</p>
          <h1 id={`${division.id}-title`}>{division.headline}</h1>
          <p>{division.description}</p>
          <a
            className="button button-dark"
            href={whatsappLink(`Hello Garda Samudra Nusantara, I would like to discuss partnership with ${division.name}.`)}
            target="_blank"
            rel="noreferrer"
          >
            Contact Partnership
          </a>
        </div>
      </section>

      <section className="division-detail" aria-labelledby={`${division.id}-products`}>
        <div>
          <p className="eyebrow">Products • Vision • Mission</p>
          <h2 id={`${division.id}-products`}>{division.name} division profile</h2>
        </div>

        <div className="focus-grid">
          {division.focus.map((item) => (
            <article key={item.title}>
              <span>{item.code}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer values={["Quality", "Reliability", "Consistency"]} />
    </main>
  );
}

function getFreshCatalogId() {
  return catalogProducts.map((group) => ({
    ...group,
    category:
      group.id === "vegetables" ? "Sayuran Segar" : group.id === "eggs" ? "Pasokan Telur" : "Beras Premium",
    title:
      group.id === "vegetables" ? "Katalog Pasokan Sayuran" : group.id === "eggs" ? "Katalog Produk Telur" : "Katalog Beras Premium",
    description:
      group.id === "vegetables"
        ? "Sayuran segar pilihan untuk bisnis kuliner, retail, rumah tangga, dan kebutuhan pasokan pangan harian."
        : group.id === "eggs"
          ? "Pasokan protein andal dengan telur ayam, telur bebek, dan telur puyuh untuk kebutuhan harian dan pengadaan bulk."
          : "Beras premium dengan pilihan kilogram fleksibel untuk rumah tangga, retail, food-service, dan kebutuhan institusi.",
    products: group.products?.map((item) => ({
      ...item,
      note: "Produk pilihan untuk kebutuhan retail, kuliner, food service, dan pasokan harian sesuai permintaan buyer."
    })),
    packs: group.packs?.map((pack) => ({
      ...pack,
      note:
        pack.size === "5 kg"
          ? "Kemasan praktis untuk kebutuhan rumah tangga dan kebutuhan harian kecil."
          : pack.size === "10 kg"
            ? "Kemasan seimbang untuk dapur keluarga dan bisnis kecil."
            : pack.size === "25 kg"
              ? "Opsi efisien untuk retail, catering, dan operasional kuliner."
              : "Pasokan bulk untuk pengadaan lebih besar dan kebutuhan institusi."
    }))
  }));
}

function GardaFreshDivision({ division, goBack, requestInquiry }) {
  const language = useDivisionLanguage();
  const text = commonText[language];
  const copy = divisionCopy[language].fresh;
  const profileCards = profileCardsByLanguage[language].fresh;
  const catalog = language === "id" ? getFreshCatalogId() : catalogProducts;
  const [selectedProductId, setSelectedProductId] = useState(catalogProducts[0].id);
  const selectedProduct = catalog.find((product) => product.id === selectedProductId) || catalog[0];

  return (
    <main className="fresh-store-page">
      <nav className="fresh-store-nav" aria-label="Garda Fresh navigation">
        <button className="fresh-back-button" type="button" onClick={goBack} aria-label="Back to Company">
          <span aria-hidden="true">←</span>
          {text.back}
        </button>
        <a
          href={whatsappLink("Hello Garda Samudra Nusantara, I would like to contact Garda Fresh.")}
          target="_blank"
          rel="noreferrer"
        >
          {text.contact}
        </a>
      </nav>

      <section className="fresh-store-hero">
        <div className="fresh-store-copy">
          <p className="fresh-kicker">{copy.kicker}</p>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroText}</p>
          <div className="fresh-actions">
            <a href="#fresh-profile">{text.profile}</a>
            <a href="#fresh-products">{text.viewCatalog}</a>
          </div>
        </div>

        <div className="fresh-hero-visual">
          <img
            src="/images/fresh-vegetable-mix.webp"
            alt="Fresh vegetables for Garda Fresh food supply"
          />
        </div>
      </section>

      <section className="fresh-profile-section" id="fresh-profile">
        <div className="fresh-section-heading">
          <p className="fresh-kicker">{copy.aboutKicker}</p>
          <h2>{copy.aboutTitle}</h2>
          <p>{copy.aboutText}</p>
        </div>

        <div className="fresh-profile-grid">
          {profileCards.map((item) => (
            <article key={item.title}>
              <span>{item.title}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

      </section>

      <section className="fresh-products-section" id="fresh-products">
        <div className="fresh-section-heading">
          <p className="fresh-kicker">{text.productCatalog}</p>
          <h2>{copy.catalogTitle}</h2>
          <p>{copy.catalogText}</p>
        </div>

        <div className="fresh-catalog-grid">
          {catalog.map((product) => (
            <button
              className={`fresh-catalog-card ${selectedProduct?.id === product.id ? "is-selected" : ""}`}
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              type="button"
            >
              <img src={product.image} alt="" />
              <div className="catalog-card-body">
                <span>{product.category}</span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>

                {product.products ? (
                  <ul className="catalog-chip-list">
                    {product.products.slice(0, 6).map((item) => (
                      <li key={item.name}>{item.name}</li>
                    ))}
                  </ul>
                ) : null}

                {product.packs ? <strong>{language === "id" ? "Klik untuk melihat pilihan kilogram" : "Click to view kilogram options"}</strong> : null}
              </div>
            </button>
          ))}
        </div>

        {selectedProduct ? (
          <ProductCatalogDetail language={language} product={selectedProduct} onClose={() => setSelectedProductId("")} />
        ) : null}
      </section>

      <ProductSpecificationSection divisionId="fresh" language={language} requestInquiry={requestInquiry} />
      <TrustSignalSection language={language} />

      <section className="fresh-supply-note">
        <div>
          <p className="fresh-kicker">{text.supplyPartnership}</p>
          <h2>{copy.closingTitle}</h2>
        </div>
        <div className="division-quote-panel">
          <p>{copy.closingText}</p>
          <button type="button" onClick={() => requestInquiry?.(division.id)}>
            {text.requestQuotation}
          </button>
        </div>
      </section>

      <Footer values={text.footerValues} description={text.footerDescription} />
    </main>
  );
}

function GardaGreenDivision({ division, goBack, requestInquiry }) {
  const language = useDivisionLanguage();
  const text = commonText[language];
  const copy = divisionCopy[language].green;
  const profileCards = profileCardsByLanguage[language].green;
  const products = language === "id" ? greenProductsId : greenProducts;

  return (
    <main className="green-lab-page">
      <div className="green-orbit-field" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--i": index + 1,
              left: `${(index * 43) % 96}%`,
              top: `${(index * 61) % 92}%`
            }}
          ></span>
        ))}
      </div>

      <nav className="green-lab-nav" aria-label="Garda Green navigation">
        <button type="button" onClick={goBack}>
          <span aria-hidden="true">&lt;</span>
          {text.back}
        </button>
        <a
          href={whatsappLink("Hello Garda Samudra Nusantara, I would like to contact Garda Green.")}
          target="_blank"
          rel="noreferrer"
        >
          {text.contact}
        </a>
      </nav>

      <section className="green-lab-hero" aria-labelledby="green-title">
        <div className="green-hero-copy">
          <p className="green-kicker">{copy.kicker}</p>
          <h1 id="green-title">{copy.heroTitle}</h1>
          <p>{copy.heroText}</p>
          <div className="green-actions">
            <a href="#green-profile">{text.profile}</a>
            <a href="#green-catalog">{text.viewCatalog}</a>
          </div>
        </div>

        <div className="green-hero-stage" aria-label="Garda Green product visual">
          <img
            className="green-product-hero"
            src="/images/green-hero-products.webp"
            alt="Wood pellet, coconut shell charcoal, and charcoal briquette products"
          />
        </div>
      </section>

      <section className="green-profile-section" id="green-profile">
        <div className="green-section-heading">
          <p className="green-kicker">{copy.profileKicker}</p>
          <h2>{copy.profileTitle}</h2>
          <p>{copy.profileText}</p>
        </div>

        <div className="green-profile-grid">
          {profileCards.map((item) => (
            <article key={item.title}>
              <span>{item.title}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="green-catalog-section" id="green-catalog">
        <div className="green-section-heading center">
          <p className="green-kicker">{text.productCatalog}</p>
          <h2>{copy.catalogTitle}</h2>
        </div>

        <div className="green-catalog-layout">
          <div className="green-product-list">
            {products.map((product) => (
              <article key={product.name}>
                <CatalogImage item={product} fallback="/images/garda-green-card.webp" />
                <div>
                  <span>{product.subtitle}</span>
                  <strong>{product.name}</strong>
                  <p>{product.note}</p>
                  <a href={whatsappLink(stockMessage(product.name))} target="_blank" rel="noreferrer">
                    {text.askStock}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ProductSpecificationSection divisionId="green" language={language} requestInquiry={requestInquiry} />
      <TrustSignalSection language={language} />

      <section className="green-closing-cta">
        <p className="green-kicker">{text.partnershipReady}</p>
        <h2>{copy.closingTitle}</h2>
        <button type="button" onClick={() => requestInquiry?.(division.id)}>
          {text.requestQuotation}
        </button>
      </section>

      <Footer values={text.footerValues} description={text.footerDescription} />
    </main>
  );
}

function GardaPrimeDivision({ division, goBack, requestInquiry }) {
  const language = useDivisionLanguage();
  const text = commonText[language];
  const copy = divisionCopy[language].prime;
  const profileCards = profileCardsByLanguage[language].prime;
  const products = language === "id" ? primeProductsId : primeProducts;

  return (
    <main className="prime-gallery-page">
      <div className="prime-aurora" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--i": index + 1,
              left: `${(index * 47) % 96}%`,
              top: `${(index * 59) % 88}%`
            }}
          ></span>
        ))}
      </div>

      <nav className="prime-nav" aria-label="Garda Prime navigation">
        <button type="button" onClick={goBack}>
          <span aria-hidden="true">&lt;</span>
          {text.back}
        </button>
        <a
          href={whatsappLink("Hello Garda Samudra Nusantara, I would like to contact Garda Prime.")}
          target="_blank"
          rel="noreferrer"
        >
          {text.contact}
        </a>
      </nav>

      <section className="prime-hero" aria-labelledby="prime-title">
        <div className="prime-copy">
          <p className="prime-kicker">{copy.kicker}</p>
          <h1 id="prime-title">{copy.heroTitle}</h1>
          <p>{copy.heroText}</p>
          <div className="prime-actions">
            <a href="#prime-profile">{text.profile}</a>
            <a href="#prime-catalog">{text.viewCatalog}</a>
          </div>
        </div>

        <div className="prime-hero-art">
          <img src="/images/prime-hero-products.webp" alt="Premium Indonesian spices" />
        </div>
      </section>

      <section className="prime-profile-section" id="prime-profile">
        <div className="prime-section-heading">
          <p className="prime-kicker">{copy.profileKicker}</p>
          <h2>{copy.profileTitle}</h2>
          <p>{copy.profileText}</p>
        </div>

        <div className="prime-profile-grid">
          {profileCards.map((item) => (
            <article key={item.title}>
              <span>{item.title}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="prime-catalog-section" id="prime-catalog">
        <div className="prime-section-heading center">
          <p className="prime-kicker">{copy.catalogKicker}</p>
          <h2>{copy.catalogTitle}</h2>
        </div>

        <div className="prime-product-grid">
          {products.map((product) => (
            <article key={product.name}>
              <img src={product.image} alt="" />
              <div>
                <span>Garda Prime</span>
                <strong>{product.name}</strong>
                <p>{product.note}</p>
                <a href={whatsappLink(stockMessage(product.name))} target="_blank" rel="noreferrer">
                  {text.askStock}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ProductSpecificationSection divisionId="prime" language={language} requestInquiry={requestInquiry} />
      <TrustSignalSection language={language} />

      <section className="prime-closing-cta">
        <p className="prime-kicker">{text.exportReady}</p>
        <h2>{copy.closingTitle}</h2>
        <button type="button" onClick={() => requestInquiry?.(division.id)}>
          {text.requestQuotation}
        </button>
      </section>

      <Footer values={text.footerValues} description={text.footerDescription} />
    </main>
  );
}

function ProductSpecificationSection({ divisionId, language, requestInquiry }) {
  const config = smartInquiryConfig[divisionId];
  const [selections, setSelections] = useState({});
  const selectedProducts = selections.products || [];
  const selectedCount = Object.values(selections).reduce((total, value) => total + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
  const title = language === "id" ? config.titleId : config.title;
  const labels = {
    en: {
      badge: "Smart Export Specification",
      description:
        "Select buyer requirements, packaging, market purpose, and export preferences. Your selected specification will be attached directly to the GSN inquiry form.",
      preview: "Quotation Preview",
      empty: "Select specification cards to build your inquiry summary.",
      ai: "AI Product Recommendation",
      aiText: "Future-ready placeholder for recommended export grade, suggested packaging, and suggested MOQ.",
      attach: "Attach to Inquiry Form",
      selected: "Selected Options",
      products: "Products",
      next: "Buyer only needs to complete contact details in the inquiry form."
    },
    id: {
      badge: "Spesifikasi Ekspor Pintar",
      description:
        "Pilih kebutuhan buyer, packaging, tujuan market, dan preferensi ekspor. Spesifikasi yang dipilih akan langsung masuk ke form inquiry GSN.",
      preview: "Preview Quotation",
      empty: "Pilih kartu spesifikasi untuk membuat ringkasan inquiry.",
      ai: "AI Product Recommendation",
      aiText: "Placeholder future-ready untuk recommended export grade, suggested packaging, dan suggested MOQ.",
      attach: "Masukkan ke Form Inquiry",
      selected: "Opsi Terpilih",
      products: "Produk",
      next: "Buyer hanya perlu melengkapi detail kontak di form inquiry."
    }
  }[language];

  function toggleOption(group, option) {
    setSelections((current) => {
      const currentValue = current[group.key] || (group.type === "multi" ? [] : "");

      if (group.type === "single") {
        return {
          ...current,
          [group.key]: currentValue === option ? "" : option
        };
      }

      const nextValue = currentValue.includes(option)
        ? currentValue.filter((item) => item !== option)
        : [...currentValue, option];

      return {
        ...current,
        [group.key]: nextValue
      };
    });
  }

  function isSelected(group, option) {
    const value = selections[group.key];
    return Array.isArray(value) ? value.includes(option) : value === option;
  }

  function selectionLines() {
    return config.groups
      .map((group) => {
        const value = selections[group.key];
        const normalized = (Array.isArray(value) ? value : value ? [value] : [])
          .filter((item) => group.options.includes(item));
        return normalized.length
          ? `${language === "id" ? group.labelId : group.label}: ${normalized.join(", ")}`
          : "";
      })
      .filter(Boolean);
  }

  function attachToForm() {
    const specification = selectionLines().join("\n");
    const packaging = Array.isArray(selections.packaging) ? selections.packaging.join(", ") : selections.packaging || "";
    const quantity = selections.quantity || "";

    const payload = {
      divisionId,
      selectedProducts,
      packagingRequest: packaging,
      productSpecification: specification,
      quantity,
      message: `${title}\n${specification}`
    };

    window.sessionStorage.setItem("gsn-smart-inquiry", JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("gsn:smartInquiry", { detail: payload }));

    if (requestInquiry) {
      requestInquiry(divisionId);
      return;
    }

    document.getElementById("gsnformneo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const lines = selectionLines();

  return (
    <section className={`smart-inquiry-section smart-${config.accent}`}>
      <div className="smart-inquiry-heading">
        <span>{labels.badge}</span>
        <h2>{title}</h2>
        <p>{labels.description}</p>
      </div>

      <div className="smart-inquiry-layout">
        <div className="smart-option-zone">
          {config.groups.map((group) => (
            <article className="smart-option-group" key={`${group.key}-${group.label}`}>
              <div>
                <span>{group.type === "single" ? "Single Select" : "Multi Select"}</span>
                <h3>{language === "id" ? group.labelId : group.label}</h3>
              </div>
              <div className="smart-chip-grid">
                {group.options.map((option) => (
                  <button
                    className={isSelected(group, option) ? "is-selected" : ""}
                    key={option}
                    onClick={() => toggleOption(group, option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="smart-inquiry-summary">
          <div className="summary-glow" aria-hidden="true"></div>
          <span>{labels.preview}</span>
          <h3>{selectedCount} {labels.selected}</h3>

          {lines.length ? (
            <div className="summary-lines">
              {lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="summary-empty">{labels.empty}</p>
          )}

          <div className="smart-ai-placeholder">
            <strong>{labels.ai}</strong>
            <p>{labels.aiText}</p>
          </div>

          <p className="summary-note">{labels.next}</p>
          <button disabled={!selectedCount} onClick={attachToForm} type="button">
            {labels.attach}
          </button>
        </aside>
      </div>
    </section>
  );
}

function TrustSignalSection({ language }) {
  const trust = trustByLanguage[language];

  return (
    <section className="division-trust-section">
      <div className="division-spec-heading">
        <span>{language === "id" ? "Kepercayaan Buyer" : "Buyer Confidence"}</span>
        <h2>{trust.title}</h2>
        <p>{trust.description}</p>
      </div>
      <div className="division-trust-grid">
        {trust.items.map(([title, text]) => (
          <article key={title}>
            <span>{title}</span>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductCatalogDetail({ product, onClose, language = "en" }) {
  const text = commonText[language];

  return (
    <aside className="fresh-catalog-detail" aria-label={`${product.title} details`}>
      <button type="button" onClick={onClose}>{text.close}</button>
      <div>
        <span>{product.category}</span>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
      </div>

      {product.products ? (
        <div className="fresh-item-grid">
          {product.products.map((item) => (
            <article className="fresh-item-card" key={item.name}>
              <CatalogImage item={item} fallback={product.image} />
              <div>
                <strong>{item.name}</strong>
                <p>{item.note}</p>
                <a href={whatsappLink(stockMessage(item.name))} target="_blank" rel="noreferrer">
                  {text.askStock}
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {product.packs ? (
        <div className="rice-pack-grid">
          {product.packs.map((pack) => (
            <article key={pack.size}>
              <img
                src={pack.image}
                alt=""
                onError={(event) => {
                  event.currentTarget.src = product.image;
                }}
              />
              <strong>{pack.size}</strong>
              <p>{pack.note}</p>
              <a href={whatsappLink(stockMessage(`Premium Rice ${pack.size}`))} target="_blank" rel="noreferrer">
                {text.askStock}
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function CatalogImage({ item, fallback }) {
  if (item.crop) {
    return (
      <div
        className="catalog-crop-image"
        style={{
          backgroundImage: `url(${item.crop.src})`,
          backgroundPosition: item.crop.position
        }}
        aria-hidden="true"
      ></div>
    );
  }

  return (
    <img
      src={item.image}
      alt=""
      onError={(event) => {
        event.currentTarget.src = fallback;
      }}
    />
  );
}
