import Fastify from "fastify";
import cors from "@fastify/cors";
import { identifyVehicleRequestSchema } from "@core/shared/schemas";
import { generateDiagnosisWithAI } from "./services/diagnosticService.js";

const app = Fastify();

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
});

app.get("/health", async () => {
  return {
    status: "ok" as const,
    service: "vehicle-diagnostic-core",
    env: process.env.NODE_ENV || "development",
  };
});

app.post("/vehicle/identify", async (request, reply) => {
  const parsed = identifyVehicleRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: parsed.error.issues[0]?.message ?? "Invalid plate format",
    });
  }

  const plate = parsed.data.plate;

  // TODO: replace with real plate lookup (database or external API)
  const vehicleMap: Record<string, { brand: string; model: string; year: string }> = {
    ABC1234: { brand: "Toyota", model: "Corolla", year: "2020" },
    DEF5G67: { brand: "Volkswagen", model: "Gol G5", year: "2015" },
    GHI6789: { brand: "Fiat", model: "Uno Mille", year: "2012" },
    JKL2M34: { brand: "Ford", model: "Ranger XLT", year: "2022" },
  };

  const vehicle = vehicleMap[plate];

  if (!vehicle) {
    return reply.status(404).send({
      message: "Veiculo nao encontrado para a placa informada",
    });
  }

  try {
    const diagnostic = await generateDiagnosisWithAI(vehicle);

    return {
      plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      diagnostic,
    };
  } catch (err) {
    console.error("Erro ao gerar diagnostico:", err);
    return reply.status(500).send({
      message: "Erro interno ao gerar diagnostico",
    });
  }
});

const port = Number(process.env.PORT) || 3000;

app.listen({ port, host: "0.0.0.0" })
  .then(() => {
    console.log(`Servidor rodando na porta ${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
