"use client";

import { useEffect, useRef, useState } from "react";

const whatsappHref =
  "https://wa.me/6285190907967?text=Hello%20Garda%20Samudra%20Nusantara%2C%20I%20would%20like%20to%20discuss%20my%20export%20inquiry.";
const emailHref = "mailto:gardasamudranusantara@gmail.com";

const quickQuestions = [
  "What products do you sell?",
  "What is wood pellet?",
  "Why choose GSN?",
  "What is GSN vision and mission?",
  "How do I request quotation?",
  "Recommend products for my business"
];

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  text: "Welcome to Garda Samudra Nusantara.\nHow may I assist your global inquiry today?"
};

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function detectQuestionLanguage(input) {
  const text = input.toLowerCase();
  const idSignals = [
    "apa", "apakah", "bagaimana", "gimana", "kenapa", "mengapa", "berapa", "bisa", "boleh",
    "saya", "kami", "anda", "produk", "jual", "harga", "minta", "butuh", "pesan", "kirim",
    "sampel", "contoh", "tujuan", "negara", "pengiriman", "dokumen", "pembayaran",
    "sayuran", "telur", "beras", "arang", "rempah", "vanili", "kayu manis", "pala",
    "cengkeh", "lada", "kunyit", "jahe", "lengkuas", "ketumbar", "serai", "asam jawa",
    "daun jeruk", "nilam", "batok", "briket"
  ];

  const enSignals = [
    "what", "how", "why", "which", "where", "when", "can", "do you", "price", "sample",
    "shipping", "payment", "quotation", "product", "export", "country", "destination"
  ];

  const idScore = idSignals.filter((signal) => text.includes(signal)).length;
  const enScore = enSignals.filter((signal) => text.includes(signal)).length;

  return idScore > enScore ? "id" : "en";
}

const divisionSummary =
  "GSN has three main divisions: Garda Fresh for fresh vegetables, eggs, and rice; Garda Green for coconut shell charcoal, charcoal briquette, and wood pellet; and Garda Prime for Indonesian spices such as vanilla, cinnamon, nutmeg, cloves, pepper, turmeric, ginger, galangal, coriander seed, lemongrass, tamarind, kaffir lime leaf, and patchouli.";

const recommendationPrompt =
  "To help our team recommend the best option, please share your destination country, target quantity, packaging request, and product specification.";

const idDivisionSummary =
  "GSN memiliki tiga divisi utama: Garda Fresh untuk sayuran segar, telur, dan beras; Garda Green untuk arang batok kelapa, arang briket, dan wood pellet; serta Garda Prime untuk rempah Indonesia seperti vanili, kayu manis, pala, cengkeh, lada, kunyit, jahe, lengkuas, ketumbar, serai, asam jawa, daun jeruk, dan nilam.";

const idRecommendationPrompt =
  "Agar tim kami bisa merekomendasikan pilihan terbaik, mohon bagikan negara tujuan, target quantity, kebutuhan packaging, dan spesifikasi produk.";

