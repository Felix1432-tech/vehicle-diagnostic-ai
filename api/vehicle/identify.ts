import type { VercelRequest, VercelResponse } from "@vercel/node";

// ---------- types ----------

interface VehicleResponse {
  plate: string;
  brand: string;
  model: string;
  year: string;
  diagnostic: string;
}

interface ApiBrasilVehicle {
  MARCA?: string;
  MODELO?: string;
  ano?: string;
  anoModelo?: string;
  [key: string]: unknown;
}

// ---------- plate validation ----------

const PLATE_REGEX_OLD = /^[A-Z]{3}[0-9]{4}$/;
const PLATE_REGEX_MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

function normalizePlate(raw: string): string {
  return raw.trim().replace(/-/g, "").toUpperCase();
}

function isValidPlate(plate: string): boolean {
  return PLATE_REGEX_OLD.test(plate) || PLATE_REGEX_MERCOSUL.test(plate);
}

// ---------- n8n provider ----------

async function fetchFromN8n(plate: string): Promise<VehicleResponse | null> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error(`n8n respondeu ${res.status}`);
      return null;
    }

    const data = await res.json();

    if (data?.plate && data?.brand && data?.model && data?.year && data?.diagnostic) {
      return data as VehicleResponse;
    }

    console.error("n8n retornou formato inesperado:", JSON.stringify(data).slice(0, 200));
    return null;
  } catch (err) {
    console.error("n8n falhou:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ---------- APIBrasil provider ----------

async function fetchFromApiBrasil(plate: string): Promise<{ brand: string; model: string; year: string } | null> {
  const apiKey = process.env.APIBRASIL_KEY;
  if (!apiKey) {
    console.error("APIBRASIL_KEY nao configurada");
    return null;
  }

  try {
    const res = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/dados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ placa: plate }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.error(`APIBrasil respondeu ${res.status}`);
      return null;
    }

    const raw: ApiBrasilVehicle = await res.json();

    const brand = raw.MARCA?.trim();
    const model = raw.MODELO?.trim();
    const year = (raw.anoModelo ?? raw.ano ?? "").toString().trim();

    if (!brand || !model) {
      console.error("APIBrasil retornou dados incompletos:", JSON.stringify(raw).slice(0, 200));
      return null;
    }

    return { brand, model, year: year || "N/A" };
  } catch (err) {
    console.error("APIBrasil falhou:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ---------- OpenAI diagnostic ----------

async function generateDiagnostic(brand: string, model: string, year: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackDiagnostic(brand, model);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "Voce e um mecanico automotivo experiente. Responda em portugues brasileiro, de forma direta e pratica. Maximo 3 frases.",
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
      console.error(`OpenAI respondeu ${res.status}`);
      return fallbackDiagnostic(brand, model);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    return content || fallbackDiagnostic(brand, model);
  } catch (err) {
    console.error("OpenAI falhou:", err instanceof Error ? err.message : err);
    return fallbackDiagnostic(brand, model);
  }
}

function fallbackDiagnostic(brand: string, model: string): string {
  const rules: Record<string, string> = {
    "toyota corolla": "Possivel falha em bobina de ignicao. Verificar velas e sistema de ignicao.",
    "volkswagen gol": "Desgaste em cabos de vela e corpo de borboleta. Verificar marcha lenta.",
    "fiat uno": "Sujeira no sistema de injecao e falha em velas. Verificar filtro de combustivel.",
    "ford ranger": "Verificar bicos injetores, sensor MAF e pressao de combustivel.",
  };

  const key = `${brand} ${model}`.toLowerCase();
  for (const [pattern, diagnostic] of Object.entries(rules)) {
    if (key.includes(pattern)) return diagnostic;
  }

  return `Recomendamos verificacao completa do sistema de ignicao e injecao do ${brand} ${model}.`;
}

// ---------- handler ----------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const rawPlate = req.body?.plate;
  if (!rawPlate || typeof rawPlate !== "string") {
    return res.status(400).json({ message: "Campo 'plate' obrigatorio" });
  }

  const plate = normalizePlate(rawPlate);
  if (!isValidPlate(plate)) {
    return res.status(400).json({ message: "Placa invalida. Use formato ABC1234 ou ABC1D23" });
  }

  try {
    // Camada 1: n8n (fluxo completo — ja retorna com diagnostic)
    const n8nResult = await fetchFromN8n(plate);
    if (n8nResult) {
      return res.status(200).json(n8nResult);
    }

    // Camada 2: APIBrasil direto + OpenAI para diagnostic
    const vehicleData = await fetchFromApiBrasil(plate);
    if (vehicleData) {
      const diagnostic = await generateDiagnostic(vehicleData.brand, vehicleData.model, vehicleData.year);
      return res.status(200).json({
        plate,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        diagnostic,
      } satisfies VehicleResponse);
    }

    // Camada 3: nenhum provider retornou dados
    return res.status(404).json({
      message: "Veiculo nao encontrado. Verifique a placa e tente novamente.",
    });
  } catch (err) {
    console.error("Erro inesperado no handler:", err);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
