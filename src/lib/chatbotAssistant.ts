import { api, ProviderProfile, ML_API_ORIGIN, PRICE_API_ORIGIN } from "@/lib/api";

export type ServiceCategory =
  | "Plumber"
  | "Electrician"
  | "Cleaner"
  | "Painter"
  | "Doctor"
  | "AC Technician"
  | "Carpenter";

export type UserIntent =
  | "find_service"
  | "cheapest"
  | "nearest"
  | "urgent_help"
  | "track_booking"
  | "best"
  | "unknown";

export type UrgencyLevel = "Low" | "Medium" | "High";

export interface SessionContext {
  lastService?: ServiceCategory;
  lastIntent?: UserIntent;
  lastUrgency?: UrgencyLevel;
  lastLocation?: string;
}

export interface AssistantAction {
  type: "navigate" | "send_message";
  label: string;
  to?: string;
  message?: string;
  state?: Record<string, unknown>;
}

export interface AssistantResult {
  response: string;
  context: SessionContext;
  actions?: AssistantAction[];
}

export interface PriceEstimate {
  min: number;
  max: number;
}

const ML_API_BASE_URL = ML_API_ORIGIN;
const PRICE_API_BASE_URL = PRICE_API_ORIGIN;

const serviceAliases: Record<string, ServiceCategory> = {
  plumber: "Plumber",
  plumbing: "Plumber",
  pipe: "Plumber",
  leak: "Plumber",
  electrician: "Electrician",
  electrical: "Electrician",
  switch: "Electrician",
  cleaner: "Cleaner",
  cleaning: "Cleaner",
  painter: "Painter",
  painting: "Painter",
  doctor: "Doctor",
  medical: "Doctor",
  ac: "AC Technician",
  "ac technician": "AC Technician",
  "air conditioner": "AC Technician",
  fridge: "AC Technician",
  carpenter: "Carpenter",
  carpentry: "Carpenter",
  furniture: "Carpenter",
};

const serviceToProviderQuery: Record<ServiceCategory, string> = {
  Plumber: "Plumbing Issue",
  Electrician: "Electrical Problem",
  Cleaner: "Cleaning Service",
  Painter: "Painting & Renovation",
  Doctor: "Medical Emergency",
  "AC Technician": "AC & Appliance",
  Carpenter: "Carpentry Work",
};

const serviceToConcernSlug: Record<ServiceCategory, string> = {
  Plumber: "plumber",
  Electrician: "electrician",
  Cleaner: "cleaner",
  Painter: "painter",
  Doctor: "doctor",
  "AC Technician": "appliance-repair",
  Carpenter: "carpenter",
};

const emergencyKeywords = ["gas leak", "fire", "short circuit", "flooding"];
const LOW_CONFIDENCE_THRESHOLD = 0.45;

const fallbackPriceTable: Record<ServiceCategory, Record<UrgencyLevel, PriceEstimate>> = {
  Plumber: {
    Low: { min: 300, max: 800 },
    Medium: { min: 800, max: 1800 },
    High: { min: 1800, max: 3500 },
  },
  Electrician: {
    Low: { min: 400, max: 900 },
    Medium: { min: 900, max: 2200 },
    High: { min: 2200, max: 4000 },
  },
  Cleaner: {
    Low: { min: 300, max: 1000 },
    Medium: { min: 1000, max: 2000 },
    High: { min: 2000, max: 3500 },
  },
  Painter: {
    Low: { min: 1200, max: 3000 },
    Medium: { min: 3000, max: 8000 },
    High: { min: 8000, max: 18000 },
  },
  Doctor: {
    Low: { min: 500, max: 1200 },
    Medium: { min: 1200, max: 2500 },
    High: { min: 2500, max: 6000 },
  },
  "AC Technician": {
    Low: { min: 600, max: 1400 },
    Medium: { min: 1400, max: 3000 },
    High: { min: 3000, max: 6000 },
  },
  Carpenter: {
    Low: { min: 500, max: 1500 },
    Medium: { min: 1500, max: 3500 },
    High: { min: 3500, max: 8000 },
  },
};