const productKnowledge = [
  {
    terms: ["cabbage", "kubis", "kol"],
    name: "Cabbage / Kol / Kubis",
    division: "Garda Fresh",
    answer: "Cabbage is a leafy vegetable commonly used by retail markets, restaurants, catering suppliers, and food processors. It is suitable for fresh vegetable supply programs and recurring food service demand."
  },
  {
    terms: ["lettuce", "selada"],
    name: "Lettuce / Selada",
    division: "Garda Fresh",
    answer: "Lettuce is a fresh leafy vegetable used for salads, burgers, hotels, restaurants, and modern retail. It is suitable for buyers who need visually fresh vegetables with careful handling."
  },
  {
    terms: ["water spinach", "kangkung"],
    name: "Water Spinach / Kangkung",
    division: "Garda Fresh",
    answer: "Water spinach is a popular green vegetable for Asian cuisine, restaurants, catering, and retail supply. It is best requested with clear destination and freshness requirements."
  },
  {
    terms: ["carrot", "wortel"],
    name: "Carrot / Wortel",
    division: "Garda Fresh",
    answer: "Carrot is a versatile root vegetable used by food service, retail, juice, soup, and frozen or processed food buyers. It is suitable for recurring fresh produce demand."
  },
  {
    terms: ["sweet corn", "jagung manis", "corn"],
    name: "Sweet Corn / Jagung Manis",
    division: "Garda Fresh",
    answer: "Sweet corn is a fresh vegetable commodity used for retail, food service, snacks, catering, and processing. It is recommended for buyers looking for naturally sweet fresh produce."
  },
  {
    terms: ["mustard greens", "sawi hijau", "mustard"],
    name: "Mustard Greens / Sawi Hijau",
    division: "Garda Fresh",
    answer: "Mustard greens are leafy vegetables commonly used in Asian dishes, noodles, soups, and food service menus. They are suitable for restaurants and market supply."
  },
  {
    terms: ["potato", "kentang"],
    name: "Potato / Kentang",
    division: "Garda Fresh",
    answer: "Potato is a staple vegetable for retail, hotels, restaurants, catering, and food processing. It is suitable for buyers who need flexible volume and stable supply planning."
  },
  {
    terms: ["garlic", "bawang putih"],
    name: "Garlic / Bawang Putih",
    division: "Garda Fresh",
    answer: "Garlic is an essential cooking ingredient for food service, retail, processing, seasoning, and distribution businesses. It is a strong option for buyers needing high-demand kitchen staples."
  },
  {
    terms: ["shallot", "bawang merah"],
    name: "Shallot / Bawang Merah",
    division: "Garda Fresh",
    answer: "Shallot is a key Indonesian and Asian cooking ingredient used by restaurants, food processors, and retail markets. It is suitable for recurring staple ingredient supply."
  },
  {
    terms: ["tomato", "tomat"],
    name: "Tomato / Tomat",
    division: "Garda Fresh",
    answer: "Tomato is used for fresh retail, restaurants, sauces, salads, and food processing. It is recommended for buyers who need fresh produce for daily kitchen operations."
  },
  {
    terms: ["cassava", "singkong"],
    name: "Cassava / Singkong",
    division: "Garda Fresh",
    answer: "Cassava is a root crop used for food processing, snacks, flour, starch-related products, and traditional food supply. It can be suitable for buyers seeking Indonesian agricultural commodities."
  },
  {
    terms: ["green onion", "daun bawang", "spring onion"],
    name: "Green Onion / Daun Bawang",
    division: "Garda Fresh",
    answer: "Green onion is an aromatic fresh vegetable used in restaurants, noodles, soups, and catering. It is suitable for food service buyers needing fresh herbs and garnish ingredients."
  },
  {
    terms: ["red chili", "cabai merah", "red chili pepper"],
    name: "Red Chili Pepper / Cabai Merah",
    division: "Garda Fresh",
    answer: "Red chili pepper is a high-demand ingredient for restaurants, seasoning, sambal, sauces, and food processing. It is suitable for buyers who need spicy fresh produce supply."
  },
  {
    terms: ["cucumber", "timun"],
    name: "Cucumber / Timun",
    division: "Garda Fresh",
    answer: "Cucumber is a refreshing vegetable used for salads, restaurants, retail, garnish, and fresh food menus. It is suitable for hospitality and retail supply."
  },
  {
    terms: ["bird's eye chili", "birds eye chili", "cabai rawit", "rawit"],
    name: "Bird's Eye Chili / Cabai Rawit",
    division: "Garda Fresh",
    answer: "Bird's eye chili is a small hot chili used for spicy sauces, restaurants, food processing, and retail demand. It is recommended when buyers need stronger heat intensity."
  },
  {
    terms: ["pak choi", "pakcoy", "bok choy"],
    name: "Pak Choi / Pakcoy",
    division: "Garda Fresh",
    answer: "Pak choi is a leafy vegetable used in Asian cuisine, stir-fry menus, soups, and modern retail. It is suitable for restaurants and fresh vegetable distributors."
  },
  {
    terms: ["yardlong beans", "kacang panjang", "long bean"],
    name: "Yardlong Beans / Kacang Panjang",
    division: "Garda Fresh",
    answer: "Yardlong beans are fresh legumes used in Asian cooking, retail markets, and restaurant menus. They are suitable for buyers seeking diverse fresh vegetable assortments."
  },
  {
    terms: ["aubergine", "eggplant", "terong"],
    name: "Aubergine / Terong",
    division: "Garda Fresh",
    answer: "Aubergine is a fresh vegetable used in restaurant menus, retail supply, and traditional cuisines. It is recommended for buyers needing mixed vegetable supply."
  },
  {
    terms: ["bitter gourd", "pare"],
    name: "Bitter Gourd / Pare",
    division: "Garda Fresh",
    answer: "Bitter gourd is a vegetable known for its distinctive bitter taste and use in Asian dishes. It is suitable for specialty vegetable buyers and traditional food markets."
  },
  {
    terms: ["spinach", "bayam"],
    name: "Spinach / Bayam",
    division: "Garda Fresh",
    answer: "Spinach is a leafy green vegetable used for retail, restaurants, catering, and healthy food menus. It is suitable for buyers looking for popular fresh greens."
  },
  {
    terms: ["lemon basil", "kemangi", "basil"],
    name: "Lemon Basil / Kemangi",
    division: "Garda Fresh",
    answer: "Lemon basil is an aromatic herb used in Indonesian and Asian cuisine, fresh menus, and specialty food service. It is suitable for buyers needing herbs with fresh aroma."
  },
  {
    terms: ["horn chicken eggs", "horn chicken egg", "chicken eggs", "egg"],
    name: "Horn Chicken Eggs",
    division: "Garda Fresh",
    answer: "Horn chicken eggs are suitable for household retail, restaurants, bakeries, hotels, catering, and food processing. They are recommended for buyers with regular protein supply needs."
  },
  {
    terms: ["kampung chicken eggs", "kampung egg", "ayam kampung"],
    name: "Kampung Chicken Eggs",
    division: "Garda Fresh",
    answer: "Kampung chicken eggs are valued by buyers looking for traditional local egg options. They can be suitable for premium retail, restaurants, and specialty food demand."
  },
  {
    terms: ["duck eggs", "duck egg", "telur bebek"],
    name: "Duck Eggs",
    division: "Garda Fresh",
    answer: "Duck eggs are used for culinary, bakery, salted egg, and food processing needs. They are recommended for buyers seeking richer egg products or specialty egg supply."
  },
  {
    terms: ["quail eggs", "quail egg", "telur puyuh"],
    name: "Quail Eggs",
    division: "Garda Fresh",
    answer: "Quail eggs are small eggs used for snacks, catering, retail packs, restaurants, and processed food. They are suitable for buyers seeking unique egg products."
  },
  {
    terms: ["premium rice", "rice 5", "rice 10", "rice 25", "rice 50", "beras", "rice"],
    name: "Premium Rice",
    division: "Garda Fresh",
    answer: "Premium rice is available in 5 kg, 10 kg, 25 kg, and 50 kg packaging options. It is recommended for retail, hotels, restaurants, catering, distributors, and buyers needing staple food supply."
  },
  {
    terms: ["coconut shell charcoal", "arang batok", "coconut charcoal", "batok kelapa"],
    name: "Coconut Shell Charcoal / Arang Batok Kelapa",
    division: "Garda Green",
    answer: "Coconut shell charcoal is made from coconut shells and is valued for strong heat and natural Indonesian raw material. It is suitable for BBQ, shisha, retail charcoal, and industrial use depending on specification."
  },
  {
    terms: ["charcoal briquette", "briquette", "briket"],
    name: "Charcoal Briquette / Arang Briket",
    division: "Garda Green",
    answer: "Charcoal briquette is processed charcoal formed into consistent shapes for easier handling, stable burning, and export-friendly packaging. It is commonly suitable for BBQ, shisha, retail, and hospitality markets."
  },
  {
    terms: ["wood pellet", "pellet", "biomass", "boiler", "renewable fuel"],
    name: "Wood Pellet",
    division: "Garda Green",
    answer: "Wood pellet is a renewable biomass fuel made from compressed wood material such as sawdust or wood residue. It is commonly used for industrial heating, biomass boilers, power generation, and cleaner alternative fuel programs."
  },
  {
    terms: ["vanilla", "vanili"],
    name: "Vanilla / Vanili",
    division: "Garda Prime",
    answer: "Vanilla is a premium aromatic spice used in bakery, desserts, beverages, fragrance, and flavoring industries. It is recommended for buyers seeking high-value Indonesian spice commodities."
  },
  {
    terms: ["cinnamon", "kayu manis"],
    name: "Cinnamon / Kayu Manis",
    division: "Garda Prime",
    answer: "Cinnamon is an aromatic bark spice used in bakery, beverages, spice blends, herbal products, and food manufacturing. It is suitable for buyers seeking warm sweet aroma profiles."
  },
  {
    terms: ["nutmeg", "pala"],
    name: "Nutmeg / Pala",
    division: "Garda Prime",
    answer: "Nutmeg is an Indonesian spice used in seasoning, bakery, beverages, sauces, and spice trading. It is suitable for buyers seeking distinctive warm and slightly sweet spice notes."
  },
  {
    terms: ["cloves", "clove", "cengkeh"],
    name: "Cloves / Cengkeh",
    division: "Garda Prime",
    answer: "Cloves are aromatic flower buds used in spice blends, beverages, food manufacturing, herbal products, and fragrance-related industries. They are a strong option for premium spice buyers."
  },
  {
    terms: ["black pepper", "lada hitam"],
    name: "Black Pepper / Lada Hitam",
    division: "Garda Prime",
    answer: "Black pepper is a globally used spice for seasoning, food manufacturing, restaurants, retail, and spice trading. It is recommended for buyers needing a high-demand everyday spice."
  },
  {
    terms: ["white pepper", "lada putih"],
    name: "White Pepper / Lada Putih",
    division: "Garda Prime",
    answer: "White pepper has a clean spicy flavor often used in sauces, soups, seasoning blends, and food manufacturing. It is suitable for buyers who need lighter-colored pepper applications."
  },
  {
    terms: ["turmeric", "kunyit"],
    name: "Turmeric / Kunyit",
    division: "Garda Prime",
    answer: "Turmeric is a yellow rhizome spice used in seasoning, curry blends, herbal drinks, food coloring, and wellness-related products. It is recommended for buyers seeking functional spice commodities."
  },
  {
    terms: ["ginger", "jahe"],
    name: "Ginger / Jahe",
    division: "Garda Prime",
    answer: "Ginger is a rhizome spice used in beverages, herbal products, seasoning, bakery, and food manufacturing. It is suitable for buyers seeking warm, spicy, and aromatic ingredients."
  },
  {
    terms: ["galangal", "lengkuas"],
    name: "Galangal / Lengkuas",
    division: "Garda Prime",
    answer: "Galangal is an aromatic rhizome used in Southeast Asian cooking, spice pastes, soups, sauces, and food processing. It is suitable for buyers focused on authentic Asian flavor profiles."
  },
  {
    terms: ["coriander seed", "ketumbar", "coriander"],
    name: "Coriander Seed / Ketumbar",
    division: "Garda Prime",
    answer: "Coriander seed is used in spice blends, seasoning, sauces, processed food, and culinary manufacturing. It is recommended for buyers needing a warm citrus-like spice profile."
  },
  {
    terms: ["lemongrass", "serai"],
    name: "Lemongrass / Serai",
    division: "Garda Prime",
    answer: "Lemongrass is an aromatic herb used in tea, beverages, soups, sauces, seasoning, and wellness products. It is suitable for buyers seeking fresh citrus aroma."
  },
  {
    terms: ["tamarind", "asam jawa"],
    name: "Tamarind / Asam Jawa",
    division: "Garda Prime",
    answer: "Tamarind is a sour fruit pulp used in sauces, beverages, candies, seasoning, and traditional cuisine. It is recommended for buyers seeking natural sour flavor ingredients."
  },
  {
    terms: ["kaffir lime leaf", "daun jeruk", "lime leaf"],
    name: "Kaffir Lime Leaf / Daun Jeruk",
    division: "Garda Prime",
    answer: "Kaffir lime leaf is an aromatic leaf used in Southeast Asian cuisine, spice blends, soups, sauces, and food service. It is suitable for buyers needing strong citrus fragrance."
  },
  {
    terms: ["patchouli", "nilam"],
    name: "Patchouli / Nilam",
    division: "Garda Prime",
    answer: "Patchouli is an aromatic commodity often associated with essential oil, fragrance, perfume, cosmetics, and aromatic product industries. It is recommended for buyers looking for Indonesian fragrance-related raw materials."
  }
];

