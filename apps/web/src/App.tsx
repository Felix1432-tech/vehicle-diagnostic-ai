import { useState, useRef } from "react";
import { identifyVehicle, type DiagnosticResult, type DataSource } from "./api";

// ─── utils ────────────────────────────────────────────────────────────────────

function normalizePlate(raw: string) {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);
}

function isValidPlate(p: string) {
  return /^[A-Z]{3}[0-9]{4}$/.test(p) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p);
}

function fuelIcon(fuel: string) {
  const f = fuel.toUpperCase();
  if (f.includes("DIESEL"))   return "⛽";
  if (f.includes("ELET"))     return "⚡";
  if (f.includes("HIBRID"))   return "🔋";
  if (f.includes("GAS"))      return "🔥";
  return "♻️";
}

// ─── icons ────────────────────────────────────────────────────────────────────

const IconCar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);

const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l7.58-7.58a1 1 0 0 0 0-1.42Z"/>
    <circle cx="7" cy="7" r="1.5"/>
  </svg>
);

const IconWrench = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

// ─── skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="results-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`card sk-card ${i === 2 ? "card-wide" : ""}`}>
          <div className="sk sk-head" />
          <div className="sk sk-line" />
          <div className="sk sk-line sk-short" />
        </div>
      ))}
    </div>
  );
}

// ─── status card ──────────────────────────────────────────────────────────────

function StatusCard({ source }: { source: DataSource }) {
  const isMock = source === "mock";
  const label  = source === "n8n" ? "n8n + APIBrasil" : source === "apibrasil" ? "APIBrasil" : "Modo Limitado";

  return (
    <div className={`card status-card ${isMock ? "status-mock" : "status-live"}`}>
      <div className="card-header">
        <span className={`card-icon ${isMock ? "icon-warn" : "icon-ok"}`}>
          {isMock ? <IconAlert /> : <IconCheck />}
        </span>
        <span className="card-label">Status da Consulta</span>
      </div>
      <div className="status-body">
        <span className={`status-pill ${isMock ? "pill-mock" : "pill-live"}`}>
          {isMock ? "⚠ Mock" : "● Dados Reais"}
        </span>
        <p className="status-text">
          {isMock
            ? "APIs externas indisponíveis. Os dados exibidos são simulados para demonstração."
            : `Informações obtidas via ${label} em tempo real.`}
        </p>
      </div>
    </div>
  );
}

// ─── vehicle card ─────────────────────────────────────────────────────────────

