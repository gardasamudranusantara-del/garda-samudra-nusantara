export const companyProfile = {
  name: "Garda Samudra Nusantara",
  shortName: "GSN",
  tagline: "Quality | Reliability | Consistency",
  description:
    "Garda Samudra Nusantara (GSN) is an Indonesian trading and export-oriented company supplying selected agricultural products, eco-energy commodities, and premium spices for domestic and international buyers.",
  scope:
    "Through Garda Fresh, Garda Green, and Garda Prime, GSN connects reliable Indonesian commodity supply with buyers seeking consistent quality, responsive service, and long-term partnership value.",
  vision:
    "To become a trusted Indonesian trading and export partner recognized for quality, reliability, consistency, and sustainable global competitiveness.",
  closing:
    "GSN is built for buyers who value dependable communication, carefully selected products, and long-term commodity partnerships from Indonesia."
};

export const metrics = [
  { value: "3", label: "Integrated Business Divisions" },
  { value: "Global", label: "Market Orientation" },
  { value: "Gresik", label: "Indonesia" }
];

export const brandValues = ["Quality", "Reliability", "Consistency"];

export const missionItems = [
  "Supply selected Indonesian commodities with consistent quality standards.",
  "Build professional, transparent, and long-term buyer relationships.",
  "Support Indonesian producers by connecting local commodities to wider markets.",
  "Respond quickly to inquiries, quotations, specifications, and buyer requirements.",
  "Develop modern, sustainable, and export-ready trading operations.",
  "Bridge local supply capacity with domestic and international demand."
];

export const valueDetails = [
  {
    title: "Quality",
    text: "Selecting products with clear attention to buyer requirements, handling, and market expectations."
  },
  {
    title: "Reliability",
    text: "Supporting buyers with responsive communication, dependable follow-up, and partnership-focused service."
  },
  {
    title: "Consistency",
    text: "Maintaining steady product standards, service quality, and long-term business commitment."
  }
];

export const advantages = [
  "Selected Indonesian commodities",
  "Export-oriented communication",
  "Professional and responsive quotation support",
  "Consistent supply planning",
  "Integrated multi-division network",
  "Support for Indonesian local products",
  "Long-term partnership orientation",
  "Buyer-focused product standards",
  "Sustainability-minded commodity development"
];

export const futureGoals = [
  "Expand reliable sourcing and distribution networks across Indonesia",
  "Develop stronger international market access for Indonesian commodities",
  "Add strategic product lines based on buyer demand",
  "Improve product standards, handling, and supply capacity",
  "Build GSN into a recognized Indonesian commodity partner for global buyers"
];

export const contactLinks = [
  {
    label: "WhatsApp / Telephone",
    value: "085190907967",
    href: "https://wa.me/6285190907967?text=Hello%20Garda%20Samudra%20Nusantara%2C%20I%20would%20like%20to%20contact%20your%20team."
  },
  {
    label: "Email",
    value: "gardasamudranusantara@gmail.com",
    href: "mailto:gardasamudranusantara@gmail.com"
  },
  {
    label: "Instagram",
    value: "@gsn.corp",
    href: "https://www.instagram.com/gsn.corp"
  },
  {
    label: "LinkedIn",
    value: "Garda Samudra Nusantara",
    href: "https://www.linkedin.com/search/results/companies/?keywords=Garda%20Samudra%20Nusantara"
  },
  {
    label: "Website",
    value: "www.gardasamudranusantara.com",
    href: "https://www.gardasamudranusantara.com"
  },
  {
    label: "Address",
    value: "Gresik, Indonesia",
    href: "#contact"
  }
];

export const partnerLabels = [
  "Domestic Buyers",
  "International Buyers",
  "Local Producers",
  "Business Partners"
];

export const capabilities = advantages.map((item, index) => ({
  title: item,
  text:
    index === 0
      ? "GSN focuses on selected Indonesian commodities across fresh food supply, eco-energy products, and premium spices."
      : index === 1
        ? "GSN communicates with an export-oriented mindset, helping buyers clarify product, packaging, quantity, and destination requirements."
        : index === 2
          ? "Fast, professional follow-up helps buyers move from inquiry to quotation with clearer requirements."
          : index === 3
            ? "Supply planning is prepared around product availability, buyer requirements, and long-term cooperation potential."
            : index === 4
              ? "Garda Fresh, Garda Green, and Garda Prime allow buyers to explore multiple commodity categories through one company."
              : index === 5
                ? "GSN supports Indonesian local commodities so they can reach higher-value domestic and international opportunities."
                : index === 6
                  ? "GSN prioritizes relationships that can grow beyond one transaction into repeat and long-term cooperation."
                  : index === 7
                    ? "Product standards are discussed based on buyer needs, target market, packaging, and specification."
                    : "Through Garda Green, GSN supports alternative energy and sustainability-minded commodity development."
}));

