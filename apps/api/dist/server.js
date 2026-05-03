import "dotenv/config";
import { identifyVehicleRequestSchema, identifyVehicleResponseSchema } from "@core/shared/schemas";
import Fastify from "fastify";
import { z } from "zod";
import { generateDiagnosis, generateDiagnosisWithAI } from "./services/diagnosticService.js";
const envSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(3001),
    CORS_ORIGIN: z.string().default("*")
});
const env = envSchema.parse(process.env);
const app = Fastify({
    logger: true
});
app.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", env.CORS_ORIGIN);
    reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
    if (request.method === "OPTIONS") {
        return reply.status(204).send();
    }
});
app.get("/health", async () => {
    return {
        status: "ok",
        service: "api",
        env: env.NODE_ENV
    };
});
app.post("/vehicle/identify", async (request, reply) => {
    const parseResult = identifyVehicleRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            message: "Invalid vehicle identification payload",
            issues: parseResult.error.flatten()
        });
    }
    const normalizedPlate = parseResult.data.plate.replace(/-/g, "").toUpperCase();
    const vehicle = {
        brand: "Toyota",
        model: "Corolla",
        year: "2022"
    };
    let diagnostic = generateDiagnosis(vehicle);
    try {
        diagnostic = await generateDiagnosisWithAI(vehicle);
    }
    catch {
        diagnostic = generateDiagnosis(vehicle);
    }
    const response = identifyVehicleResponseSchema.parse({
        plate: normalizedPlate,
        ...vehicle,
        diagnostic
    });
    return reply.send(response);
});
const start = async () => {
    try {
        await app.listen({ host: "0.0.0.0", port: env.PORT });
    }
    catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};
start();
