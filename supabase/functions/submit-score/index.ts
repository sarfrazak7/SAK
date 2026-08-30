import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SubmitBody {
  category: string;
  finishTime: number;
  score: number;
  playerTag?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: SubmitBody = await req.json();
    const { category, finishTime, score, playerTag } = body;

    if (!category || typeof category !== "string") {
      return new Response(JSON.stringify({ error: "Missing category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof finishTime !== "number" || finishTime <= 0 || finishTime > 300) {
      return new Response(JSON.stringify({ error: "Invalid finish time" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof score !== "number" || score < 0) {
      return new Response(JSON.stringify({ error: "Invalid score" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract the caller's real IP. Supabase edges proxy several headers;
    // prefer the leftmost client IP.
    const cf = req.headers.get("cf-connecting-ip");
    const xff = req.headers.get("x-forwarded-for");
    const xri = req.headers.get("x-real-ip");
    const rawIp = cf || (xff ? xff.split(",")[0].trim() : "") || xri || "0.0.0.0";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.rpc("submit_challenge_score", {
      p_category: category,
      p_finish_time: Math.round(finishTime),
      p_score: Math.round(score),
      p_player_ip: rawIp,
      p_player_tag: playerTag ?? null,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ id: data, ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
