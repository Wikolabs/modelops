"use client";
import { useState } from "react";

const PRODUCT = "ModelOps";

const PAL = {
  bg: "#0E1A14",
  bg2: "#142822",
  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.09)",
  txt1: "#E8F5EC",
  txt2: "#90A8A0",
  txt3: "#566B65",
  accent: "#10B981",
  accentSoft: "rgba(16,185,129,0.12)",
  accentBorder: "rgba(16,185,129,0.30)",
  accentGlow: "rgba(16,185,129,0.18)",
  navBg: "rgba(14,26,20,0.82)",
};

export default function DemoPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [useCase, setUseCase] = useState("");
  const [dataset, setDataset] = useState("");
  const [rows, setRows] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [staticMode, setStaticMode] = useState(false);

  const t = lang === "fr" ? {
    back: "Retour", title: "Demo", sub: PRODUCT + " — plan de fine-tuning et monitoring projete",
    desc: "Decrivez votre cas d'usage et votre dataset. Le moteur genere un plan d'entrainement, des metriques projetees et une configuration de monitoring de production. Aucun GPU n'est reellement provisionne — c'est un POC qui montre la logique de production.",
    useCaseLabel: "Cas d'usage", useCasePlaceholder: "ex: classification d'emails entrants en 5 categories support pour automatiser le routage",
    datasetLabel: "Type de dataset", datasetPlaceholder: "ex: CSV emails support 18 mois, 2 colonnes (text, label)",
    rowsLabel: "Volume (lignes)", rowsPlaceholder: "ex: 12000",
    generate: "Generer le plan ML", generating: "Calcul en cours...",
    briefTitle: "Plan de fine-tuning genere", emptyHint: "Le plan d'entrainement, metriques et monitoring s'afficheront ici.",
    launchTrain: "Lancer l'entrainement", deployEndpoint: "Deployer l'endpoint", openMlflow: "Ouvrir MLflow",
    trainMock: "Job d'entrainement #fttn-8194 file dans le cluster GPU (mode demo, pas de provisioning reel)",
    deployedMock: "Endpoint REST deploye : https://api.modelops.demo/v1/predict (mode demo, pas de modele reel)",
    mlflowMock: "Ouverture de MLflow workspace prod (mode demo, lien factice)",
    fallback: "Mode statique : la cle LLM sera ajoutee au prochain deploiement.",
    poweredBy: "Modele :",
    note: "DEMO POC — aucun GPU reellement provisionne, aucune connexion a MLflow / SageMaker / Hugging Face. L'IA imagine le plan pour la demonstration.",
  } : {
    back: "Back", title: "Demo", sub: PRODUCT + " — fine-tuning plan and projected monitoring",
    desc: "Describe your use case and dataset. The engine generates a training plan, projected metrics and a production monitoring configuration. No GPU is actually provisioned — this is a POC showing production logic.",
    useCaseLabel: "Use case", useCasePlaceholder: "e.g. classify incoming emails into 5 support categories to automate routing",
    datasetLabel: "Dataset type", datasetPlaceholder: "e.g. 18-month support emails CSV, 2 cols (text, label)",
    rowsLabel: "Volume (rows)", rowsPlaceholder: "e.g. 12000",
    generate: "Generate ML plan", generating: "Computing...",
    briefTitle: "Generated fine-tuning plan", emptyHint: "Training plan, metrics and monitoring will appear here.",
    launchTrain: "Launch training", deployEndpoint: "Deploy endpoint", openMlflow: "Open MLflow",
    trainMock: "Training job #fttn-8194 queued on GPU cluster (demo mode, no real provisioning)",
    deployedMock: "REST endpoint deployed: https://api.modelops.demo/v1/predict (demo mode, no real model)",
    mlflowMock: "Opening MLflow prod workspace (demo mode, fake link)",
    fallback: "Static mode: LLM key will be added at next deploy.",
    poweredBy: "Model:",
    note: "DEMO POC — no real GPU provisioning, no connection to MLflow / SageMaker / Hugging Face. The AI imagines the plan for demonstration.",
  };

  async function generate() {
    setError(""); setBrief(""); setModel(""); setStaticMode(false);
    if (!useCase.trim()) {
      setError(lang === "fr" ? "Decrivez le cas d'usage." : "Describe the use case.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCase: useCase.trim(), dataset: dataset.trim(), rows: rows.trim(), lang }),
      });
      const j = await r.json();
      if (j.error === "llm_not_configured") {
        setBrief(j.mockBrief || "");
        setStaticMode(true);
      } else if (j.error) {
        setError(j.message || j.error);
      } else {
        setBrief(j.brief || "");
        setModel(j.model || "");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  return (
    <div style={{ minHeight: "100vh", background: PAL.bg, color: PAL.txt1, display: "flex", flexDirection: "column" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .wk-input { width: 100%; padding: 12px 14px; border-radius: 10px; background: ${PAL.surface}; border: 1px solid ${PAL.border}; color: ${PAL.txt1}; font-family: inherit; font-size: 14px; transition: border-color .2s, background .2s; }
        .wk-input:focus { outline: none; border-color: ${PAL.accent}; background: ${PAL.surfaceHover}; }
        .wk-btn-primary { background: ${PAL.accent}; color: #04140C; border: none; border-radius: 10px; padding: 13px 22px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; transition: opacity .2s, transform .2s; display: inline-flex; align-items: center; gap: 8px; }
        .wk-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .wk-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .wk-btn-ghost { background: ${PAL.surface}; color: ${PAL.txt1}; border: 1px solid ${PAL.border}; border-radius: 10px; padding: 9px 14px; font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; transition: background .2s, border-color .2s; display: inline-flex; align-items: center; gap: 6px; }
        .wk-btn-ghost:hover { background: ${PAL.surfaceHover}; border-color: ${PAL.accentBorder}; }
        .wk-md p, .wk-md ul { margin: 0 0 10px; }
        .wk-md ul { padding-left: 18px; }
        .wk-md li { margin-bottom: 4px; line-height: 1.65; }
        .wk-md strong { color: ${PAL.accent}; font-weight: 700; display: block; margin-top: 10px; margin-bottom: 4px; font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; }
        @media (max-width: 768px) {
          .demo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <nav style={{ padding: "16px 32px", borderBottom: `1px solid ${PAL.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: PAL.navBg, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ color: PAL.accent, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          ← {t.back} {PRODUCT}<span style={{ color: PAL.accent }}>.</span>
        </a>
        <div style={{ display: "inline-flex", border: `1px solid ${PAL.border}`, borderRadius: 100, padding: 2, background: PAL.surface }}>
          <button onClick={() => setLang("fr")} style={{ background: lang === "fr" ? PAL.accent : "transparent", color: lang === "fr" ? "#04140C" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>FR</button>
          <button onClick={() => setLang("en")} style={{ background: lang === "en" ? PAL.accent : "transparent", color: lang === "en" ? "#04140C" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>EN</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 700, margin: "0 0 6px" }}>
          {t.title} · <em style={{ fontStyle: "italic", color: PAL.accent }}>{PRODUCT}</em>
        </h1>
        <p style={{ color: PAL.txt2, fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 720, margin: "0 0 6px" }}>{t.sub}</p>
        <p style={{ color: PAL.txt3, fontSize: "0.78rem", lineHeight: 1.55, maxWidth: 720, margin: "0 0 28px" }}>{t.desc}</p>

        <div className="demo-grid" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}>
          <section style={{ background: PAL.surface, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: "0 0 14px" }}>{t.useCaseLabel}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              <textarea className="wk-input" value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder={t.useCasePlaceholder} rows={3} style={{ resize: "vertical", fontFamily: "inherit" }} />
              <label style={{ fontSize: 11, color: PAL.txt3, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginTop: 6 }}>{t.datasetLabel}</label>
              <input className="wk-input" value={dataset} onChange={(e) => setDataset(e.target.value)} placeholder={t.datasetPlaceholder} />
              <label style={{ fontSize: 11, color: PAL.txt3, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginTop: 6 }}>{t.rowsLabel}</label>
              <input className="wk-input" value={rows} onChange={(e) => setRows(e.target.value)} placeholder={t.rowsPlaceholder} />
            </div>
            <button className="wk-btn-primary" disabled={loading} onClick={generate} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? `⏳ ${t.generating}` : `🧠 ${t.generate}`}
            </button>
            {error && <div style={{ marginTop: 12, color: "#F87171", fontSize: 13, padding: "8px 12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8 }}>{error}</div>}
            <p style={{ color: PAL.txt3, fontSize: 11, lineHeight: 1.5, marginTop: 18, marginBottom: 0, paddingTop: 14, borderTop: `1px solid ${PAL.border}` }}>{t.note}</p>
          </section>

          <section style={{ background: PAL.bg2, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22, minHeight: 420, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: brief ? "#22C55E" : PAL.txt3 }} />
                {t.briefTitle}
              </h2>
              {model && <span style={{ fontSize: 10, color: PAL.txt3, fontFamily: "monospace" }}>{t.poweredBy} {model}</span>}
            </div>

            {!brief ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: PAL.txt3, fontSize: 14, textAlign: "center", padding: 30 }}>
                {t.emptyHint}
              </div>
            ) : (
              <div className="wk-md" style={{ color: PAL.txt1, fontSize: 14, lineHeight: 1.7, flex: 1 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(brief) }} />
            )}

            {brief && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18, paddingTop: 18, borderTop: `1px solid ${PAL.border}` }}>
                <button className="wk-btn-ghost" onClick={() => showToast(t.trainMock)}>🚀 {t.launchTrain}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.deployedMock)}>📡 {t.deployEndpoint}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.mlflowMock)}>📈 {t.openMlflow}</button>
              </div>
            )}
            {staticMode && <div style={{ marginTop: 14, color: PAL.txt3, fontSize: 12, fontStyle: "italic" }}>{t.fallback}</div>}
          </section>
        </div>
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: PAL.surface, border: `1px solid ${PAL.accentBorder}`, borderRadius: 12, padding: "12px 20px", color: PAL.txt1, fontSize: 13, fontWeight: 600, zIndex: 50, backdropFilter: "blur(20px)", boxShadow: "0 8px 28px rgba(0,0,0,0.4)" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const blocks: string[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length) {
      blocks.push("<ul>" + listBuf.map((l) => `<li>${l}</li>`).join("") + "</ul>");
      listBuf = [];
    }
  };
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith("- ")) {
      listBuf.push(esc(line.slice(2)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"));
    } else if (line.startsWith("**") && line.endsWith("**")) {
      flushList();
      blocks.push(`<strong>${esc(line.slice(2, -2))}</strong>`);
    } else {
      flushList();
      blocks.push(`<p>${esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
    }
  }
  flushList();
  return blocks.join("");
}