export const processSteps = [
  {
    code: "Vision",
    title: "Trusted Indonesian commodities for global buyers",
    text: companyProfile.vision
  },
  {
    code: "Mission",
    title: "Responsive service and long-term cooperation",
    text: "GSN supplies selected commodities, supports Indonesian producers, and helps buyers move from inquiry to quotation with professional communication."
  },
  {
    code: "Goals",
    title: "Stronger access to international markets",
    text: "GSN develops sourcing, distribution, and export readiness so Indonesian commodities can compete in wider markets."
  }
];

export const divisions = [
  {
    id: "fresh",
    name: "Garda Fresh",
    category: "Food Supply Division",
    headline: "Reliable Fresh Food Supply",
    summary:
      "Fresh vegetables, eggs, and premium rice for buyers who need practical, consistent food supply.",
    description:
      "Garda Fresh supplies selected fresh vegetables, eggs, and premium rice for retail, food service, catering, hospitality, and recurring procurement needs.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Fresh vegetables and food supply at a market",
    email: "gardasamudranusantara@gmail.com",
    focus: [
      {
        code: "Products",
        title: "Vegetables, Eggs, and Rice",
        text: "Fresh vegetables, horn chicken eggs, kampung chicken eggs, duck eggs, quail eggs, and premium rice in multiple packaging options."
      },
      {
        code: "Vision",
        title: "Trusted Food Supply Partner",
        text: "To become a trusted food supply partner for buyers who need freshness, availability, and consistent service."
      },
      {
        code: "Mission",
        title: "Fresh, Stable, and Practical",
        text: "Provide selected food products, maintain supply planning, offer practical packaging options, and prioritize responsive service."
      }
    ]
  },
  {
    id: "green",
    name: "Garda Green",
    category: "Eco-Energy Division",
    headline: "Eco-Energy Commodities For Industrial Buyers",
    summary:
      "Coconut shell charcoal, charcoal briquette, and wood pellet for energy, BBQ, shisha, retail, and industrial needs.",
    description:
      "Garda Green focuses on eco-energy commodities for buyers seeking Indonesian charcoal products and renewable biomass fuel with clear specifications and long-term supply potential.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Green forest representing environmentally friendly energy",
    email: "gardasamudranusantara@gmail.com",
    focus: [
      {
        code: "Products",
        title: "Charcoal and Wood Pellet",
        text: "Coconut shell charcoal, charcoal briquette, and wood pellet for eco-energy, BBQ, shisha, retail, and industrial requirements."
      },
      {
        code: "Vision",
        title: "Globally Competitive",
        text: "To become a globally competitive Indonesian eco-energy commodity partner."
      },
      {
        code: "Mission",
        title: "Quality and Sustainability",
        text: "Provide quality energy products, support cleaner alternatives, maintain responsible sourcing, and develop domestic and international markets."
      }
    ]
  },
  {
    id: "prime",
    name: "Garda Prime",
    category: "Premium Spice Division",
    headline: "Premium Indonesian Spices For Global Buyers",
    summary:
      "Selected Indonesian spices for food manufacturing, spice trading, beverage, bakery, fragrance, and seasoning markets.",
    description:
      "Garda Prime supplies Indonesian spice commodities with attention to aroma, application, buyer requirements, and long-term international trading potential.",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Premium Indonesian spices",
    email: "gardasamudranusantara@gmail.com",
    focus: [
      {
        code: "Products",
        title: "Indonesian Spice Commodities",
        text: "Vanilla, cinnamon, nutmeg, cloves, black pepper, white pepper, turmeric, ginger, galangal, coriander seed, lemongrass, tamarind, kaffir lime leaf, and patchouli."
      },
      {
        code: "Vision",
        title: "Premium Spice Partner",
        text: "To become a trusted Indonesian spice partner known for quality, reliability, and consistency."
      },
      {
        code: "Mission",
        title: "Aroma, Standards, and Wider Markets",
        text: "Supply quality spices, maintain aroma and product standards, support local commodities, and build modern sustainable spice trading."
      }
    ]
  }
];

export const products = [
  {
    name: "Vegetables, Eggs, and Rice",
    division: "Garda Fresh",
    description:
      "Fresh vegetables, eggs, and premium rice for food service, retail, hospitality, and recurring procurement needs.",
    image:
      "https://images.unsplash.com/photo-1543168256-418811576931?q=80&w=1000&auto=format&fit=crop",
    imageAlt: "Fresh food and daily essentials"
  },
  {
    name: "Coconut Shell Charcoal, Briquettes, Wood Pellet",
    division: "Garda Green",
    description:
      "Eco-energy commodities for BBQ, shisha, industrial heating, biomass fuel, retail, and export-oriented supply.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1000&auto=format&fit=crop",
    imageAlt: "Green nature for environmentally friendly energy products"
  },
  {
    name: "Premium Indonesian Spices",
    division: "Garda Prime",
    description:
      "Vanilla, cinnamon, nutmeg, cloves, peppers, turmeric, ginger, galangal, coriander seed, lemongrass, tamarind, kaffir lime leaf, and patchouli for global buyers.",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop",
    imageAlt: "Premium Indonesian spices"
  }
];