export function detectIntent(message: string, context?: SessionContext): UserIntent {
  const text = message.toLowerCase();

  if (/track|status|booking|where is my/i.test(text)) return "track_booking";
  if (/cheapest|lowest|budget|cheap|low cost/i.test(text)) return "cheapest";
  if (/nearest|nearby|closest|near me/i.test(text)) return "nearest";
  if (/best|top rated|high rating|recommended/i.test(text)) return "best";
  if (/urgent|immediately|asap|emergency|right now/i.test(text)) return "urgent_help";
  if (/find|need|book|hire|want|looking for/i.test(text)) return "find_service";

  // Use conversation memory if user says follow-up like "cheapest one".
  if (context?.lastIntent && /one|that|it|them/i.test(text)) {
    return context.lastIntent;
  }

  return "unknown";
}

export function detectUrgency(message: string): UrgencyLevel {
  const text = message.toLowerCase();

  if (/urgent|immediately|emergency|leak|not working|asap|short circuit|fire/i.test(text)) {
    return "High";
  }

  if (/soon|today|quickly|problem|issue|repair needed/i.test(text)) {
    return "Medium";
  }

  return "Low";
}

export function detectEmergency(message: string): boolean {
  const text = message.toLowerCase();
  return emergencyKeywords.some((keyword) => text.includes(keyword));
}

function normalizeService(raw: string): ServiceCategory | null {
  const normalized = raw.trim().toLowerCase();

  if (normalized.includes("electric")) return "Electrician";
  if (normalized.includes("plumb") || normalized.includes("leak") || normalized.includes("pipe")) return "Plumber";
  if (normalized.includes("clean")) return "Cleaner";
  if (normalized.includes("paint")) return "Painter";
  if (normalized.includes("doctor") || normalized.includes("medic")) return "Doctor";
  if (normalized.includes("ac") || normalized.includes("air conditioner") || normalized.includes("fridge")) return "AC Technician";
  if (normalized.includes("carpent") || normalized.includes("furniture") || normalized.includes("wood")) return "Carpenter";

  return serviceAliases[normalized] || null;
}

function inferServiceFromText(message: string): ServiceCategory | null {
  const text = message.toLowerCase();
  for (const [key, value] of Object.entries(serviceAliases)) {
    if (text.includes(key)) return value;
  }
  return null;
}

function getCandidateServices(message: string): ServiceCategory[] {
  const text = message.toLowerCase();
  const scoreMap: Record<ServiceCategory, number> = {
    Plumber: 0,
    Electrician: 0,
    Cleaner: 0,
    Painter: 0,
    Doctor: 0,
    "AC Technician": 0,
    Carpenter: 0,
  };

  for (const [token, service] of Object.entries(serviceAliases)) {
    if (text.includes(token)) {
      scoreMap[service] += token.length > 5 ? 2 : 1;
    }
  }

  return (Object.entries(scoreMap) as Array<[ServiceCategory, number]>)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([service]) => service)
    .slice(0, 3);
}

function extractLocation(message: string, context?: SessionContext): string {
  const text = message.trim();
  const inMatch = text.match(/\bin\s+([a-zA-Z\s]{2,30})/i);
  if (inMatch?.[1]) {
    return inMatch[1].trim();
  }
  return context?.lastLocation || "";
}

