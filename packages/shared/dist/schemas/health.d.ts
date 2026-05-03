import { z } from "zod";
export declare const healthResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    service: z.ZodString;
    env: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "ok";
    service: string;
    env: string;
}, {
    status: "ok";
    service: string;
    env: string;
}>;
//# sourceMappingURL=health.d.ts.map