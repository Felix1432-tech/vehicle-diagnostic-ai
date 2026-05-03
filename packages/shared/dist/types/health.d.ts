import type { z } from "zod";
import { healthResponseSchema } from "../schemas/health.js";
export type HealthResponse = z.infer<typeof healthResponseSchema>;
//# sourceMappingURL=health.d.ts.map