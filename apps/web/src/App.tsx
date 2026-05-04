
import { useState } from "react";

export default function App() {
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setVehicle(null);

    try {
      const response = await fetch("/api/vehicle/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plate })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro");
      }

      setVehicle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <h1>Vehicle Diagnostic</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="ABC1D23"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>

          {error && <p>{error}</p>}

          {vehicle && (
            <pre>{JSON.stringify(vehicle, null, 2)}</pre>
          )}
        </form>
      </section>
    </main>
  );
}