function getProductResponse(text) {
  const product = productKnowledge.find((item) => includesAny(text, item.terms));

  if (!product) {
    return "";
  }

  return `${product.name} is part of ${product.division}. ${product.answer} I recommend sending your target quantity, destination country, packaging preference, and required specification through the inquiry form so GSN can prepare the most suitable quotation.`;
}

function getSmartInquiry(text) {
  const product = productKnowledge.find((item) => includesAny(text, item.terms));

  if (!product) {
    return null;
  }

  const divisionId = product.division === "Garda Fresh" ? "fresh" : product.division === "Garda Green" ? "green" : "prime";

  return {
    divisionId,
    selectedProducts: [product.name],
    message: `NusaBot lead capture: Buyer asked about ${product.name}. Please follow up with destination, quantity, packaging, and specification.`
  };
}

function getIndonesianProductResponse(text) {
  const product = productKnowledge.find((item) => includesAny(text, item.terms));

  if (!product) {
    return "";
  }

  const divisionNotes = {
    "Garda Fresh": "Produk ini termasuk dalam Garda Fresh, divisi GSN untuk pasokan sayuran segar, telur, dan beras.",
    "Garda Green": "Produk ini termasuk dalam Garda Green, divisi GSN untuk komoditas eco-energy seperti arang dan wood pellet.",
    "Garda Prime": "Produk ini termasuk dalam Garda Prime, divisi GSN untuk komoditas rempah Indonesia pilihan."
  };

  return `${product.name} termasuk dalam ${product.division}. ${divisionNotes[product.division] || ""} Produk ini cocok untuk buyer yang membutuhkan pasokan sesuai spesifikasi dan kebutuhan pasar. ${idRecommendationPrompt}`;
}

