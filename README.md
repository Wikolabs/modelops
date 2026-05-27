# ModelOps — Plateforme MLOps de déploiement et monitoring de modèles ML

> Entraîner un modèle c'est 20% du travail. Le déployer et le maintenir c'est 80%.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![MLflow](https://img.shields.io/badge/MLflow-2.13-0194E2?style=flat)](https://mlflow.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)

---

## Vue d'ensemble

ModelOps est une plateforme MLOps qui gère le cycle de vie complet des modèles ML : tracking des expériences (MLflow), déploiement en production (blue/green), monitoring des performances (drift détection), et fine-tuning automatisé. Les équipes data science déploient et opèrent leurs modèles sans assistance DevOps.

**Domaine :** MLOps / Data Science Platform  
**Port VM :** 3019 | **Sous-domaine :** modelops.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts | Model registry, experiments, monitoring |
| Backend | FastAPI (Python 3.11), Uvicorn | API modèles, inférence, monitoring |
| Experiment Tracking | **MLflow** 2.13 | Tracking runs, métriques, artifacts |
| Model Serving | FastAPI + uvicorn workers | Inférence REST endpoint |
| Drift Detection | alibi-detect | Data drift + concept drift |
| Feature Store | Redis + PostgreSQL | Features en temps réel |
| Storage | Minio (S3-compatible) | Artifacts modèles |
| Base de données | PostgreSQL 16 | Registry modèles, runs, métriques |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3019) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
mlflow==2.13.0
alibi-detect==0.12.0
scikit-learn==1.4.2
xgboost==2.0.3
pandas==2.2.2
numpy==1.26.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
redis==5.0.4
pydantic==2.7.1
boto3==1.34.0
```

---

## Architecture mono-repo

```
modelops/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Dashboard modèles en prod
│   │   ├── experiments/          # Runs MLflow + comparaison
│   │   ├── models/[id]/          # Détail modèle + versions
│   │   ├── monitoring/           # Drift + performance metrics
│   │   └── fine-tuning/          # Configuration fine-tuning auto
│   └── src/components/
│       ├── ModelCard.tsx         # Carte modèle avec status prod
│       ├── ExperimentTable.tsx   # Comparaison runs MLflow
│       ├── DriftChart.tsx        # PSI / KS drift monitoring
│       ├── PerformanceChart.tsx  # AUC/RMSE en production
│       └── DeploymentStatus.tsx  # Blue/green deployment status
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── models.py         # Registry + versions
│   │   │   ├── experiments.py    # MLflow API proxy
│   │   │   ├── inference.py      # POST /predict/{model_id}
│   │   │   └── monitoring.py     # Drift + performance
│   │   ├── services/
│   │   │   ├── registry.py       # Model registry CRUD
│   │   │   ├── deployment.py     # Blue/green deploy
│   │   │   ├── drift_detector.py # alibi-detect PSI/KS
│   │   │   └── fine_tuner.py     # Auto fine-tuning pipeline
│   │   └── models/
│   │       └── ml_model.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#6366f1', 'primaryTextColor': '#fff', 'primaryBorderColor': '#4f46e5', 'lineColor': '#374151', 'secondaryColor': '#eef2ff'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3019)"]
        NEXT["Next.js 14\nMLOps Dashboard"]
        API["FastAPI"]

        subgraph MLOPS["🤖 MLOps Engine"]
            MLFLOW["MLflow 2.13\nExperiment tracking"]
            DRIFT["alibi-detect\nDrift detection"]
            DEPLOY["Blue/Green\nDeployment manager"]
            FEATURE["Feature Store\nReal-time features"]
        end

        PG[("PostgreSQL\nModel registry")]
        MINIO[("Minio S3\nModel artifacts")]
        REDIS[("Redis\nFeature cache")]
    end

    DS["Data Scientist"] --> MLFLOW
    MLFLOW --> MINIO
    PROD["Production\nPrediction requests"] --> DEPLOY
