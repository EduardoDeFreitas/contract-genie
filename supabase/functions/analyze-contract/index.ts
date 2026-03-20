import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um especialista em análise de contratos brasileiros. O usuário vai enviar o texto de um contrato já firmado. Sua tarefa é extrair as informações estruturadas do contrato.

Regras:
- Extraia APENAS informações que estão presentes no texto. Se algo não estiver disponível, use "Não especificado".
- Seja preciso e objetivo.
- Mantenha as citações fiéis ao texto original quando possível.
- Para penalidades, SLA e requisitos, liste cada item separadamente.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { contractText } = await req.json();

    if (!contractText || typeof contractText !== "string" || contractText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Texto do contrato muito curto ou inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Analise o seguinte contrato e extraia as informações:\n\n${contractText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_contract_data",
              description: "Extrai dados estruturados de um contrato",
              parameters: {
                type: "object",
                properties: {
                  objeto: {
                    type: "string",
                    description: "Objetivo/objeto do contrato",
                  },
                  partes: {
                    type: "object",
                    properties: {
                      contratante: { type: "string", description: "Nome/razão social do contratante" },
                      contratada: { type: "string", description: "Nome/razão social da contratada" },
                    },
                    required: ["contratante", "contratada"],
                  },
                  numero_contrato: {
                    type: "string",
                    description: "Número ou identificação do contrato",
                  },
                  vigencia: {
                    type: "object",
                    properties: {
                      inicio: { type: "string", description: "Data de início" },
                      fim: { type: "string", description: "Data de término" },
                      renovacao: { type: "string", description: "Condições de renovação" },
                    },
                    required: ["inicio", "fim", "renovacao"],
                  },
                  valor: {
                    type: "string",
                    description: "Valor total do contrato formatado em reais",
                  },
                  penalidades: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de penalidades previstas",
                  },
                  sla: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de SLAs/níveis de serviço",
                  },
                  requisitos: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de requisitos técnicos ou operacionais",
                  },
                  observacoes: {
                    type: "string",
                    description: "Observações adicionais relevantes",
                  },
                },
                required: [
                  "objeto",
                  "partes",
                  "numero_contrato",
                  "vigencia",
                  "valor",
                  "penalidades",
                  "sla",
                  "requisitos",
                  "observacoes",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_contract_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured data");
    }

    const contractData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(contractData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-contract error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
