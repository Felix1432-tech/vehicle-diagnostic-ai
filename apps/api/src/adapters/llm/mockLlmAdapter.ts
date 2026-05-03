import type { VehicleDescriptor } from "../../core/vehicle.js";

export type LlmAdapter = {
  generateDiagnostic(prompt: string, vehicle: VehicleDescriptor): Promise<string>;
};

export const createMockLlmAdapter = (): LlmAdapter => {
  return {
    async generateDiagnostic(_prompt, vehicle) {
      return [
        `Possíveis causas: padrões recorrentes observados em ${vehicle.brand} ${vehicle.model} ${vehicle.year}.`,
        "Recomendações: validar sistema de ignição, leitura de falhas e inspeção inicial da injeção."
      ].join(" ");
    }
  };
};