export async function getServiceFromML(message: string): Promise<{
  service: ServiceCategory | null;
  confidence: number | null;
  candidates: ServiceCategory[];
}> {
  const candidates = getCandidateServices(message);

  try {
    const response = await fetch(`${ML_API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      return {
        service: inferServiceFromText(message),
        confidence: null,
        candidates,
      };
    }

    const data = (await response.json()) as { predicted_category?: string; confidence?: number };
    if (!data.predicted_category) {
      return {
        service: inferServiceFromText(message),
        confidence: data.confidence ?? null,
        candidates,
      };
    }

    return {
      service: normalizeService(data.predicted_category) || inferServiceFromText(message),
      confidence: typeof data.confidence === "number" ? data.confidence : null,
      candidates,
    };
  } catch {
    return {
      service: inferServiceFromText(message),
      confidence: null,
      candidates,
    };
  }
}

function getBookingActions(params: {
  service: ServiceCategory;
  concern: string;
  urgency: UrgencyLevel;
  location?: string;
}): AssistantAction[] {
  const slug = serviceToConcernSlug[params.service];
  return [
    {
      type: "navigate",
      label: "Book Now",
      to: `/raise-concern/${slug}`,
      state: {
        prefill: {
          concern: params.concern,
          urgency: params.urgency.toLowerCase(),
          location: params.location || "",
        },
      },
    },
    {
      type: "navigate",
      label: "View Providers",
      to: "/provider-results",
      state: {
        serviceType: serviceToProviderQuery[params.service],
      },
    },
    {
      type: "send_message",
      label: "Raise Emergency",
      message: `Emergency help needed for ${params.service}`,
    },
  ];
}

export async function getPriceEstimate(
  service: ServiceCategory,
  location: string,
  urgency: UrgencyLevel,
): Promise<PriceEstimate> {
  try {
    const response = await fetch(`${PRICE_API_BASE_URL}/predict-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service,
        location: /suburb|outskirts|village/i.test(location) ? "Suburbs" : "Downtown",
        urgency,
      }),
    });

    if (!response.ok) {
      return fallbackPriceTable[service][urgency];
    }

    const data = (await response.json()) as { price_range?: { min: number; max: number } };
    if (!data.price_range) {
      return fallbackPriceTable[service][urgency];
    }

    return {
      min: Math.round(data.price_range.min),
      max: Math.round(data.price_range.max),
    };
  } catch {
    return fallbackPriceTable[service][urgency];
  }
}

function parseHourlyRate(value: string | null): number {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.MAX_SAFE_INTEGER;
}

function nearestScore(provider: ProviderProfile, userLocation: string): number {
  if (!userLocation) return 0;
  const city = provider.city?.toLowerCase() || "";
  const user = userLocation.toLowerCase();
  if (city === user) return 100;
  if (city.includes(user) || user.includes(city)) return 80;
  return 20;
}

export async function recommendProviders(params: {
  service: ServiceCategory;
  intent: UserIntent;
  location?: string;
}): Promise<ProviderProfile[]> {
  const serviceQuery = serviceToProviderQuery[params.service] || params.service;
  const providers = await api.searchProviders({
    serviceType: serviceQuery,
    city: params.location || undefined,
  });

  const sorted = [...providers].sort((a, b) => {
    if (params.intent === "cheapest") {
      return parseHourlyRate(a.hourlyRate) - parseHourlyRate(b.hourlyRate);
    }

    if (params.intent === "nearest") {
      const aScore = nearestScore(a, params.location || "");
      const bScore = nearestScore(b, params.location || "");
      if (aScore !== bScore) return bScore - aScore;
      return (b.rating || 0) - (a.rating || 0);
    }

    // Default "best" or generic recommendation: rating first.
    return (b.rating || 0) - (a.rating || 0);
  });

  return sorted.slice(0, 3);
}

function providerListMarkdown(providers: ProviderProfile[]): string {
  if (providers.length === 0) {
    return "No providers are currently available for this service. Please try another location or check again shortly.";
  }

  const lines = providers.map((provider, index) => {
    const fee = provider.hourlyRate || "Contact for pricing";
    const rating = provider.rating ? provider.rating.toFixed(1) : "N/A";
    return `${index + 1}. ${provider.fullName} (${provider.city}) - Rating ${rating}, Fee ${fee}`;
  });

  return lines.join("\n");
}

export function generateResponse(params: {
  service: ServiceCategory;
  urgency: UrgencyLevel;
  price: PriceEstimate;
  providers: ProviderProfile[];
  intent: UserIntent;
  isEmergency: boolean;
}): string {
  if (params.isEmergency) {
    return [
      "This seems like an emergency. Showing nearest available providers immediately.",
      `Service: ${params.service}`,
      `Urgency: High` ,
      `Estimated Price: ₹${params.price.min} - ₹${params.price.max}`,
      "",
      "Nearest providers:",
      providerListMarkdown(params.providers),
    ].join("\n");
  }

  const strategyText =
    params.intent === "cheapest"
      ? "best budget options"
      : params.intent === "nearest"
        ? "nearest available providers"
        : "top recommended providers";

  return [
    `You need a ${params.service} (${params.urgency} urgency).`,
    `Estimated cost is ₹${params.price.min} - ₹${params.price.max}.`,
    `Here are the ${strategyText}:`,
    providerListMarkdown(params.providers),
  ].join("\n");
}

