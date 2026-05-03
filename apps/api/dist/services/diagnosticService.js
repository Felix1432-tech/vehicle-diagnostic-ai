import { createMockLlmAdapter } from "../adapters/llm/mockLlmAdapter.js";
const llmAdapter = createMockLlmAdapter();
export const generateDiagnosis = (vehicle) => {
    const brand = vehicle.brand.toLowerCase();
    const model = vehicle.model.toLowerCase();
    if (brand === "toyota" && model.includes("corolla")) {
        return "Possível falha comum em Corolla: bobina de ignição.";
    }
    if (brand === "volkswagen" && model.includes("gol")) {
        return "Possível falha comum em Gol: desgaste em cabos de vela e corpo de borboleta.";
    }
    if (brand === "fiat" && model.includes("uno")) {
        return "Possível falha comum em Uno: sujeira no sistema de injeção e falha em velas.";
    }
    if (brand === "ford" && model.includes("ranger")) {
        return "Possível falha comum em Ranger: verificar bicos injetores, sensor MAF e pressão de combustível.";
    }
    return "Recomendamos uma verificação completa do sistema de ignição e injeção.";
};
export const buildDiagnosticPrompt = (vehicle) => {
    return [
        "Você é um assistente técnico automotivo.",
        "Gere um diagnóstico inicial curto e estruturado.",
        `Marca: ${vehicle.brand}`,
        `Modelo: ${vehicle.model}`,
        `Ano: ${vehicle.year}`,
        'Formato esperado: "Possíveis causas: ... Recomendações: ..."'
    ].join("\n");
};
export const generateDiagnosisWithAI = async (vehicle) => {
    const prompt = buildDiagnosticPrompt(vehicle);
    const aiOutput = await llmAdapter.generateDiagnostic(prompt, vehicle);
    if (!aiOutput || !aiOutput.trim()) {
        return generateDiagnosis(vehicle);
    }
    return aiOutput;
};
