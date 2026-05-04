import { useState, useRef } from "react";
import { identifyVehicle, type VehicleResult } from "./api";

// ─── helpers ────────────────────────────────────────────────────────────────

function normalizePlate(raw: string) {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);
}

function isValidPlate(p: string) {
  return /^[A-Z]{3}[0-9]{4}$/.test(p) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p);
}

function parseDiagnostic(text: string): string[] {
  return text
    .split(/\.\s+|;\s*|\n/)
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter((s) => s.length > 8);
}

function fuelLabel(raw?: string) {
  if (!raw) return null;
  const map: Record<string, string> = {
    FLEX: "Flex",
    GASOLINA: "Gasolina",
    ALCOOL: "Álcool",
    DIESEL: "Diesel",
    ELETRICO: "Elétrico",
    HIBRIDO: "Híbrido",
  };
  return map[raw.toUpperCase()] ?? raw;
}

// ─── icons (inline SVG, zero deps) ──────────────────────────────────────────

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── sub-components ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>Consultando placa...</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="result-shell skeleton-shell">
      <div className="sk sk-title" />
      <div className="sk-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="sk sk-block" />
        ))}
      </div>
      <div className="sk sk-diag" />
    </div>
  );
}

function SourceBadge({ source }: { source: VehicleResult["source"] }) {
  if (source === "mock") {
    return (
      <div className="degraded-banner">
        <AlertIcon />
        <span>Modo degradado — APIs externas indisponíveis. Dados simulados para demonstração.</span>
      </div>
    );
  }
  const label = source === "n8n" ? "n8n + APIBrasil" : "APIBrasil";
  return (
    <div className="source-badge">
      <CheckIcon />
      <span>Dados reais via {label}</span>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-pill">
      <span className="pill-label">{label}</span>
      <span className="pill-value">{value}</span>
    </div>
  );
}

function VehicleCard({ result }: { result: VehicleResult }) {
  const items = [
    { label: "Marca", value: result.brand },
    { label: "Modelo", value: result.model },
    { label: "Ano", value: result.year },
    result.color ? { label: "Cor", value: result.color } : null,
    result.fuel  ? { label: "Combustível", value: fuelLabel(result.fuel) ?? result.fuel } : null,
    { label: "Placa", value: result.plate },
  ].filter(Boolean) as { label: string; value: string }[];

  const sentences = parseDiagnostic(result.diagnostic);

  return (
    <div className="result-shell">
      <SourceBadge source={result.source} />

      {/* vehicle header */}
      <div className="vehicle-header">
        <div className="vehicle-icon-wrap">
          <CarIcon />
        </div>
        <div>
          <h2 className="vehicle-title">{result.brand} {result.model}</h2>
          <p className="vehicle-sub">{result.year} · {result.plate}</p>
        </div>
      </div>

      {/* info grid */}
      <div className="info-grid">
        {items.map((it) => (
          <InfoPill key={it.label} label={it.label} value={it.value} />
        ))}
      </div>

      {/* diagnostic */}
      <div className="diag-card">
        <div className="diag-header">
          <WrenchIcon />
          <span>Diagnóstico Inicial</span>
        </div>
        <ul className="diag-list">
          {sentences.map((s, i) => (
            <li key={i} className="diag-item">
              <span className="diag-dot" />
              {s}.
            </li>
          ))}
        </ul>
      </div>

      <p className="disclaimer">
        Este diagnóstico é preliminar. Recomendamos inspeção presencial em oficina credenciada.
      </p>
    </div>
  );
}

// ─── main app ────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "success" | "error";

export default function App() {
  const [raw, setRaw]       = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<VehicleResult | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const inputRef            = useRef<HTMLInputElement>(null);

  const plate = normalizePlate(raw);
  const ready = isValidPlate(plate) && status !== "loading";

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ready) return;

    setStatus("loading");
    setResult(null);
    setErrMsg("");

    try {
      const data = await identifyVehicle(plate);
      setResult(data);
      setStatus("success");
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : "Erro desconhecido.");
      setStatus("error");
    }
  }

  function handlePlateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRaw(normalizePlate(e.target.value));
    if (status !== "idle") {
      setStatus("idle");
      setResult(null);
      setErrMsg("");
    }
  }

  return (
    <div className="app-shell">
      {/* ── header ── */}
      <header className="top-bar">
        <div className="logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Felix<span className="logo-ai">AI</span></span>
        </div>
        <span className="badge-beta">Beta</span>
      </header>

      {/* ── hero ── */}
      <main className="hero">
        <p className="eyebrow">Diagnóstico Automotivo com IA</p>
        <h1 className="hero-title">
          Consulte qualquer<br />
          <span className="accent">veículo em segundos</span>
        </h1>
        <p className="hero-sub">
          Digite a placa e receba informações do veículo e um diagnóstico preliminar gerado por inteligência artificial.
        </p>

        {/* search panel */}
        <form className="search-panel" onSubmit={handleSearch}>
          <label className="search-label" htmlFor="plate-input">
            Placa do veículo
          </label>
          <div className="search-row">
            <div className="input-wrap">
              <input
                id="plate-input"
                ref={inputRef}
                value={plate}
                onChange={handlePlateChange}
                placeholder="ABC1D23"
                maxLength={7}
                disabled={status === "loading"}
                autoComplete="off"
                spellCheck={false}
                className={`plate-input ${plate.length > 0 && !isValidPlate(plate) ? "input-invalid" : ""}`}
              />
              {plate.length > 0 && !isValidPlate(plate) && (
                <span className="input-hint">Formato: ABC1234 ou ABC1D23</span>
              )}
            </div>
            <button
              type="submit"
              disabled={!ready}
              className="cta-button"
            >
              <SearchIcon />
              <span>Consultar</span>
            </button>
          </div>
        </form>

        {/* states */}
        <div className="result-area">
          {status === "loading" && (
            <>
              <Spinner />
              <SkeletonCard />
            </>
          )}

          {status === "error" && (
            <div className="error-card">
              <AlertIcon />
              <div>
                <strong>Não foi possível consultar o veículo</strong>
                <p>{errMsg}</p>
              </div>
            </div>
          )}

          {status === "success" && result && (
            <VehicleCard result={result} />
          )}
        </div>
      </main>

      {/* ── footer ── */}
      <footer className="app-footer">
        <span>© 2026 Felix AI — Diagnóstico Automotivo</span>
      </footer>
    </div>
  );
}
