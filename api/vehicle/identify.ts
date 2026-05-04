import type { VercelRequest, VercelResponse } from "@vercel/node";

// ---------- types ----------

interface VehicleResponse {
  plate: string;
  brand: string;
  model: string;
  year: string;
  color?: string;
  fuel?: string;
  diagnostic: string;
  source: string;
}

interface ApiBrasilVehicle {
  MARCA?: string;
  MODELO?: string;
  COR?: string;
  COMBUSTIVEL?: string;
  ano?: string;
  anoModelo?: string;
  [key: string]: unknown;
}

// ---------- plate validation ----------

const PLATE_REGEX_OLD = /^[A-Z]{3}[0-9]{4}$/;
const PLATE_REGEX_MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

function normalizePlate(raw: string): string {
  return raw.trim().replace(/[-\s]/g, "").toUpperCase();
}

function isValidPlate(plate: string): boolean {
  return PLATE_REGEX_OLD.test(plate) || PLATE_REGEX_MERCOSUL.test(plate);
}

// ---------- n8n provider ----------
// Espera que o fluxo n8n retorne exatamente: { plate, brand, model, year, diagnostic }
// Auth: Bearer via API_KEY_N8N se configurada

async function fetchFromN8n(plate: string): Promise<VehicleResponse | null> {
  const baseUrl = process.env.N8N_WEBHOOK_URL;
  const apiKey  = process.env.API_KEY_N8N;

  if (!baseUrl) {
    console.log("[n8n] N8N_WEBHOOK_URL ausente — pulando camada n8n");
    return null;
  }

  // Monta headers — adiciona auth se API_KEY_N8N estiver configurada
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
    console.log("[n8n] Autenticacao Bearer configurada");
  }

  // Se a URL não tiver path (apenas domínio), tenta o path padrão do webhook
  let webhookUrl = baseUrl;
  try {
    const parsed = new URL(baseUrl);
    if (parsed.pathname === "/" || parsed.pathname === "") {
      webhookUrl = `${baseUrl}/webhook/vehicle-identify`;
      console.log("[n8n] Path nao encontrado na URL — usando padrao:", webhookUrl);
    }
  } catch {
    console.error("[n8n] N8N_WEBHOOK_URL invalida:", baseUrl);
    return null;
  }

  try {
    console.log("[n8n] Chamando:", webhookUrl);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ plate }),
      signal: AbortSignal.timeout(10_000),
    });

    const body = await res.text();
    console.log(`[n8n] Status: ${res.status} | Body: ${body.slice(0, 300)}`);

    if (!res.ok) {
      console.error("[n8n] Falhou com status", res.status);
      return null;
    }

    let data: unknown;
    try {
      data = JSON.parse(body);
    } catch {
      console.error("[n8n] Resposta nao e JSON:", body.slice(0, 100));
      return null;
    }

    const d = data as Record<string, unknown>;
    if (d?.plate && d?.brand && d?.model && d?.year && d?.diagnostic) {
      return {
        plate:       String(d.plate),
        brand:       String(d.brand),
        model:       String(d.model),
        year:        String(d.year),
        diagnostic:  String(d.diagnostic),
        source:      "n8n",
      };
    }

    console.error("[n8n] Shape invalido:", JSON.stringify(d).slice(0, 200));
    return null;
  } catch (err) {
    console.error("[n8n] Excecao:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ---------- APIBrasil provider ----------
// Endpoint: https://gateway.apibrasil.io/api/v2/vehicles/dados
// Auth: Bearer APIBRASIL_KEY
// Body: { placa: "ABC1234" }

async function fetchFromApiBrasil(plate: string): Promise<Omit<VehicleResponse, "diagnostic" | "source"> | null> {
  const apiKey = process.env.APIBRASIL_KEY;

  if (!apiKey) {
    console.log("[apibrasil] APIBRASIL_KEY ausente — pulando");
    return null;
  }

  try {
    console.log("[apibrasil] Consultando placa:", plate);
    const res = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/dados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ placa: plate }),
      signal: AbortSignal.timeout(15_000),
    });

    const rawBody = await res.text();
    console.log(`[apibrasil] Status: ${res.status} | Body: ${rawBody.slice(0, 400)}`);

    if (!res.ok) {
      console.error("[apibrasil] Falhou com status", res.status);
      return null;
    }

    let raw: ApiBrasilVehicle;
    try {
      raw = JSON.parse(rawBody);
    } catch {
      console.error("[apibrasil] Resposta nao e JSON");
      return null;
    }

    // APIBrasil as vezes aninha dados em raw.body ou raw.data — cobrimos os casos
    const payload: ApiBrasilVehicle = (raw as any)?.body ?? (raw as any)?.data ?? raw;

    const brand = payload.MARCA?.trim();
    const model = payload.MODELO?.trim();
    const year  = (payload.anoModelo ?? payload.ano ?? "").toString().trim();
    const color = payload.COR?.trim();
    const fuel  = payload.COMBUSTIVEL?.trim();

    if (!brand || !model) {
      console.error("[apibrasil] Dados incompletos. Payload:", JSON.stringify(payload).slice(0, 300));
      return null;
    }

    return { plate, brand, model, year: year || "N/A", color, fuel };
  } catch (err) {
    console.error("[apibrasil] Excecao:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ---------- OpenAI diagnostic ----------

async function generateDiagnostic(brand: string, model: string, year: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("[openai] OPENAI_API_KEY ausente — usando fallback local");
    return localDiagnostic(brand, model);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 250,
        messages: [
          {
            role: "system",
            content:
              "Voce e um mecanico automotivo experiente. Responda em portugues brasileiro, direto e pratico. Maximo 3 frases curtas.",
          },
          {
            role: "user",
            content: `Quais as falhas mais comuns do ${brand} ${model} ${year}? De um diagnostico inicial rapido.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      console.error(`[openai] Status ${res.status}`);
      return localDiagnostic(brand, model);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || localDiagnostic(brand, model);
  } catch (err) {
    console.error("[openai] Excecao:", err instanceof Error ? err.message : err);
    return localDiagnostic(brand, model);
  }
}

function localDiagnostic(brand: string, model: string): string {
  const rules: Record<string, string> = {
    "toyota corolla":    "Possivel falha em bobina de ignicao. Verificar velas e sistema de ignicao.",
    "volkswagen gol":    "Desgaste em cabos de vela e corpo de borboleta. Verificar marcha lenta.",
    "volkswagen polo":   "Verificar bobina de ignicao e sensor de rotacao. Falhas de partida a frio sao comuns.",
    "fiat uno":          "Sujeira no sistema de injecao e falha em velas. Verificar filtro de combustivel.",
    "fiat strada":       "Verificar sensor de temperatura e cabos de vela. Superaquecimento recorrente.",
    "ford ranger":       "Verificar bicos injetores, sensor MAF e pressao de combustivel.",
    "chevrolet onix":    "Sensor de posicao do virabrequim e bobina sao pontos criticos. Verificar codigo de falha.",
    "hyundai hb20":      "Verificar sistema de arrefecimento e correia dentada no intervalo recomendado.",
    "renault kwid":      "Inspecionar filtro de ar e cabos de ignicao. Consumo elevado pode indicar injecao suja.",
  };

  const key = `${brand} ${model}`.toLowerCase();
  for (const [pattern, text] of Object.entries(rules)) {
    if (key.includes(pattern)) return text;
  }

  return `Recomendamos verificacao completa do sistema de ignicao e injecao do ${brand} ${model}.`;
}

// ---------- mock garantido ----------

function mockResponse(plate: string): VehicleResponse {
  return {
    source:      "mock",
    plate,
    brand:       "VOLKSWAGEN",
    model:       "GOL",
    year:        "2019",
    color:       "PRATA",
    fuel:        "FLEX",
    diagnostic:  "[MOCK] APIs externas indisponiveis. Desgaste em cabos de vela e corpo de borboleta sao comuns neste modelo.",
  };
}

// ---------- handler principal ----------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin",  process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")    return res.status(405).json({ message: "Method not allowed" });

  // Auditoria de ENVs — visivel nos logs da Vercel
  console.log("[identify] ENV:", {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL  ? `SET (${process.env.N8N_WEBHOOK_URL})` : "MISSING",
    API_KEY_N8N:     process.env.API_KEY_N8N      ? "SET" : "MISSING",
    APIBRASIL_KEY:   process.env.APIBRASIL_KEY    ? "SET" : "MISSING",
    OPENAI_API_KEY:  process.env.OPENAI_API_KEY   ? "SET" : "MISSING",
  });

  const rawPlate = req.body?.plate;
  if (!rawPlate || typeof rawPlate !== "string") {
    return res.status(400).json({ message: "Campo 'plate' obrigatorio" });
  }

  const plate = normalizePlate(rawPlate);
  if (!isValidPlate(plate)) {
    return res.status(400).json({ message: "Placa invalida. Formato esperado: ABC1234 ou ABC1D23" });
  }

  console.log("[identify] Placa:", plate);

  try {
    // Camada 1 — n8n (fluxo completo, retorna com diagnostic pronto)
    const n8nResult = await fetchFromN8n(plate);
    if (n8nResult) {
      console.log("[identify] OK via n8n");
      return res.status(200).json(n8nResult);
    }

    // Camada 2 — APIBrasil + OpenAI
    const vehicleData = await fetchFromApiBrasil(plate);
    if (vehicleData) {
      const diagnostic = await generateDiagnostic(vehicleData.brand, vehicleData.model, vehicleData.year);
      console.log("[identify] OK via APIBrasil+OpenAI");
      return res.status(200).json({ ...vehicleData, diagnostic, source: "apibrasil" } satisfies VehicleResponse);
    }

    // Camada 3 — mock garantido (frontend nunca fica sem resposta)
    console.warn("[identify] Todos os providers falharam — retornando mock");
    return res.status(200).json(mockResponse(plate));

  } catch (err) {
    console.error("[identify] Excecao nao tratada:", err);
    return res.status(200).json(mockResponse(plate));
  }
}
