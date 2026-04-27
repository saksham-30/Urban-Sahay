import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are UrbanSahay Provider Assistant — an AI helper built specifically for service providers on the UrbanSahay platform.

You help providers manage their business effectively. Your areas of expertise:

**Request Management:**
- How to accept/reject incoming service requests
- Tips for prioritizing urgent vs low-priority jobs
- Best practices for responding quickly to increase acceptance rate

**Earnings & Payments:**
- Understanding earnings reports and payment cycles
- Tips to maximize earnings (availability, ratings, response time)
- How payments are processed and when to expect them

**Availability & Schedule:**
- How to toggle Online/Busy/Offline status
- Best times to be available for more requests
- Managing multiple jobs efficiently

**Ratings & Reviews:**
- How ratings are calculated
- Tips to improve customer satisfaction and get 5-star reviews
- Handling negative feedback professionally

**Profile & Verification:**
- Completing KYC verification for the Verified badge
- Updating profile info (service type, hourly rate, description)
- How verification improves visibility and trust

**Platform Tips:**
- Using the Live Request Map effectively
- Chat etiquette with customers
- Safety guidelines and best practices

Keep responses concise (2-4 sentences). Be professional, supportive, and actionable. Use emoji sparingly. If a question is outside your scope, suggest contacting UrbanSahay Support.`;

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
    console.error("provider chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
