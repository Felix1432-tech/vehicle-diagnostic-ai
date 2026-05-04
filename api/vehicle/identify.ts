import type { VercelRequest, VercelResponse } from "@vercel/node";

// ─── response contract ────────────────────────────────────────────────────────

export interface DiagnosticResponse {
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    year: string;
    fuel: string;
    color: string;
  };
  fipe: {
    value: string | null;
    reference: string | null;
  };
  diagnosis: {
    summary: string;
    recommendations: string[];
  };
  source: "apibrasil" | "n8n" | "mock";
}

// ─── plate validation ─────────────────────────────────────────────────────────

function normalizePlate(raw: string): string {
  return raw.trim().replace(/[-\s]/g, "").toUpperCase();
}

function isValidPlate(p: string): boolean {
  return /^[A-Z]{3}[0-9]{4}$/.test(p) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p);
}

// ─── APIBrasil: dados ─────────────────────────────────────────────────────────

interface ApiBrasilDados {
  MARCA?: string;
  MODELO?: string;
  COR?: string;
  COMBUSTIVEL?: string;
  ano?: string | number;
  anoModelo?: string | number;
  body?: Record<string, unknown>;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

async function fetchDados(plate: string, token: string): Promise<{
  brand: string; model: string; year: string; fuel: string; color: string;
} | null> {
  console.log("[dados] →", plate);

  const res = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/dados", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ placa: plate }),
    signal: AbortSignal.timeout(15_000),
  });

  const raw = await res.text();
  console.log(`[dados] status=${res.status} body=${raw.slice(0, 400)}`);

  if (!res.ok) return null;

  let parsed: ApiBrasilDados;
  try { parsed = JSON.parse(raw); } catch { return null; }

  // APIBrasil às vezes aninha em .body ou .data
  const d: ApiBrasilDados = (parsed.body as ApiBrasilDados) ?? (parsed.data as ApiBrasilDados) ?? parsed;

  const brand = String(d.MARCA ?? "").trim();
  const model = String(d.MODELO ?? "").trim();
  const year  = String(d.anoModelo ?? d.ano ?? "").trim();
  const fuel  = String(d.COMBUSTIVEL ?? "").trim();
  const color = String(d.COR ?? "").trim();

  if (!brand || !model) {
    console.error("[dados] dados insuficientes:", JSON.stringify(d).slice(0, 200));
    return null;
  }

  return { brand, model, year: year || "N/A", fuel: fuel || "N/A", color: color || "N/A" };
}

// ─── APIBrasil: fipe ──────────────────────────────────────────────────────────

interface ApiBrasilFipe {
  FIPE_Preco?: string;
  preco?: string;
  valor?: string;
  MesReferencia?: string;
  mesReferencia?: string;
  body?: Record<string, unknown>;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

async function fetchFipe(plate: string, token: string): Promise<{ value: string; reference: string } | null> {
  console.log("[fipe] →", plate);

  const res = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/fipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ placa: plate }),
    signal: AbortSignal.timeout(15_000),
  });

  const raw = await res.text();
  console.log(`[fipe] status=${res.status} body=${raw.slice(0, 300)}`);

  if (!res.ok) return null;

  let parsed: ApiBrasilFipe;
  try { parsed = JSON.parse(raw); } catch { return null; }

  const d: ApiBrasilFipe = (parsed.body as ApiBrasilFipe) ?? (parsed.data as ApiBrasilFipe) ?? parsed;

  const value = String(d.FIPE_Preco ?? d.preco ?? d.valor ?? "").trim();
  const ref   = String(d.MesReferencia ?? d.mesReferencia ?? "").trim();

  return value ? { value, reference: ref || "N/A" } : null;
}

// ─── diagnosis generation ─────────────────────────────────────────────────────

function splitDiagnosis(text: string): { summary: string; recommendations: string[] } {
  const parts = text
    .split(/\.\s+|;\s*|\n/)
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter((s) => s.length > 6);

  const [summary = text, ...rest] = parts;
  return { summary: summary + ".", recommendations: rest.map((r) => r + ".") };
}

