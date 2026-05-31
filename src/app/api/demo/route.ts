import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es ModelOps, une plateforme MLOps qui gere fine-tuning, deploiement et monitoring de LLM custom (Llama, Mistral, Falcon) sur GPU geres. A partir d'une description de dataset et d'un cas d'usage, tu generes un plan d'entrainement et un rapport de monitoring de production simule.

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

Tu DOIS inventer un plan realiste pour la demo (jamais "je n'ai pas access aux donnees"). Tu joues l'ingenieur MLOps qui a deja analyse le dataset. Style technique senior. Maximum 320 mots.`;

const SYSTEM_PROMPT_EN = `You are ModelOps, an MLOps platform that handles fine-tuning, deployment and monitoring of custom LLMs (Llama, Mistral, Falcon) on managed GPU. From a dataset description and use case, you generate a training plan and a simulated production monitoring report.

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

You MUST invent a realistic plan for the demo (never "I have no data access"). You play the MLOps engineer that has already analyzed the dataset. Senior technical tone. Maximum 320 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const useCase: string = typeof body.useCase === "string" ? body.useCase.trim().slice(0, 200) : "";
    const dataset: string = typeof body.dataset === "string" ? body.dataset.trim().slice(0, 200) : "";
    const rows: string = typeof body.rows === "string" ? body.rows.trim().slice(0, 30) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!useCase) {
      return NextResponse.json(
        { error: lang === "fr" ? "Decrivez votre cas d'usage." : "Describe your use case." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(useCase, dataset, rows, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Cas d'usage : ${useCase}\nDataset : ${dataset || "non specifie"}\nVolume : ${rows || "inconnu"} lignes\nGenere le plan d'entrainement et de monitoring.`
      : `Use case: ${useCase}\nDataset: ${dataset || "not specified"}\nVolume: ${rows || "unknown"} rows\nGenerate the training and monitoring plan.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      900
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(useCase: string, dataset: string, rows: string, lang: "fr" | "en"): string {
  if (lang === "en") {
    return `**🧠 Fine-tuning plan**\n- Base model: Llama 3.1 8B Instruct — best price/quality for "${useCase}", Apache-compatible license, fits on a single A100 40GB.\n- Hyperparameters: lr=2e-5, batch=16, epochs=3, LoRA rank=16, alpha=32, dropout=0.05.\n- Estimated duration: 4h12min on 1×A100, estimated GPU cost: USD 18-24.\n\n**📊 Projected metrics**\n- Train loss target: 0.42, eval loss target: 0.51 after 3 epochs.\n- +27% over base on task-specific benchmark (estimated from ${rows || "10k"}-row dataset class balance).\n- Inference latency: p50 = 190ms, p95 = 380ms on managed endpoint.\n\n**📡 Production monitoring**\n- Data drift: KL divergence threshold 0.15 on input distribution, 24h rolling window.\n- Concept drift: accuracy drop alert if eval set perf drops more than 3.5% over 7 days.\n- Critical alerts: Slack \`#mlops-prod-alerts\`, PagerDuty rota \`mlops-oncall\`, email \`data-leads@\` for major regression.\n\n**🚀 Deployment plan**\n- REST API \`POST /v1/predict\`, auto-scale 2 to 16 replicas, canary 5% on every new version with auto-rollback after 30 min if error rate > 0.8%.`;
  }
  return `**🧠 Plan de fine-tuning**\n- Modele de base : Llama 3.1 8B Instruct — meilleur ratio prix/qualite pour "${useCase}", licence compatible commercial, tient sur un seul A100 40GB.\n- Hyperparametres : lr=2e-5, batch=16, epochs=3, LoRA rank=16, alpha=32, dropout=0.05.\n- Duree estimee : 4h12min sur 1×A100, cout GPU estime : USD 18-24.\n\n**📊 Metriques projetees**\n- Loss train cible : 0.42, loss eval cible : 0.51 apres 3 epochs.\n- +27% sur le benchmark specifique tache vs modele de base (estime depuis l'equilibre du dataset de ${rows || "10k"} lignes).\n- Latence inference : p50 = 190ms, p95 = 380ms sur endpoint manage.\n\n**📡 Monitoring production**\n- Data drift : seuil divergence KL 0.15 sur distribution des inputs, fenetre glissante 24h.\n- Concept drift : alerte chute d'accuracy si perf eval baisse de plus de 3.5% sur 7 jours.\n- Alertes critiques : Slack \`#mlops-prod-alerts\`, PagerDuty rota \`mlops-oncall\`, email \`data-leads@\` pour regression majeure.\n\n**🚀 Plan de deploiement**\n- API REST \`POST /v1/predict\`, auto-scale 2 a 16 replicas, canary 5% sur chaque nouvelle version avec rollback auto sous 30 min si taux d'erreur > 0.8%.`;
}
