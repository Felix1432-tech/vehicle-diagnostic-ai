import Fastify from "fastify";
import cors from "@fastify/cors";
import { identifyVehicleRequestSchema } from "@core/shared/schemas";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
});

// ─── response contract ────────────────────────────────────────────────────────

interface DiagnosticResponse {
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

// ─── APIBrasil ────────────────────────────────────────────────────────────────

interface ApiBrasilData {
  placa?:           string;
  fabricante?:      string;
  modelo?:          string;
  ano_fabricacao?:  number;
  ano_modelo?:      number;
  combustivel?:     string;
  cor?:             string;
  tipo_veiculo?:    string;
  uf_jurisdicao?:   string;
  cidade?:          string;
  [key: string]:    unknown;
}

interface ApiBrasilResponse {
  status_code?: number;
  error?:       boolean;
  message?:     string;
  homolog?:     boolean;
  data?:        ApiBrasilData;
  [key: string]: unknown;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(value);
}

async function fetchVehicle(plate: string, token: string): Promise<{
  brand: string; model: string; year: string; fuel: string; color: string;
  fipe: { value: string | null; reference: string | null };
} | null> {
  const endpoint =
    process.env.APIBRASIL_URL ??
    "https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits";

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ placa: plate, tipo: "agregados-basica", homolog: false }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    app.log.error({ err }, "[apibrasil] falha na requisição");
    return null;
  }

  const raw = await res.text();
  app.log.info(`[apibrasil] status=${res.status} body=${raw.slice(0, 300)}`);

  if (!res.ok) return null;

  let parsed: ApiBrasilResponse;
  try { parsed = JSON.parse(raw); } catch {
    app.log.error("[apibrasil] JSON inválido");
    return null;
  }

  if (parsed.error || parsed.status_code === 404) {
    app.log.error({ message: parsed.message }, "[apibrasil] erro na resposta");
    return null;
  }

  const item = parsed.data;
  if (!item) return null;

  const brand = String(item.fabricante ?? "").trim();
  const model = String(item.modelo    ?? "").trim();
  if (!brand || !model) return null;

  return {
    brand,
    model,
    year:  String(item.ano_modelo ?? item.ano_fabricacao ?? "N/A").trim(),
    fuel:  String(item.combustivel ?? "N/A").trim(),
    color: String(item.cor ?? "N/A").trim(),
    fipe: { value: null, reference: null },
  };
}

// ─── diagnosis ────────────────────────────────────────────────────────────────

function splitDiagnosis(text: string): { summary: string; recommendations: string[] } {
  const parts = text
    .split(/\.\s+|;\s*|\n/)
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter((s) => s.length > 6);
  const [summary = text, ...rest] = parts;
  return { summary: summary + ".", recommendations: rest.map((r) => r + ".") };
}

function localDiagnosis(brand: string, model: string): string {
  const db: Record<string, string> = {
    "volkswagen gol":    "Desgaste em cabos de vela e corpo de borboleta são comuns. Verificar marcha lenta. Inspecionar filtro de combustível a cada 10.000 km.",
    "volkswagen polo":   "Bobina de ignição e sensor de rotação são pontos críticos. Verificar chicote do sensor CKP. Inspecionar velas a cada 20.000 km.",
    "fiat uno":          "Sistema de injeção com sujeira acumulada é comum. Verificar filtro de combustível e bicos injetores.",
    "fiat strada":       "Superaquecimento recorrente por falha no sensor de temperatura. Verificar mangueiras do radiador.",
    "fiat palio":        "Bomba de combustível com vida útil curta. Manter nível do tanque acima de ¼.",
    "chevrolet onix":    "Sensor de posição do virabrequim e bobina de ignição são críticos. Motor 1.0 turbo exige troca de óleo em dia.",
    "toyota corolla":    "Bobina de ignição pode falhar após 80.000 km. Consumo elevado pode indicar injeção suja.",
    "honda civic":       "Junta do cabeçote é ponto de atenção após 100.000 km. Câmbio automático exige troca de óleo periódica.",
    "hyundai hb20":      "Sistema de arrefecimento e correia dentada no intervalo recomendado. Sensor de temperatura falha com frequência.",
    "ford ranger":       "Bicos injetores, sensor MAF e pressão de combustível são os principais pontos. Filtro de ar com frequência.",
    "renault kwid":      "Filtro de ar e cabos de ignição. Motor 1.0 SCe exige óleo 5W30 e troca a cada 10.000 km.",
  };
  const key = `${brand} ${model}`.toLowerCase();
  for (const [pattern, text] of Object.entries(db)) {
    if (key.includes(pattern)) return text;
  }
  return `${brand} ${model}: recomendamos verificação completa do sistema de ignição, injeção e arrefecimento. Realize scanner de diagnóstico para leitura de códigos de falha.`;
}