```

### Séquence — Déploiement d'un nouveau modèle

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#6366f1', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant DS as Data Scientist
    participant MLFLOW as MLflow
    participant API as FastAPI
    participant DEPLOY as Deployment Manager
    participant MONITOR as Drift Monitor
    participant PROD as Production

    DS->>MLFLOW: log_model(model, metrics={auc: 0.93})
    MLFLOW-->>DS: run_id=abc123, artifact_uri=s3://...

    DS->>API: POST /models/promote {run_id: abc123, stage: production}

    API->>DEPLOY: blue_green_deploy(model_v2, model_v1)
    Note over DEPLOY: 10% traffic → v2, 90% → v1 (canary)
    DEPLOY-->>API: canary_running

    API->>PROD: route 10% requests to v2
    PROD->>MONITOR: collect_predictions(model_v2, inputs, outputs)
    MONITOR->>MONITOR: compare_distributions(training_dist, prod_dist)
    MONITOR-->>API: psi=0.02 (no drift), auc_prod=0.91

    alt auc_prod ≥ threshold AND psi < 0.1
        API->>DEPLOY: promote_to_100pct(model_v2)
        DEPLOY-->>API: v2 fully promoted
    else
        API->>DEPLOY: rollback(model_v1)
    end
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#6366f1', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    ML_MODEL {
        uuid id PK
        string name
        string framework
        string stage
        string mlflow_run_id
        string artifact_uri
        float training_auc
        float production_auc
        int predictions_count
        timestamp deployed_at
    }
    MODEL_VERSION {
        uuid id PK
        uuid model_id FK
        int version_number
        float auc
        float psi_drift
        string status
        int traffic_pct
        timestamp created_at
    }
    PREDICTION_LOG {
        uuid id PK
        uuid model_version_id FK
        jsonb input_features
        jsonb prediction
        float latency_ms
        timestamp predicted_at
    }
    DRIFT_ALERT {
        uuid id PK
        uuid model_id FK
        string drift_type
        float psi_value
        float ks_statistic
        boolean auto_retrain_triggered
        timestamp detected_at
    }

    ML_MODEL ||--o{ MODEL_VERSION : "has"
    MODEL_VERSION ||--o{ PREDICTION_LOG : "generates"
    ML_MODEL ||--o{ DRIFT_ALERT : "triggers"
```

---

## PRD

### Problème
Les Data Scientists entraînent des modèles qui restent dans des notebooks. Le déploiement est manuel, les performances en production ne sont pas monitorées, et les modèles dégradent silencieusement à cause du data drift. Il faut parfois des semaines pour qu'un nouveau modèle remplace l'ancien en production.

### Solution
ModelOps automatise le pipeline complet : MLflow pour le tracking, déploiement blue/green sécurisé, monitoring drift avec alertes automatiques, et re-entraînement déclenché quand les performances tombent sous seuil.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| Data Scientist | Déployer ses modèles en production sans aide DevOps |
| ML Engineer | Opérer les modèles, monitorer, gérer les versions |
| VP Engineering | Visibilité sur la santé des modèles en production |

### OKRs
- Time-to-production nouveau modèle < 1h (vs 2 semaines)
- 0 dégradation silencieuse (alerte drift < 24h)
- Disponibilité endpoints inférence > 99.9%

---

## User Stories