function createAssistantResponse(input) {
  const text = input.toLowerCase();
  const language = detectQuestionLanguage(input);

  if (language === "id") {
    const productResponse = getIndonesianProductResponse(text);

    if (includesAny(text, ["visi", "misi", "tujuan"])) {
      return "Visi Garda Samudra Nusantara adalah menjadi partner perdagangan dan ekspor Indonesia yang tepercaya, dengan fokus pada quality, reliability, dan consistency. Misi GSN adalah menyediakan komoditas yang dapat diandalkan, membangun kemitraan jangka panjang, mendukung komoditas lokal Indonesia, dan membantu buyer melalui layanan inquiry serta quotation yang responsif.";
    }

    if (includesAny(text, ["kenapa", "mengapa", "pilih gsn", "memilih gsn", "keunggulan", "kelebihan"])) {
      return `Buyer memilih Garda Samudra Nusantara karena GSN memiliki pilihan produk yang jelas, komunikasi berorientasi ekspor, dan fokus pada quality, reliability, serta consistency. ${idDivisionSummary} Jika Anda menjelaskan jenis bisnis dan kebutuhan produk, NusaBot bisa membantu merekomendasikan divisi atau produk yang paling sesuai.`;
    }

    if (includesAny(text, ["rekomendasi", "sarankan", "cocok", "produk terbaik", "bisnis saya", "usaha saya"])) {
      return "Untuk restoran, hotel, catering, retail, atau distributor bahan pangan, saya merekomendasikan Garda Fresh seperti sayuran segar, telur, dan beras premium. Untuk kebutuhan BBQ, shisha, biomass fuel, atau eco-energy, Garda Green cocok dengan arang batok kelapa, arang briket, dan wood pellet. Untuk manufaktur makanan, spice trading, bakery, minuman, fragrance, atau seasoning, Garda Prime cocok dengan vanili, kayu manis, cengkeh, pala, lada, jahe, kunyit, dan nilam. Mohon bagikan jenis bisnis dan negara tujuan agar rekomendasinya lebih tepat.";
    }

    if (productResponse) {
      return productResponse;
    }

    if (includesAny(text, ["produk", "jual", "menyediakan", "katalog", "komoditas"])) {
      return `GSN menyediakan produk pertanian, komoditas arang dan biomass fuel, serta rempah Indonesia. ${idDivisionSummary} Untuk inquiry yang lebih akurat, saya sarankan pilih divisi yang sesuai lalu kirim quantity, negara tujuan, packaging, dan spesifikasi melalui form inquiry.`;
    }

    if (includesAny(text, ["fresh", "sayur", "sayuran", "telur", "beras", "kubis", "selada", "wortel", "cabai"])) {
      return "Garda Fresh menyediakan sayuran segar, telur, dan beras untuk buyer seperti retail, restoran, hotel, catering, distributor, dan food service. Produk sayuran mencakup kubis, selada, kangkung, wortel, jagung manis, sawi hijau, kentang, bawang putih, bawang merah, tomat, singkong, daun bawang, cabai merah, timun, cabai rawit, pakcoy, kacang panjang, terong, pare, bayam, dan kemangi. Untuk kebutuhan pasokan rutin, mohon cantumkan monthly requirement di form inquiry.";
    }

    if (includesAny(text, ["wood pellet", "biomass", "boiler", "bahan bakar"])) {
      return `Wood pellet adalah bahan bakar biomassa terbarukan yang dibuat dari material kayu yang dipadatkan, seperti serbuk kayu atau residu kayu. Produk ini umum digunakan untuk pemanas industri, biomass boiler, pembangkit energi, dan program bahan bakar alternatif yang lebih bersih. Untuk kebutuhan sustainable energy, saya merekomendasikan Garda Green wood pellet. ${idRecommendationPrompt}`;
    }

    if (includesAny(text, ["arang batok", "batok kelapa", "bbq", "shisha", "hookah"])) {
      return `Arang batok kelapa dibuat dari tempurung kelapa dan dikenal memiliki performa panas yang baik, tergantung spesifikasi produk. Produk ini cocok untuk kebutuhan BBQ, shisha, retail charcoal, atau kebutuhan industri. Saya merekomendasikan Garda Green coconut shell charcoal untuk buyer yang mencari pasokan arang alami Indonesia. ${idRecommendationPrompt}`;
    }

    if (includesAny(text, ["briket", "briquette"])) {
      return `Arang briket adalah arang yang diproses dan dibentuk agar lebih konsisten, mudah digunakan, dan cocok untuk packaging export. Produk ini sering digunakan untuk BBQ, shisha, retail, dan hospitality market. ${idRecommendationPrompt}`;
    }

    if (includesAny(text, ["arang", "green", "energi", "fuel"])) {
      return `Garda Green berfokus pada komoditas eco-energy: arang batok kelapa, arang briket, dan wood pellet. Untuk buyer BBQ atau shisha, saya merekomendasikan arang briket atau arang batok kelapa. Untuk renewable fuel dan industrial heating, saya merekomendasikan wood pellet. ${idRecommendationPrompt}`;
    }

    if (includesAny(text, ["rempah", "prime", "vanili", "kayu manis", "pala", "cengkeh", "lada", "kunyit", "jahe", "nilam"])) {
      return "Garda Prime menyediakan rempah Indonesia seperti vanili, kayu manis, pala, cengkeh, lada hitam, lada putih, kunyit, jahe, lengkuas, ketumbar, serai, asam jawa, daun jeruk, dan nilam. Untuk bakery, flavoring, dan aroma premium, saya merekomendasikan vanili atau kayu manis. Untuk seasoning dan spice trading, cengkeh, pala, lada, kunyit, jahe, ketumbar, dan serai bisa menjadi pilihan. Untuk fragrance atau essential oil, nilam adalah opsi yang kuat.";
    }

    if (includesAny(text, ["ekspor", "export", "malaysia", "negara", "internasional", "global", "tujuan"])) {
      return "Ya, Garda Samudra Nusantara mendukung perdagangan internasional dan kemitraan global, termasuk Malaysia dan negara tujuan lain sesuai kebutuhan buyer. Untuk arahan pengiriman, dokumen, dan ketersediaan produk, mohon bagikan negara tujuan, kota atau port, produk, dan estimasi quantity.";
    }

    if (includesAny(text, ["sample", "sampel", "contoh"])) {
      return "Ya, permintaan sample dapat dibahas tergantung ketersediaan produk dan negara tujuan pengiriman. Mohon bagikan produk, negara tujuan, quantity, dan informasi perusahaan melalui form inquiry atau WhatsApp.";
    }

    if (includesAny(text, ["minimum", "moq", "minimal order", "minimum order"])) {
      return "MOQ atau minimum order dapat berbeda tergantung produk, packaging, negara tujuan, dan ketersediaan pasokan. Mohon kirim kebutuhan produk dan quantity melalui form inquiry agar tim GSN dapat memberi arahan MOQ yang lebih akurat.";
    }

    if (includesAny(text, ["dokumen", "sertifikat", "certificate", "documents"])) {
      return "Dokumen ekspor dan dokumen produk bergantung pada jenis komoditas, negara tujuan, dan kebutuhan buyer. Tim GSN dapat membahas dokumen yang tersedia setelah produk, quantity, spesifikasi, dan tujuan pengiriman dikonfirmasi.";
    }

    if (includesAny(text, ["pengiriman", "shipping", "delivery", "lead time", "berapa lama"])) {
      return "Waktu pengiriman bergantung pada ketersediaan produk, negara tujuan, metode logistik, dan kebutuhan ekspor. Mohon bagikan destinasi dan produk yang diminta agar tim GSN dapat memberi arahan pengiriman yang lebih tepat.";
    }

    if (includesAny(text, ["quotation", "penawaran", "harga", "price", "target price", "minta"])) {
      return "Anda dapat meminta quotation melalui form inquiry atau menghubungi tim GSN via WhatsApp dan email. Mohon sertakan divisi, produk, quantity, packaging request, negara tujuan, dan spesifikasi produk.";
    }

    if (includesAny(text, ["pembayaran", "payment", "bayar", "terms"])) {
      return "Metode pembayaran dan payment terms dapat bergantung pada produk, jumlah pesanan, negara tujuan, dan model kerja sama. Silakan hubungi tim GSN untuk pembahasan detail sesuai inquiry Anda.";
    }

    if (includesAny(text, ["kontak", "whatsapp", "email", "instagram", "lokasi", "alamat"])) {
      return "Anda dapat menghubungi Garda Samudra Nusantara melalui WhatsApp di +62 851-9090-7967, email gardasamudranusantara@gmail.com, Instagram @gsn.corp, atau menghubungi tim kami yang berbasis di Gresik, Indonesia.";
    }

    return `NusaBot dapat membantu menjawab informasi tentang GSN, inquiry ekspor, produk Garda Fresh, Garda Green, Garda Prime, quotation, sample, dokumen, dan kontak. ${idRecommendationPrompt} Untuk kebutuhan yang sangat detail atau custom, silakan hubungi tim GSN secara langsung.`;
  }

  if (includesAny(text, ["vision", "mission", "visi", "misi", "purpose", "goal"])) {
    return "Garda Samudra Nusantara's vision is to become a trusted Indonesian trading and export partner that brings high-quality local commodities to global markets with quality, reliability, and consistency. Our mission is to provide dependable products, build long-term international partnerships, support Indonesian commodity supply chains, and serve buyers with responsive quotation and export assistance.";
  }

  if (includesAny(text, ["why choose", "why gsn", "choose gsn", "kenapa", "advantage", "benefit", "trusted"])) {
    return `Buyers choose Garda Samudra Nusantara because we combine product range, export-minded service, and a clear focus on quality, reliability, and consistency. ${divisionSummary} If you tell NusaBot your business type, I can recommend the most suitable GSN division and product category.`;
  }

  if (includesAny(text, ["recommend", "suggest", "suitable", "best product", "cocok", "which product", "my business"])) {
    return "For restaurants, hotels, catering, or retail supply, I recommend Garda Fresh products such as vegetables, eggs, and premium rice. For biomass fuel, BBQ, shisha, or eco-energy buyers, Garda Green is suitable with coconut shell charcoal, charcoal briquette, and wood pellet. For food manufacturing, spice trading, bakery, beverage, fragrance, or seasoning businesses, Garda Prime is the best direction with vanilla, cinnamon, cloves, nutmeg, pepper, ginger, turmeric, and patchouli. Please share your industry and destination so we can guide your quotation more accurately.";
  }

  const productResponse = getProductResponse(text);

  if (productResponse) {
    return productResponse;
  }

  if (includesAny(text, ["product", "sell", "provide", "catalog", "commodity", "commodities"])) {
    return `We provide agricultural products, charcoal products, biomass fuel, and Indonesian spice commodities. ${divisionSummary} For a buyer who needs regular supply, I recommend starting with the division that matches your use case, then sending quantity and destination through the inquiry form.`;
  }

  if (includesAny(text, ["fresh", "vegetable", "egg", "rice", "cabbage", "lettuce", "carrot", "chili"])) {
    return "Garda Fresh provides fresh vegetables, eggs, and rice for buyers such as retailers, food service businesses, distributors, restaurants, hotels, and catering suppliers. The vegetable range includes cabbage, lettuce, water spinach, carrot, sweet corn, mustard greens, potato, garlic, shallot, tomato, cassava, green onion, red chili pepper, cucumber, bird's eye chili, pak choi, yardlong beans, aubergine, bitter gourd, spinach, and lemon basil. Egg products include horn chicken eggs, kampung chicken eggs, duck eggs, and quail eggs. Rice is available in premium 5 kg, 10 kg, 25 kg, and 50 kg options. For stable recurring supply, I recommend sharing your monthly requirement in the inquiry form.";
  }

  if (includesAny(text, ["wood pellet", "pellet", "biomass", "boiler", "renewable fuel"])) {
    return `Wood pellet is a renewable biomass fuel made from compressed wood material such as sawdust or wood residue. It is commonly used for industrial heating, biomass boilers, power generation, and cleaner alternative fuel programs. For customers looking for sustainable energy supply, I recommend Garda Green wood pellet. ${recommendationPrompt}`;
  }

  if (includesAny(text, ["coconut shell", "arang batok", "bbq", "shisha", "hookah"])) {
    return `Coconut shell charcoal is made from coconut shells and is valued for strong heat, longer burning performance, and cleaner use depending on specification. It can be suitable for BBQ, shisha, retail charcoal, or industrial needs. I recommend Garda Green coconut shell charcoal if your priority is natural Indonesian charcoal supply. ${recommendationPrompt}`;
  }

  if (includesAny(text, ["briquette", "briket"])) {
    return `Charcoal briquette is processed charcoal formed into consistent shapes for easier handling, stable burning, and export-friendly packaging. It is often suitable for BBQ, shisha, and retail markets. I recommend Garda Green charcoal briquette if you need consistent size, packaging, and burning performance. ${recommendationPrompt}`;
  }

  if (includesAny(text, ["charcoal", "green", "energy", "fuel"])) {
    return `Garda Green focuses on eco-energy commodities: coconut shell charcoal, charcoal briquette, and wood pellet. For BBQ or shisha buyers, I recommend charcoal briquette or coconut shell charcoal. For renewable fuel and industrial heating, I recommend wood pellet. ${recommendationPrompt}`;
  }

  if (includesAny(text, ["spice", "spices", "prime", "vanilla", "cinnamon", "nutmeg", "clove", "pepper", "turmeric", "ginger", "patchouli"])) {
    return "Garda Prime provides premium Indonesian spice commodities including vanilla, cinnamon, nutmeg, cloves, black pepper, white pepper, turmeric, ginger, galangal, coriander seed, lemongrass, tamarind, kaffir lime leaf, and patchouli. For bakery, flavoring, and premium aroma needs, I recommend vanilla and cinnamon. For seasoning and spice trading, I recommend cloves, nutmeg, pepper, turmeric, ginger, coriander seed, and lemongrass. For fragrance or essential oil related inquiries, patchouli can be a strong option.";
  }

  if (includesAny(text, ["export", "malaysia", "country", "countries", "international", "global", "destination"])) {
    return "Yes, Garda Samudra Nusantara supports international export and global trading partnerships, including Malaysia and other international destinations. For destination-specific shipping, product availability, and documentation, please share your country, port or city, product, and estimated quantity.";
  }

  if (includesAny(text, ["sample", "samples"])) {
    return "Yes. Sample requests are available depending on product availability and shipping destination. Please share the product, destination country, quantity, and company details through our inquiry form or WhatsApp.";
  }

  if (includesAny(text, ["minimum", "moq", "min order", "minimum order"])) {
    return "Minimum order quantity may depend on the selected product, packaging, destination, and supply availability. Please submit your product and quantity requirements through the inquiry form for accurate MOQ guidance.";
  }

  if (includesAny(text, ["document", "documents", "certificate", "certification"])) {
    return "Export documents and product documentation depend on the commodity, destination, and buyer requirements. Our team can discuss available commercial and product documents after confirming the product, quantity, specification, and shipping destination.";
  }

  if (includesAny(text, ["shipping", "delivery", "lead time", "how long"])) {
    return "Shipping time depends on product availability, destination, logistics method, and export requirements. Please share your destination and requested product so our team can provide the most accurate shipping guidance.";
  }

  if (includesAny(text, ["quotation", "quote", "price", "pricing", "target price", "request"])) {
    return "You can request a quotation through our inquiry form or contact our team directly via WhatsApp or email. Please include your selected division, product, quantity, packaging request, destination country, and any product specifications.";
  }

  if (includesAny(text, ["payment", "pay", "terms"])) {
    return "Payment method and terms may depend on the product, order size, destination, and cooperation model. Please contact our team directly for detailed assistance regarding your inquiry.";
  }

  if (includesAny(text, ["contact", "whatsapp", "email", "instagram", "location", "address"])) {
    return "You can contact Garda Samudra Nusantara via WhatsApp at +62 851-9090-7967, email at gardasamudranusantara@gmail.com, Instagram @gsn.corp, or visit our company base in Gresik, Indonesia.";
  }

  return `NusaBot can help with GSN company information, export inquiries, Garda Fresh products, Garda Green charcoal and biomass products, Garda Prime spices, quotation guidance, samples, documents, and contact routes. ${recommendationPrompt} For very detailed or custom requirements, please contact our team directly for assistance.`;
}

