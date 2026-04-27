export interface ServiceSuggestion {
  category: string;
  slug: string;
  emoji: string;
}

interface PredictResponse {
  predicted_category: string;
}

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || "http://127.0.0.1:8000";

const SERVICE_MAPPING: Record<string, ServiceSuggestion> = {
  plumber: { category: "Plumber", slug: "plumber", emoji: "🔧" },
  electrician: { category: "Electrician", slug: "electrician", emoji: "⚡" },
  electrical: { category: "Electrician", slug: "electrician", emoji: "⚡" },
  cleaner: { category: "Cleaner", slug: "cleaner", emoji: "🧹" },
  cleaning: { category: "Cleaner", slug: "cleaner", emoji: "🧹" },
  painter: { category: "Painter", slug: "painter", emoji: "🎨" },
  painting: { category: "Painter", slug: "painter", emoji: "🎨" },
  doctor: { category: "Doctor", slug: "doctor", emoji: "🩺" },
  medical: { category: "Doctor", slug: "doctor", emoji: "🩺" },
  "ac technician": { category: "AC Technician", slug: "appliance-repair", emoji: "❄️" },
  "ac & appliance": { category: "AC Technician", slug: "appliance-repair", emoji: "❄️" },
  "appliance repair": { category: "AC Technician", slug: "appliance-repair", emoji: "❄️" },
  carpenter: { category: "Carpenter", slug: "carpenter", emoji: "🪚" },
  mechanic: { category: "Mechanic", slug: "mechanic", emoji: "🚗" },
  "salon & spa": { category: "Salon & Spa", slug: "salon", emoji: "💇" },
  salon: { category: "Salon & Spa", slug: "salon", emoji: "💇" },
  "pest control": { category: "Pest Control", slug: "pest-control", emoji: "🐛" },
  "bathroom renovation": { category: "Bathroom Renovation", slug: "bathroom-renovation", emoji: "🚿" },
  "packers & movers": { category: "Packers & Movers", slug: "packers-movers", emoji: "📦" },
  "laundry & ironing": { category: "Laundry & Ironing", slug: "laundry", emoji: "🧺" },
  gardening: { category: "Gardening", slug: "gardening", emoji: "🌿" },
  "cook & chef": { category: "Cook & Chef", slug: "cook", emoji: "👨‍🍳" },
  babysitter: { category: "Babysitter", slug: "babysitter", emoji: "👶" },
  "pet care": { category: "Pet Care", slug: "pet-care", emoji: "🐶" },
  "fitness trainer": { category: "Fitness Trainer", slug: "fitness", emoji: "🏋️" },
  "home tutor": { category: "Home Tutor", slug: "tutor", emoji: "📚" },
  "emergency services": { category: "Emergency Services", slug: "emergency", emoji: "🚨" },
};

function normalizeCategory(rawCategory: string): string {
  const normalized = rawCategory
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Handle common category variants from different model versions.
  if (normalized.includes("electric")) {
    return "electrician";
  }

  if (normalized.includes("clean")) {
    return "cleaner";
  }

  if (normalized.includes("paint")) {
    return "painter";
  }

  if (normalized.includes("medic") || normalized.includes("doctor")) {
    return "doctor";
  }

  if (normalized.includes("plumb") || normalized.includes("pipe") || normalized.includes("leak")) {
    return "plumber";
  }

  if (normalized.includes("carpent") || normalized.includes("wood") || normalized.includes("furniture")) {
    return "carpenter";
  }

  if (normalized.includes("mechanic") || normalized.includes("engine") || normalized.includes("vehicle") || normalized.includes("car") || normalized.includes("bike")) {
    return "mechanic";
  }

  if (normalized.includes("salon") || normalized.includes("spa") || normalized.includes("haircut") || normalized.includes("makeup")) {
    return "salon & spa";
  }

  if (normalized.includes("pest") || normalized.includes("termite") || normalized.includes("cockroach") || normalized.includes("rat")) {
    return "pest control";
  }

  if (normalized.includes("bathroom") && normalized.includes("renov")) {
    return "bathroom renovation";
  }

  if (normalized.includes("pack") || normalized.includes("move") || normalized.includes("shifting") || normalized.includes("relocation")) {
    return "packers & movers";
  }

  if (normalized.includes("laundry") || normalized.includes("ironing") || normalized.includes("dry clean")) {
    return "laundry & ironing";
  }

  if (normalized.includes("garden") || normalized.includes("lawn") || normalized.includes("plant")) {
    return "gardening";
  }

  if (normalized.includes("cook") || normalized.includes("chef") || normalized.includes("meal") || normalized.includes("catering")) {
    return "cook & chef";
  }

  if (normalized.includes("babysit") || normalized.includes("nanny") || normalized.includes("child care") || normalized.includes("baby")) {
    return "babysitter";
  }

  if (normalized.includes("pet") || normalized.includes("dog") || normalized.includes("cat")) {
    return "pet care";
  }

  if (normalized.includes("fitness") || normalized.includes("trainer") || normalized.includes("yoga") || normalized.includes("workout")) {
    return "fitness trainer";
  }

  if (normalized.includes("tutor") || normalized.includes("tuition") || normalized.includes("teacher") || normalized.includes("study")) {
    return "home tutor";
  }

  if (normalized.includes("emergency") || normalized.includes("urgent") || normalized.includes("sos") || normalized.includes("critical")) {
    return "emergency services";
  }

  if (normalized.includes("ac") && normalized.includes("tech")) {
    return "ac technician";
  }

  if (normalized.includes("ac") || normalized.includes("air conditioner") || normalized.includes("cooling")) {
    return "ac technician";
  }

  if (normalized.includes("fridge") || normalized.includes("refrig") || normalized.includes("washing") || normalized.includes("microwave") || normalized.includes("geyser") || normalized.includes("appliance")) {
    return "ac & appliance";
  }

  return normalized;
}

