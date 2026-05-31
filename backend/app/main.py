"""ModelOps demo backend — production-ready POC.

In production: this service would schedule LoRA fine-tuning jobs on managed
GPU clusters, register artifacts in MLflow, deploy to a model server with
canary + auto-rollback, and stream drift metrics to Grafana. For the demo:
it only invokes the LLM and returns a simulated training/monitoring plan.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm import chat, is_configured

app = FastAPI(
    title="ModelOps Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es ModelOps, une plateforme MLOps qui gere fine-tuning, deploiement et monitoring de LLM custom (Llama, Mistral, Falcon) sur GPU geres. A partir d'une description de dataset et d'un cas d'usage, tu generes un plan d'entrainement et un rapport de monitoring de production simule.

Format de sortie exact en MARKDOWN :
**🧠 Plan de fine-tuning**
- [Modele de base recommande + justification (taille, licence, GPU requis)]
- [Hyperparametres : learning rate, batch size, epochs, LoRA rank]
- [Duree estimee + cout GPU estime en USD]

**📊 Metriques projetees**
- [Loss train / eval cible apres entrainement]
- [Benchmark vs modele de base (gain % sur tache cible)]
- [Latence inference moyenne attendue (p50 / p95)]

**📡 Monitoring production**
- [Data drift : KL divergence seuil, fenetre 24h]
- [Concept drift : derive accuracy seuil, alerte si >X% de degradation]
- [3 alertes critiques configurees avec destinataire]

**🚀 Plan de deploiement**
- [API REST endpoint, scaling auto, rollback strategy en 1 phrase]

Tu DOIS inventer un plan realiste pour la demo (jamais "je n'ai pas access aux donnees"). Tu joues l'ingenieur MLOps qui a deja analyse le dataset. Style technique senior. Maximum 320 mots."""

SYSTEM_PROMPT_EN = """You are ModelOps, an MLOps platform that handles fine-tuning, deployment and monitoring of custom LLMs (Llama, Mistral, Falcon) on managed GPU. From a dataset description and use case, you generate a training plan and a simulated production monitoring report.

Exact MARKDOWN output format:
**🧠 Fine-tuning plan**
- [Recommended base model + justification (size, license, GPU required)]
- [Hyperparameters: learning rate, batch size, epochs, LoRA rank]
- [Estimated duration + estimated GPU cost in USD]

**📊 Projected metrics**
- [Target train / eval loss after training]
- [Benchmark vs base model (% gain on target task)]
- [Expected average inference latency (p50 / p95)]

**📡 Production monitoring**
- [Data drift: KL divergence threshold, 24h window]
- [Concept drift: accuracy drift threshold, alert if >X% degradation]
- [3 critical alerts configured with recipient]

**🚀 Deployment plan**
- [REST API endpoint, auto-scaling, rollback strategy in 1 sentence]

You MUST invent a realistic plan for the demo (never "I have no data access"). You play the MLOps engineer that has already analyzed the dataset. Senior technical tone. Maximum 320 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    use_case: str = Field(..., min_length=1, max_length=200)
    dataset: str = Field("", max_length=200)
    rows: str = Field("", max_length=30)
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "modelops-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    use_case = req.use_case.strip()
    dataset = (req.dataset or "").strip()
    rows = (req.rows or "").strip()
    if not use_case:
        raise HTTPException(status_code=400, detail="use_case_required")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Cas d'usage : {use_case}\nDataset : {dataset or 'non specifie'}\nVolume : {rows or 'inconnu'} lignes\nGenere le plan d'entrainement et de monitoring."
        if req.lang == "fr"
        else f"Use case: {use_case}\nDataset: {dataset or 'not specified'}\nVolume: {rows or 'unknown'} rows\nGenerate the training and monitoring plan."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(use_case, dataset, rows, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=900,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(use_case, dataset, rows, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured)
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(use_case: str, dataset: str, rows: str, lang: str) -> str:
    rows_s = rows or "10k"
    if lang == "en":
        return (
            f"**🧠 Fine-tuning plan**\n"
            f"- Base model: Llama 3.1 8B Instruct — best price/quality for \"{use_case}\", Apache-compatible license, fits on a single A100 40GB.\n"
            f"- Hyperparameters: lr=2e-5, batch=16, epochs=3, LoRA rank=16, alpha=32, dropout=0.05.\n"
            f"- Estimated duration: 4h12min on 1xA100, estimated GPU cost: USD 18-24.\n\n"
            f"**📊 Projected metrics**\n"
            f"- Train loss target: 0.42, eval loss target: 0.51 after 3 epochs.\n"
            f"- +27% over base on task-specific benchmark (estimated from {rows_s}-row dataset class balance).\n"
            f"- Inference latency: p50 = 190ms, p95 = 380ms on managed endpoint.\n\n"
            f"**📡 Production monitoring**\n"
            f"- Data drift: KL divergence threshold 0.15 on input distribution, 24h rolling window.\n"
            f"- Concept drift: accuracy drop alert if eval set perf drops more than 3.5% over 7 days.\n"
            f"- Critical alerts: Slack `#mlops-prod-alerts`, PagerDuty rota `mlops-oncall`, email `data-leads@` for major regression.\n\n"
            f"**🚀 Deployment plan**\n"
            f"- REST API `POST /v1/predict`, auto-scale 2 to 16 replicas, canary 5% on every new version with auto-rollback after 30 min if error rate > 0.8%."
        )
    return (
        f"**🧠 Plan de fine-tuning**\n"
        f"- Modele de base : Llama 3.1 8B Instruct — meilleur ratio prix/qualite pour \"{use_case}\", licence compatible commercial, tient sur un seul A100 40GB.\n"
        f"- Hyperparametres : lr=2e-5, batch=16, epochs=3, LoRA rank=16, alpha=32, dropout=0.05.\n"
        f"- Duree estimee : 4h12min sur 1xA100, cout GPU estime : USD 18-24.\n\n"
        f"**📊 Metriques projetees**\n"
        f"- Loss train cible : 0.42, loss eval cible : 0.51 apres 3 epochs.\n"
        f"- +27% sur le benchmark specifique tache vs modele de base (estime depuis l'equilibre du dataset de {rows_s} lignes).\n"
        f"- Latence inference : p50 = 190ms, p95 = 380ms sur endpoint manage.\n\n"
        f"**📡 Monitoring production**\n"
        f"- Data drift : seuil divergence KL 0.15 sur distribution des inputs, fenetre glissante 24h.\n"
        f"- Concept drift : alerte chute d'accuracy si perf eval baisse de plus de 3.5% sur 7 jours.\n"
        f"- Alertes critiques : Slack `#mlops-prod-alerts`, PagerDuty rota `mlops-oncall`, email `data-leads@` pour regression majeure.\n\n"
        f"**🚀 Plan de deploiement**\n"
        f"- API REST `POST /v1/predict`, auto-scale 2 a 16 replicas, canary 5% sur chaque nouvelle version avec rollback auto sous 30 min si taux d'erreur > 0.8%."
    )
