import { z } from "zod";
export declare const vehicleIdentitySchema: z.ZodObject<{
    plate: z.ZodOptional<z.ZodString>;
    brand: z.ZodString;
    model: z.ZodString;
    year: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    brand: string;
    model: string;
    plate?: string | undefined;
    year?: string | undefined;
    version?: string | undefined;
}, {
    brand: string;
    model: string;
    plate?: string | undefined;
    year?: string | undefined;
    version?: string | undefined;
}>;
export declare const identifyVehicleRequestSchema: z.ZodObject<{
    plate: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strip", z.ZodTypeAny, {
    plate: string;
}, {
    plate: string;
}>;
export declare const identifyVehicleResponseSchema: z.ZodObject<{
    plate: z.ZodString;
    brand: z.ZodString;
    model: z.ZodString;
    year: z.ZodString;
    diagnostic: z.ZodString;
}, "strip", z.ZodTypeAny, {
    plate: string;
    brand: string;
    model: string;
    year: string;
    diagnostic: string;
}, {
    plate: string;
    brand: string;
    model: string;
    year: string;
    diagnostic: string;
}>;
//# sourceMappingURL=vehicle.d.ts.map