export function getServiceSuggestion(category: string): ServiceSuggestion | null {
  const normalized = normalizeCategory(category);
  return SERVICE_MAPPING[normalized] || null;
}

const KEYWORD_RULES: Array<{ category: string; keywords: string[] }> = [
  {
    category: "Electrician",
    keywords: ["switch", "switchboard", "switch board", "fan", "socket", "wire", "wiring", "light", "power", "sparking", "electric"],
  },
  {
    category: "Plumber",
    keywords: ["pipe", "water leak", "leak", "tap", "drain", "sink", "toilet", "bathroom leak"],
  },
  {
    category: "AC Technician",
    keywords: ["ac", "air conditioner", "not cooling", "cooling", "compressor", "gas refill"],
  },
  {
    category: "AC & Appliance",
    keywords: ["fridge", "refrigerator", "washing machine", "microwave", "geyser", "heater", "appliance", "not working"],
  },
  {
    category: "Cleaner",
    keywords: ["clean", "cleaning", "dirty", "mopping", "dusting", "sanitize"],
  },
  {
    category: "Painter",
    keywords: ["paint", "painting", "wall color", "repaint", "wall peel"],
  },
  {
    category: "Doctor",
    keywords: ["fever", "headache", "pain", "medical", "doctor", "sick", "nausea"],
  },
  {
    category: "Carpenter",
    keywords: ["door", "furniture", "wood", "cabinet", "table", "carpenter"],
  },
  {
    category: "Mechanic",
    keywords: ["bike", "car", "engine", "vehicle", "tyre", "battery", "mechanic"],
  },
  {
    category: "Salon & Spa",
    keywords: ["salon", "spa", "haircut", "makeup", "facial", "grooming"],
  },
  {
    category: "Pest Control",
    keywords: ["pest", "termite", "cockroach", "rat", "mosquito", "bug"],
  },
  {
    category: "Bathroom Renovation",
    keywords: ["bathroom renovation", "tiling", "waterproofing", "washroom"],
  },
  {
    category: "Packers & Movers",
    keywords: ["packers", "movers", "shifting", "relocation", "move"],
  },
  {
    category: "Laundry & Ironing",
    keywords: ["laundry", "ironing", "dry clean", "press clothes"],
  },
  {
    category: "Gardening",
    keywords: ["garden", "lawn", "plant", "landscaping", "tree trimming"],
  },
  {
    category: "Cook & Chef",
    keywords: ["cook", "chef", "meal", "catering"],
  },
  {
    category: "Babysitter",
    keywords: ["babysitter", "baby sitting", "nanny", "child care", "newborn"],
  },
  {
    category: "Pet Care",
    keywords: ["pet", "dog", "cat", "pet grooming", "pet walking"],
  },
  {
    category: "Fitness Trainer",
    keywords: ["fitness", "trainer", "yoga", "workout", "weight loss"],
  },
  {
    category: "Home Tutor",
    keywords: ["tutor", "tuition", "teacher", "exam", "study"],
  },
  {
    category: "Emergency Services",
    keywords: ["urgent", "emergency", "sos", "critical", "immediate"],
  },
];

export function inferServiceFromText(text: string): ServiceSuggestion | null {
  const query = text.trim().toLowerCase();
  if (!query) return null;

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => query.includes(keyword))) {
      return getServiceSuggestion(rule.category);
    }
  }

  return null;
}

export async function predictServiceCategory(
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(`${ML_API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
    signal,
  });

  const data = (await response.json()) as PredictResponse | { detail?: string };

  if (!response.ok) {
    const message = "detail" in data && data.detail ? data.detail : "Prediction request failed";
    throw new Error(message);
  }

  if (!("predicted_category" in data) || !data.predicted_category) {
    throw new Error("Invalid prediction response");
  }

  return data.predicted_category;
}