export async function processUserMessage(params: {
  message: string;
  context: SessionContext;
}): Promise<AssistantResult> {
  const message = params.message.trim();
  const intent = detectIntent(message, params.context);
  const isEmergency = detectEmergency(message);
  const urgency = isEmergency ? "High" : detectUrgency(message);

  if (intent === "track_booking") {
    return {
      response:
        "You can track your booking from My Requests. Open the My Requests page to view provider status and updates.",
      context: {
        ...params.context,
        lastIntent: intent,
        lastUrgency: urgency,
      },
      actions: [
        {
          type: "navigate",
          label: "Open My Requests",
          to: "/my-requests",
        },
      ],
    };
  }

  const mlResult = await getServiceFromML(message);
  const service = mlResult.service || params.context.lastService || inferServiceFromText(message);
  const location = extractLocation(message, params.context);

  if (!service && mlResult.candidates.length > 0) {
    return {
      response: `I want to make sure I understood correctly. Do you need ${mlResult.candidates[0]}${mlResult.candidates[1] ? ` or ${mlResult.candidates[1]}` : ""}?`,
      context: {
        ...params.context,
        lastIntent: intent,
        lastUrgency: urgency,
      },
      actions: mlResult.candidates.slice(0, 2).map((candidate) => ({
        type: "send_message",
        label: candidate,
        message: `Book ${candidate}`,
      })),
    };
  }

  if (!service) {
    return {
      response: "Please describe your issue (e.g., water leakage, AC not cooling).",
      context: {
        ...params.context,
        lastIntent: intent,
        lastUrgency: urgency,
      },
    };
  }

  if (mlResult.confidence !== null && mlResult.confidence < LOW_CONFIDENCE_THRESHOLD && mlResult.candidates.length > 1) {
    return {
      response: `I found a likely match as ${service}, but confidence is low. Please confirm your service type.`,
      context: {
        lastService: service,
        lastIntent: intent,
        lastUrgency: urgency,
        lastLocation: location || params.context.lastLocation,
      },
      actions: mlResult.candidates.slice(0, 2).map((candidate) => ({
        type: "send_message",
        label: candidate,
        message: `Book ${candidate}`,
      })),
    };
  }

  const directBookingRequested = /\bbook\b|\bhire\b|\bconfirm\b/i.test(message);

  if (intent === "find_service" && directBookingRequested) {
    const bookingAction = getBookingActions({
      service,
      concern: message,
      urgency,
      location,
    })[0];

    return {
      response: `Great, I can help you book a ${service}. Taking you to the booking form now.`,
      context: {
        lastService: service,
        lastIntent: intent,
        lastUrgency: urgency,
        lastLocation: location || params.context.lastLocation,
      },
      actions: bookingAction ? [bookingAction] : undefined,
    };
  }

  const price = await getPriceEstimate(service, location, urgency);
  const recommendationIntent =
    isEmergency || intent === "urgent_help"
      ? "nearest"
      : intent === "unknown"
        ? "best"
        : intent;

  let providers: ProviderProfile[] = [];
  try {
    providers = await recommendProviders({
      service,
      intent: recommendationIntent,
      location,
    });
  } catch {
    providers = [];
  }

  const response = generateResponse({
    service,
    urgency,
    price,
    providers,
    intent: recommendationIntent,
    isEmergency,
  });

  return {
    response,
    context: {
      lastService: service,
      lastIntent: recommendationIntent,
      lastUrgency: urgency,
      lastLocation: location || params.context.lastLocation,
    },
    actions: getBookingActions({
      service,
      concern: message,
      urgency,
      location,
    }),
  };
}