```
US-01 [Data Scientist] En tant que Data Scientist,
      je veux déployer mon modèle MLflow en production
      en 1 clic avec déploiement blue/green automatique
      afin de ne pas dépendre de l'équipe DevOps.

US-02 [ML Engineer] En tant que ML Engineer,
      je veux recevoir une alerte quand le PSI (drift) dépasse 0.1
      afin de déclencher un re-entraînement avant que les performances chutent.

US-03 [Data Scientist] En tant que Data Scientist,
      je veux comparer les métriques de 5 runs d'entraînement
      (AUC, precision, recall, temps)
      afin de choisir la meilleure version à promouvoir.

US-04 [VP Eng] En tant que VP Engineering,
      je veux voir pour chaque modèle en prod :
      latence d'inférence, AUC observée, drift, nombre de prédictions/jour
      afin d'avoir une vue de la santé globale des modèles ML.

US-05 [ML Engineer] En tant que ML Engineer,
      je veux que le système déclenche automatiquement le fine-tuning
      quand l'AUC en production tombe sous le seuil configuré
      afin de maintenir la qualité sans intervention manuelle.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Canary deploy | 10% traffic → nouveau modèle pendant 24h avant promotion | ✅ Traffic slider |
| R2 | Rollback auto | AUC prod - training > 0.05 → rollback automatique | ✅ Rollback demo |
| R3 | PSI drift | PSI > 0.2 = drift majeur → alerte + auto-retrain | ✅ PSI gauge |
| R4 | KS test | KS statistic > 0.05 → concept drift détecté | ✅ KS chart |
| R5 | Latence SLA | P99 inférence < 100ms pour modèles classiques | ✅ Latency chart |
| R6 | Versioning | Chaque modèle promu = immutable version + artifact S3 | ✅ Version list |
| R7 | Experiment compare | Comparer N runs en parallèle sur les mêmes métriques | ✅ Comparison table |
| R8 | Auto-retrain | Drift détecté → fine-tuning sur données récentes (J-30) | ✅ Retrain trigger |
| R9 | Shadow mode | Nouveau modèle en shadow (log prédictions sans les servir) | ✅ Shadow toggle |
| R10 | A/B test | 50/50 split entre 2 versions → test statistique | ✅ A/B deploy |

---

## Spécification API

**Base URL :** `http://modelops.wikolabs.com/api/v1`

### POST /models/{id}/deploy
```json
{"run_id": "mlflow_abc123", "strategy": "blue_green", "canary_pct": 10}
// Response: {"deployment_id": "dep_xyz", "status": "canary_running", "canary_traffic_pct": 10}
```

### POST /predict/{model_id}
```json
{"features": {"age": 35, "income": 75000, "credit_score": 720}}
// Response: {"prediction": 0.87, "model_version": "v3", "latency_ms": 12}
```

### GET /models/{id}/monitoring
```json
// Response: {"auc_prod": 0.91, "psi": 0.04, "predictions_today": 12400, "avg_latency_ms": 11, "drift_status": "ok"}
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Model Registry** | Liste modèles avec version, stage, AUC, drift badge |
| **Experiment Table** | Comparaison runs MLflow avec colonnes sortables |
| **Drift Chart** | Recharts : PSI historique par semaine avec seuil |
| **Canary Deploy** | Slider traffic % + performance comparée v1 vs v2 |
| **Fine-tuning Status** | Progress bar si re-training en cours, logs en streaming |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: modelops, POSTGRES_USER: mo_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  minio:
    image: minio/minio
    command: server /data
    environment: {MINIO_ROOT_USER: "${MINIO_USER}", MINIO_ROOT_PASSWORD: "${MINIO_PASSWORD}"}
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.13.0
    command: mlflow server --backend-store-uri postgresql://mo_user:${POSTGRES_PASSWORD}@postgres/modelops --default-artifact-root s3://mlflow --host 0.0.0.0
    environment: {MLFLOW_S3_ENDPOINT_URL: "http://minio:9000"}
    depends_on: [postgres, minio]
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://mo_user:${POSTGRES_PASSWORD}@postgres/modelops
      MLFLOW_TRACKING_URI: http://mlflow:5000
    depends_on: [postgres, mlflow]
    expose: ["8000"]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3019:80"]
volumes:
  pg_data:
  minio_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] MLflow tracking + model registry
- [ ] REST endpoint inférence
- [ ] Dashboard modèles

### Phase 2 — Production
- [ ] Blue/green deployment
- [ ] Drift detection (PSI + KS)
- [ ] Performance monitoring

### Phase 3 — Automation
- [ ] Auto-retrain on drift
- [ ] A/B testing modèles
- [ ] Feature store intégré

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