export default function GSNExportAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [suggestedInquiry, setSuggestedInquiry] = useState(null);
  const scrollRef = useRef(null);
  const showSuggestions = open && messages.length === 1 && !typing;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  function sendQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed || typing) {
      return;
    }

    const nextMessages = [
      ...messages,
      { id: `user-${Date.now()}`, role: "user", text: trimmed }
    ];
    const smartInquiry = getSmartInquiry(trimmed.toLowerCase());

    setMessages((current) => [
      ...current,
      nextMessages[nextMessages.length - 1]
    ]);
    setInput("");
    setTyping(true);

    window.setTimeout(async () => {
      let answer = "";

      try {
        const response = await fetch("/api/nusabot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: nextMessages.slice(0, -1).map((message) => ({
              role: message.role,
              text: message.text
            }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          answer = data.answer;
        }
      } catch {
        answer = "";
      }

      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", text: answer || createAssistantResponse(trimmed) }
      ]);
      setSuggestedInquiry(smartInquiry);
      setTyping(false);
    }, 900);
  }

  function useSuggestedInquiry() {
    if (!suggestedInquiry) {
      return;
    }

    const conversationSummary = messages
      .slice(-6)
      .map((message) => `${message.role}: ${message.text}`)
      .join("\n")
      .slice(0, 1400);

    window.sessionStorage.setItem("gsn-smart-inquiry", JSON.stringify(suggestedInquiry));
    window.dispatchEvent(new CustomEvent("gsn:smartInquiry", { detail: suggestedInquiry }));
    document.getElementById("gsnformneo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "nusabot_lead_capture",
        label: suggestedInquiry.selectedProducts.join(", "),
        path: window.location.pathname,
        source: "nusabot",
        metadata: suggestedInquiry
      }),
      keepalive: true
    }).catch(() => {});
    fetch("/api/nusabot/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...suggestedInquiry,
        message: `${suggestedInquiry.message}\n\nConversation summary:\n${conversationSummary}`
      }),
      keepalive: true
    }).catch(() => {});
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(input);
  }

  return (
    <div className={`gsn-ai-assistant ${open ? "is-open" : ""}`}>
      {open ? <div className="ai-page-blur" aria-hidden="true"></div> : null}

      <button
        className="ai-floating-button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close NusaBot" : "Open NusaBot"}
      >
        <span className="ai-orb-core">
          <img src="/images/nusabot.webp" alt="NusaBot assistant" />
        </span>
        <span className="ai-orb-ring"></span>
        <i></i>
        <i></i>
        <i></i>
      </button>

      {open ? (
        <section className="ai-chat-window" aria-label="NusaBot chatbot">
          <header className="ai-chat-header">
            <div className="ai-avatar">
              <img src="/images/nusabot.webp" alt="NusaBot assistant" />
            </div>
            <div>
              <p>NusaBot</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              x
            </button>
          </header>

          <div className="ai-message-list" ref={scrollRef}>
            {messages.map((message) => (
              <article className={`ai-message ai-message-${message.role}`} key={message.id}>
                <p>{message.text}</p>
              </article>
            ))}

            {typing ? (
              <article className="ai-message ai-message-assistant">
                <div className="ai-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </article>
            ) : null}

            {!typing && suggestedInquiry ? (
              <button className="ai-lead-capture" type="button" onClick={useSuggestedInquiry}>
                Use this product in inquiry form
              </button>
            ) : null}
          </div>

          <form className="ai-chat-input" onSubmit={handleSubmit}>
            {showSuggestions ? (
              <div className="ai-quick-questions">
                {quickQuestions.map((question) => (
                  <button key={question} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => sendQuestion(question)}>
                    {question}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="ai-input-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask NusaBot about products, export, samples, or quotation..."
              />
              <div className="ai-side-actions">
                <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="Contact via WhatsApp">WA</a>
                <a href={emailHref} aria-label="Contact via email">Email</a>
              </div>
              <button type="submit" disabled={typing || !input.trim()}>
                Send
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
