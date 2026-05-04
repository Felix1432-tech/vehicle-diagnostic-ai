export interface VehicleInfo {
  plate: string;
  brand: string;
  model: string;
  year: string;
  fuel: string;
  color: string;
}

export interface FipeInfo {
  value: string | null;
  reference: string | null;
}

export interface DiagnosisInfo {
  summary: string;
  recommendations: string[];
}

export type DataSource = "apibrasil" | "n8n" | "mock";

export interface DiagnosticResult {
  vehicle: VehicleInfo;
  fipe: FipeInfo;
  diagnosis: DiagnosisInfo;
  source: DataSource;
}

const BASE = import.meta.env.VITE_API_URL ?? "";

export async function identifyVehicle(plate: string): Promise<DiagnosticResult> {
  const res = await fetch(`${BASE}/api/vehicle/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plate }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? "Erro ao consultar o veículo.");
  }

  return data as DiagnosticResult;
}