async function generateDiagnosis(
  brand: string, model: string, year: string
): Promise<{ summary: string; recommendations: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return splitDiagnosis(localDiagnosis(brand, model));

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

    if (!res.ok) return splitDiagnosis(localDiagnosis(brand, model));

    const data = await res.json();
    const content = (data?.choices?.[0]?.message?.content ?? "").trim();
    return content ? splitDiagnosis(content) : splitDiagnosis(localDiagnosis(brand, model));
  } catch {
    return splitDiagnosis(localDiagnosis(brand, model));
  }
}

// ─── n8n (opcional) ───────────────────────────────────────────────────────────

async function fetchFromN8n(plate: string): Promise<DiagnosticResponse | null> {
  const url    = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.API_KEY_N8N;
  if (!url) return null;

  const parsed     = new URL(url);
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
    if (!res.ok) return null;

    const d = await res.json() as Record<string, unknown>;
    if (d?.vehicle && d?.diagnosis) return d as unknown as DiagnosticResponse;

    if (d?.plate && d?.brand) {
      const diag = await generateDiagnosis(String(d.brand), String(d.model ?? ""), String(d.year ?? ""));
      return {
        source: "n8n",
        vehicle: {
          plate:  String(d.plate),
          brand:  String(d.brand),
          model:  String(d.model  ?? ""),
          year:   String(d.year   ?? "N/A"),
          fuel:   String(d.fuel   ?? "N/A"),
          color:  String(d.color  ?? "N/A"),
        },
        fipe: { value: null, reference: null },
        diagnosis: diag,
      };
    }
    return null;
  } catch (err) {
    app.log.error({ err }, "[n8n] erro");
    return null;
  }
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

// ─── routes ───────────────────────────────────────────────────────────────────

app.get("/health", async () => ({
  status: "ok" as const,
  service: "vehicle-diagnostic-core",
  env: process.env.NODE_ENV || "development",
}));

app.post("/api/vehicle/identify", async (request, reply) => {
  const parsed = identifyVehicleRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: parsed.error.issues[0]?.message ?? "Placa inválida.",
    });
  }

  const plate = parsed.data.plate;
  app.log.info({ plate }, "[identify] placa recebida");

  try {
    // Camada 1: n8n
    const n8nResult = await fetchFromN8n(plate);
    if (n8nResult) {
      app.log.info("[identify] respondido via n8n");
      return reply.send(n8nResult);
    }

    // Camada 2: APIBrasil
    const apiBrasilKey = process.env.APIBRASIL_KEY;
    if (apiBrasilKey) {
      const vehicleData = await fetchVehicle(plate, apiBrasilKey);
      if (vehicleData) {
        const diagnosis = await generateDiagnosis(vehicleData.brand, vehicleData.model, vehicleData.year);
        app.log.info("[identify] respondido via APIBrasil");
        return reply.send({
          source: "apibrasil",
          vehicle: { ...vehicleData, plate },
          fipe: vehicleData.fipe,
          diagnosis,
        } satisfies DiagnosticResponse);
      }
    } else {
      app.log.warn("[identify] APIBRASIL_KEY ausente");
    }

    // Camada 3: mock
    app.log.warn("[identify] todos os providers falharam — retornando mock");
    return reply.send(mockPayload(plate));

  } catch (err) {
    app.log.error({ err }, "[identify] exceção não tratada");
    return reply.send(mockPayload(plate));
  }
});

// ─── start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT) || 3000;

app.listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`Servidor rodando na porta ${port}`))
  .catch((err) => { app.log.error(err); process.exit(1); });
