export interface VehicleResult {
  plate: string;
  brand: string;
  model: string;
  year: string;
  color?: string;
  fuel?: string;
  diagnostic: string;
  source: "n8n" | "apibrasil" | "mock";
}

export interface ApiError {
  message: string;
}

const BASE = import.meta.env.VITE_API_URL ?? "";

export async function identifyVehicle(plate: string): Promise<VehicleResult> {
  const res = await fetch(`${BASE}/api/vehicle/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plate }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).message ?? "Erro ao consultar o veículo.");
  }

  return data as VehicleResult;
}
