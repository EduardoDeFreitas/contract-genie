import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SYSAID_URL = Deno.env.get("SYSAID_URL");
    const SYSAID_USERNAME = Deno.env.get("SYSAID_USERNAME");
    const SYSAID_PASSWORD = Deno.env.get("SYSAID_PASSWORD");

    if (!SYSAID_URL || !SYSAID_USERNAME || !SYSAID_PASSWORD) {
      throw new Error("SysAid credentials not configured");
    }

    // Step 1: Login to SysAid to get session
    const loginRes = await fetch(`${SYSAID_URL}/api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: SYSAID_USERNAME,
        password: SYSAID_PASSWORD,
      }),
    });

    if (!loginRes.ok) {
      const errText = await loginRes.text();
      console.error("SysAid login failed:", loginRes.status, errText);
      throw new Error(`Falha ao autenticar no SysAid (${loginRes.status})`);
    }

    // Extract session cookies
    const cookies = loginRes.headers.get("set-cookie") || "";
    const loginBody = await loginRes.text();
    console.log("SysAid login response:", loginBody);

    // Step 2: Fetch CMDB items (contracts)
    const ciRes = await fetch(`${SYSAID_URL}/api/v1/ci?ci_type=54&ci_sub_type=28`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookies,
      },
    });

    if (!ciRes.ok) {
      const errText = await ciRes.text();
      console.error("SysAid CI fetch failed:", ciRes.status, errText);
      throw new Error(`Falha ao buscar contratos no SysAid (${ciRes.status})`);
    }

    const contracts = await ciRes.json();

    // Step 3: Logout
    try {
      await fetch(`${SYSAID_URL}/api/v1/logout`, {
        method: "POST",
        headers: { "Cookie": cookies },
      });
    } catch {
      // ignore logout errors
    }

    return new Response(JSON.stringify(contracts), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("fetch-sysaid-contracts error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
