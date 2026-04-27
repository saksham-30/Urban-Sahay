import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are UrbanSahay Assistant, a helpful chatbot for the UrbanSahay home services platform. 

You help users find and book service providers including: Plumbers, Electricians, Cleaners, Painters, Doctors, Carpenters, AC Repair, Pest Control, Packers & Movers, Laundry, Gardening, Cook/Chef, Babysitter, Pet Care, Fitness Trainer, Home Tutors, and Emergency Services.

Your responsibilities:
- Answer questions about available services
- Guide users to the right service category based on their needs
- Explain how booking works (select service → find providers → book → OTP verification)
- Suggest relevant services when users describe their problems
- Be friendly, concise, and helpful
- Handle voice-based booking requests naturally

When users say things like "Book a plumber for tomorrow morning" or "I need an electrician this evening":
1. Confirm the service type you understood
2. Ask for their location/area if not provided
3. Suggest they navigate to the service page to see available providers and complete the booking with their preferred time
4. Mention they can schedule bookings up to 14 days in advance using the scheduling feature

When users ask about a specific service, suggest they navigate to the Services page or use the search. 
When they describe a problem (like "my tap is leaking"), identify the right service (Plumber) and guide them.

Keep responses short (2-4 sentences max). Use emoji sparingly for friendliness.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
