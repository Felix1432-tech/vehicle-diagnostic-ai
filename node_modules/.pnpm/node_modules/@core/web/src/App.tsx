import {
  identifyVehicleRequestSchema,
  identifyVehicleResponseSchema
} from "@core/shared/schemas";
import type { IdentifyVehicleResponse } from "@core/shared/types";
import { useState } from "react";

const invalidPlateMessage = "Placa inválida. Use formato ABC1234 ou ABC1D23";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export default function App() {
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState<IdentifyVehicleResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setVehicle(null);

    const parseResult = identifyVehicleRequestSchema.safeParse({ plate });

    if (!parseResult.success) {
      setError(invalidPlateMessage);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/vehicle/identify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parseResult.data)
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        if (response.status === 400) {
          throw new Error(invalidPlateMessage);
        }

        throw new Error(payload?.message ?? "Não foi possível identificar o veículo.");
      }

      const data = identifyVehicleResponseSchema.parse(await response.json());
      setVehicle(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocorreu um erro inesperado ao identificar o veículo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Core Platform</p>
        <h1>Vehicle Diagnostic</h1>
        <p className="copy">
          Estrutura base do frontend criada com Vite, React e TypeScript.
        </p>

        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <label className="field">
            <span>Placa</span>
            <input
              type="text"
              value={plate}
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
              placeholder="ABC1D23"
              aria-invalid={error ? "true" : "false"}
              disabled={loading}
            />
          </label>

          <button className="search-button" type="submit" disabled={loading}>
            {loading ? "buscando..." : "buscar"}
          </button>

          {loading ? (
            <p className="feedback loading">Buscando dados do veículo...</p>
          ) : null}
          {error ? <p className="feedback error">{error}</p> : null}

          {vehicle ? (
            <div className="result-card">
              <h2>Resultado</h2>
              <dl>
                <div>
                  <dt>Placa</dt>
                  <dd>{vehicle.plate}</dd>
                </div>
                <div>
                  <dt>Marca</dt>
                  <dd>{vehicle.brand}</dd>
                </div>
                <div>
                  <dt>Modelo</dt>
                  <dd>{vehicle.model}</dd>
                </div>
                <div>
                  <dt>Ano</dt>
                  <dd>{vehicle.year}</dd>
                </div>
              </dl>

              <div className="diagnostic-card">
                <p className="diagnostic-label">Sugestão inicial</p>
                <p className="diagnostic-copy">{vehicle.diagnostic}</p>
              </div>
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}