function VehicleCard({ v }: { v: DiagnosticResult["vehicle"] }) {
  const rows = [
    { label: "Marca",       value: v.brand },
    { label: "Modelo",      value: v.model },
    { label: "Ano",         value: v.year },
    { label: "Combustível", value: `${fuelIcon(v.fuel)} ${v.fuel}` },
    { label: "Cor",         value: v.color },
    { label: "Placa",       value: v.plate },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon icon-accent"><IconCar /></span>
        <span className="card-label">Dados do Veículo</span>
      </div>
      <div className="vehicle-grid">
        {rows.map(({ label, value }) => (
          <div key={label} className="vrow">
            <span className="vrow-label">{label}</span>
            <span className="vrow-value">{value || "N/A"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── fipe card ────────────────────────────────────────────────────────────────

function FipeCard({ fipe }: { fipe: DiagnosticResult["fipe"] }) {
  return (
    <div className="card fipe-card">
      <div className="card-header">
        <span className="card-icon icon-accent"><IconTag /></span>
        <span className="card-label">Valor FIPE</span>
      </div>
      {fipe.value ? (
        <>
          <div className="fipe-value">{fipe.value}</div>
          {fipe.reference && (
            <span className="fipe-ref">Referência: {fipe.reference}</span>
          )}
        </>
      ) : (
        <div className="fipe-unavailable">
          <IconInfo />
          <span>Valor FIPE não disponível para esta placa</span>
        </div>
      )}
    </div>
  );
}

// ─── diagnosis card ───────────────────────────────────────────────────────────

function DiagnosisCard({ diagnosis }: { diagnosis: DiagnosticResult["diagnosis"] }) {
  return (
    <div className="card card-wide">
      <div className="card-header">
        <span className="card-icon icon-accent"><IconWrench /></span>
        <span className="card-label">Diagnóstico Preliminar</span>
      </div>
      <div className="diag-summary">{diagnosis.summary}</div>
      {diagnosis.recommendations.length > 0 && (
        <ul className="diag-recs">
          {diagnosis.recommendations.map((r, i) => (
            <li key={i} className="diag-rec">
              <span className="rec-dot" />
              {r}
            </li>
          ))}
        </ul>
      )}
      <p className="diag-disclaimer">
        Diagnóstico gerado por IA com base em padrões do modelo. Recomendamos inspeção presencial.
      </p>
    </div>
  );
}

// ─── error state ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="error-state">
      <div className="error-icon"><IconAlert /></div>
      <div>
        <strong>Não foi possível consultar o veículo</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

// ─── main app ─────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "success" | "error";

export default function App() {
  const [raw, setRaw]       = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const inputRef            = useRef<HTMLInputElement>(null);

  const plate = normalizePlate(raw);
  const valid = isValidPlate(plate);
  const ready = valid && status !== "loading";

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = normalizePlate(e.target.value);
    setRaw(val);
    if (status !== "idle") { setStatus("idle"); setResult(null); setErrMsg(""); }
  }

  return (
    <div className="shell">

      {/* ── header ── */}
      <header className="topbar">
        <div className="logo">
          <span className="logo-hex">⬡</span>
          <span>Felix<span className="logo-hi">AI</span></span>
        </div>
        <nav className="topbar-right">
          <span className="chip-beta">Beta</span>
        </nav>
      </header>

      {/* ── hero ── */}
      <main className="main">
        <section className="hero">
          <p className="eyebrow">Diagnóstico Automotivo com IA</p>
          <h1 className="hero-h1">
            Consulte qualquer veículo<br />
            <em className="hero-em">em segundos</em>
          </h1>
          <p className="hero-sub">
            Insira a placa e receba informações do veículo, valor FIPE e um diagnóstico
            preliminar gerado por inteligência artificial.
          </p>
        </section>

        {/* ── search ── */}
        <form className="search-box" onSubmit={handleSearch}>
          <label className="search-label" htmlFor="plate">Placa do veículo</label>
          <div className="search-row">
            <div className="input-group">
              <input
                id="plate"
                ref={inputRef}
                value={plate}
                onChange={handleChange}
                placeholder="ABC1D23"
                maxLength={7}
                disabled={status === "loading"}
                autoComplete="off"
                spellCheck={false}
                className={`plate-field ${plate.length > 0 && !valid ? "plate-invalid" : ""}`}
              />
              {plate.length > 0 && !valid && (
                <span className="field-hint">Formato aceito: ABC1234 ou ABC1D23</span>
              )}
            </div>
            <button type="submit" disabled={!ready} className="btn-cta">
              {status === "loading"
                ? <><span className="btn-spin" />Consultando…</>
                : <><IconSearch /><span>Diagnosticar veículo</span></>
              }
            </button>
          </div>
        </form>

        {/* ── states ── */}
        {status === "loading" && <Skeleton />}

        {status === "error" && <ErrorState message={errMsg} />}

        {status === "success" && result && (
          <div className="results-grid" role="region" aria-label="Resultado da consulta">
            <VehicleCard v={result.vehicle} />
            <FipeCard fipe={result.fipe} />
            <DiagnosisCard diagnosis={result.diagnosis} />
            <StatusCard source={result.source} />
          </div>
        )}
      </main>

      {/* ── footer ── */}
      <footer className="foot">
        <span>© 2026 Felix AI — Diagnóstico Automotivo para Oficinas</span>
      </footer>
    </div>
  );
}
