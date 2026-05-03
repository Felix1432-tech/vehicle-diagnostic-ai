import { z } from "zod";
export const vehicleIdentitySchema = z.object({
    plate: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1),
    model: z.string().trim().min(1),
    year: z.string().trim().min(1).optional(),
    version: z.string().trim().min(1).optional()
});
export const identifyVehicleRequestSchema = z.object({
    plate: z
        .string()
        .trim()
        .min(7, "Plate must have at least 7 characters")
        .max(8, "Plate must have at most 8 characters")
        .transform((value) => value.replace(/-/g, "").toUpperCase())
        .refine((value) => /^[A-Z]{3}[0-9]{4}$/.test(value) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(value), "Plate must match ABC1234 or ABC1D23")
});
export const identifyVehicleResponseSchema = z.object({
    plate: z.string().trim().min(1),
    brand: z.string().trim().min(1),
    model: z.string().trim().min(1),
    year: z.string().trim().min(1),
    diagnostic: z.string().trim().min(1)
});