async function generateDiagnosis(
  brand: string, model: string, year: string
): Promise<{ summary: string; recommendations: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("[openai] chave ausente — fallback local");
    return splitDiagnosis(localDiagnosis(brand, model));
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
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "Você é um mecânico automotivo experiente. Responda em português brasileiro. " +
              "Primeira frase: resumo do diagnóstico. Depois, 2-3 recomendações objetivas separadas por ponto. " +
              "Máximo 4 frases no total.",
          },
          {
            role: "user",
            content: `Quais as falhas mais comuns do ${brand} ${model} ${year}? Dê um diagnóstico inicial rápido.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      console.error("[openai] status", res.status);
      return splitDiagnosis(localDiagnosis(brand, model));
    }

    const data = await res.json();
    const content = (data?.choices?.[0]?.message?.content ?? "").trim();
    return content ? splitDiagnosis(content) : splitDiagnosis(localDiagnosis(brand, model));
  } catch (err) {
    console.error("[openai] erro:", err instanceof Error ? err.message : err);
    return splitDiagnosis(localDiagnosis(brand, model));
  }
}

function localDiagnosis(brand: string, model: string): string {
  const db: Record<string, string> = {
    "volkswagen gol":     "Desgaste em cabos de vela e corpo de borboleta são comuns. Verificar marcha lenta. Inspecionar filtro de combustível a cada 10.000 km. Limpar corpo de borboleta preventivamente.",
    "volkswagen polo":    "Bobina de ignição e sensor de rotação são pontos críticos. Falhas de partida a frio recorrentes. Verificar chicote do sensor CKP. Inspecionar velas a cada 20.000 km.",
    "volkswagen gol g5":  "Sensor de posição de virabrequim (CKP) falha com frequência. Verificar mangueiras do sistema de arrefecimento. Trocar correia dentada no prazo recomendado.",
    "fiat uno":           "Sistema de injeção com sujeira acumulada é comum. Verificar filtro de combustível e bicos injetores. Velas de ignição desgastam rápido neste modelo.",
    "fiat strada":        "Superaquecimento recorrente por falha no sensor de temperatura. Verificar sistema de arrefecimento. Mangueiras do radiador devem ser inspecionadas.",
    "fiat palio":         "Bomba de combustível com vida útil curta. Verificar nível do tanque sempre acima de ¼. Sensor de temperatura e termostato são pontos de atenção.",
    "chevrolet onix":     "Sensor de posição do virabrequim e bobina de ignição são críticos. Verificar código de falha no scanner. Motor 1.0 turbo exige troca de óleo em dia.",
    "chevrolet celta":    "Injeção eletrônica com falhas intermitentes. Verificar sonda lambda e sensor MAP. Cabos de vela desgastados causam falhas de ignição.",
    "toyota corolla":     "Bobina de ignição pode falhar após 80.000 km. Verificar velas e sistema de ignição. Consumo elevado pode indicar injeção suja.",
    "honda civic":        "Junta do cabeçote é ponto de atenção após 100.000 km. Verificar nível de fluido de arrefecimento. Câmbio automático exige troca de óleo periódica.",
    "hyundai hb20":       "Sistema de arrefecimento e correia dentada no intervalo recomendado. Sensor de temperatura falha com frequência. Verificar nível do óleo a cada abastecimento.",
    "ford ranger":        "Bicos injetores, sensor MAF e pressão de combustível são os principais pontos. Verificar filtro de ar com frequência. Diesel exige uso de combustível de qualidade.",
    "renault kwid":       "Filtro de ar e cabos de ignição. Consumo elevado pode indicar injeção suja. Motor 1.0 SCe exige óleo 5W30 e troca a cada 10.000 km.",
  };

  const key = `${brand} ${model}`.toLowerCase();
  for (const [pattern, text] of Object.entries(db)) {
    if (key.includes(pattern)) return text;
  }
  return `${brand} ${model}: recomendamos verificação completa do sistema de ignição, injeção e arrefecimento. Realize scanner de diagnóstico para leitura de códigos de falha. Mantenha revisões em dia conforme manual do fabricante.`;
}

// ─── mock fallback ────────────────────────────────────────────────────────────

function mockPayload(plate: string): DiagnosticResponse {
  return {
    source: "mock",
    vehicle: { plate, brand: "VOLKSWAGEN", model: "GOL", year: "2019", fuel: "Flex", color: "Prata" },
    fipe: { value: "R$ 38.500", reference: "Maio/2026" },
    diagnosis: {
      summary: "[MODO LIMITADO] APIs externas indisponíveis. Dados simulados para demonstração.",
      recommendations: [
        "Desgaste em cabos de vela e corpo de borboleta são comuns neste modelo.",
        "Verificar marcha lenta e filtro de combustível.",
        "Recomendamos inspeção presencial para diagnóstico real.",
      ],
    },
  };
}

// ─── n8n (opcional) ───────────────────────────────────────────────────────────

async function fetchFromN8n(plate: string): Promise<DiagnosticResponse | null> {
  const url    = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.API_KEY_N8N;
  if (!url) return null;

  const parsed = new URL(url);
  const webhookUrl =
    parsed.pathname === "/" || parsed.pathname === ""
      ? `${url}/webhook/vehicle-identify`
      : url;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  try {
    const res  = await fetch(webhookUrl, {
      method: "POST", headers,
      body: JSON.stringify({ plate }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = await res.text();
    console.log(`[n8n] status=${res.status} body=${body.slice(0, 200)}`);
    if (!res.ok) return null;

    const d = JSON.parse(body) as Record<string, unknown>;
    // aceita formato legado OU novo contrato
    if (d?.vehicle && d?.diagnosis) return d as unknown as DiagnosticResponse;
    if (d?.plate && d?.brand) {
      const diag = await generateDiagnosis(String(d.brand), String(d.model ?? ""), String(d.year ?? ""));
      return {
        source: "n8n",
        vehicle: { plate: String(d.plate), brand: String(d.brand), model: String(d.model ?? ""), year: String(d.year ?? "N/A"), fuel: String(d.fuel ?? "N/A"), color: String(d.color ?? "N/A") },
        fipe: { value: null, reference: null },
        diagnosis: diag,
      };
    }
    return null;
  } catch (err) {
    console.error("[n8n] erro:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin",  process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")    return res.status(405).json({ message: "Method not allowed" });

  // ENV audit
  console.log("[identify] ENV:", {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL  ? `SET (${process.env.N8N_WEBHOOK_URL})` : "MISSING",
    API_KEY_N8N:     process.env.API_KEY_N8N      ? "SET" : "MISSING",
    APIBRASIL_KEY:   process.env.APIBRASIL_KEY    ? "SET" : "MISSING",
    OPENAI_API_KEY:  process.env.OPENAI_API_KEY   ? "SET" : "MISSING",
  });

  const rawPlate = req.body?.plate;
  if (!rawPlate || typeof rawPlate !== "string") {
    return res.status(400).json({ message: "Campo 'plate' obrigatório." });
  }

  const plate = normalizePlate(rawPlate);
  if (!isValidPlate(plate)) {
    return res.status(400).json({ message: "Placa inválida. Formato: ABC1234 ou ABC1D23." });
  }

  console.log("[identify] placa:", plate);

  try {
    // ── Camada 1: n8n (webhook externo, opcional) ──────────────────────────
    const n8nResult = await fetchFromN8n(plate);
    if (n8nResult) {
      console.log("[identify] ✓ respondido via n8n");
      return res.status(200).json(n8nResult);
    }

    // ── Camada 2: APIBrasil ────────────────────────────────────────────────
    const apiBrasilKey = process.env.APIBRASIL_KEY;
    if (apiBrasilKey) {
      // dados + fipe em paralelo
      const [vehicleData, fipeData] = await Promise.allSettled([
        fetchDados(plate, apiBrasilKey),
        fetchFipe(plate, apiBrasilKey),
      ]);

      const vehicle = vehicleData.status === "fulfilled" ? vehicleData.value : null;

      if (vehicle) {
        const diagnosis = await generateDiagnosis(vehicle.brand, vehicle.model, vehicle.year);
        const fipe =
          fipeData.status === "fulfilled" && fipeData.value
            ? fipeData.value
            : { value: null, reference: null };

        console.log("[identify] ✓ respondido via APIBrasil");
        return res.status(200).json({
          source: "apibrasil",
          vehicle: { ...vehicle, plate },
          fipe,
          diagnosis,
        } satisfies DiagnosticResponse);
      }
    } else {
      console.warn("[identify] APIBRASIL_KEY ausente");
    }

    // ── Camada 3: mock (último recurso — sempre 200) ───────────────────────
    console.warn("[identify] ⚠ todos os providers falharam — retornando mock");
    return res.status(200).json(mockPayload(plate));

  } catch (err) {
    console.error("[identify] exceção não tratada:", err);
    return res.status(200).json(mockPayload(plate));
  }
}
