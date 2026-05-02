import type { z } from "zod";
import {
  identifyVehicleRequestSchema,
  identifyVehicleResponseSchema,
  vehicleIdentitySchema
} from "../schemas/vehicle";

export type VehicleIdentity = z.infer<typeof vehicleIdentitySchema>;
export type IdentifyVehicleRequest = z.infer<typeof identifyVehicleRequestSchema>;
export type IdentifyVehicleResponse = z.infer<typeof identifyVehicleResponseSchema>;
