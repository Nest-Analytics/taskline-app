# Backend

Express API with:
- Prisma + PostgreSQL
- session auth
- task CRUD + audit history
- Prometheus metrics
- Pino logging
- Application Insights bootstrap

## Local Env

Reads the repo-root [.env](../.env) by default.

Important keys:
- `APP_TITLE`
- `APP_VERSION`
- `API`
- `PORT`
- `DATABASE_URL`
- `APPINSIGHTS_CONNECTION_STRING` optional

Runtime lookup order inside containers (see [lib/runtime-values.js](lib/runtime-values.js)):
1. environment variable (populated by `envFrom` in both local and AKS deployments)
2. file at `/etc/secrets/<KEY>` (fallback, populated when the secret is also mounted as a volume)

## Local Run

```bash
cd backend
npm install
docker compose up -d postgres
npm run db:migrate:deploy
npm run start
```

Default local URL:
```text
http://localhost:5000
```

First run behavior:
- the frontend can create users through the signup flow
- if the database has no users, signup becomes the first-user bootstrap path automatically
- no demo tasks are inserted

Health and metrics:
- `/healthz` — returns 200 after a Postgres round-trip; both deployments probe this endpoint for liveness and readiness
- `/metrics` — Prometheus format

## Local Kubernetes

Files:
- [k8s/local/postgres.yaml](k8s/local/postgres.yaml)
- [k8s/local/secret.yaml](k8s/local/secret.yaml)
- [k8s/local/service.yaml](k8s/local/service.yaml)
- [k8s/local/deployment.yaml](k8s/local/deployment.yaml)
- [k8s/local/servicemonitor.yaml](k8s/local/servicemonitor.yaml)

Build:
```bash
eval $(minikube docker-env)
docker build --platform linux/amd64 -t taskline-backend:latest ./backend
```

Apply:
```bash
kubectl apply -f backend/k8s/local/postgres.yaml
kubectl apply -f backend/k8s/local/secret.yaml
kubectl apply -f backend/k8s/local/service.yaml
kubectl apply -f backend/k8s/local/deployment.yaml
kubectl apply -f backend/k8s/local/servicemonitor.yaml
```

Both the migrate init container and the main container use `envFrom` so Prisma sees `DATABASE_URL` directly.

## Azure

Terraform lives in [terraform/](terraform/).

It provisions:
- resource group
- AKS (with the **Key Vault Secrets Provider CSI addon** enabled; surfaces a user-assigned identity the cluster uses to pull secrets)
- PostgreSQL Flexible Server
- Log Analytics / Container Insights
- Application Insights
- Key Vault + the runtime secrets below
- optional ACR

Runtime secrets written to Key Vault by Terraform:
| Vault secret name | Source | Becomes env var |
|---|---|---|
| `API` | `TF_VAR_api_key` (GH secret `API`) | `API` |
| `DATABASE-URL` | composed from Postgres admin/password/FQDN | `DATABASE_URL` |
| `APPINSIGHTS-CONNECTION-STRING` | `azurerm_application_insights.main.connection_string` | `APPINSIGHTS_CONNECTION_STRING` |
| `APP-TITLE` | `TF_VAR_app_title` (GH var `APP_TITLE`) | `APP_TITLE` |
| `APP-VERSION` | `TF_VAR_app_version` (GH var `APP_VERSION`) | `APP_VERSION` |
| `PORT` | hardcoded `"5000"` | `PORT` |

AKS manifests live in [k8s/aks/](k8s/aks/):
- [deployment.yaml](k8s/aks/deployment.yaml) and [deployment-ghcr.yaml](k8s/aks/deployment-ghcr.yaml) — the GHCR variant adds `imagePullSecrets`
- [service.yaml](k8s/aks/service.yaml)
- [secret-provider-class.yaml](k8s/aks/secret-provider-class.yaml) — CSI binding + `secretObjects` that sync into `taskline-backend-secrets`

The workflow renders three placeholders in the `SecretProviderClass` from Terraform outputs at deploy time: `KV_NAME_PLACEHOLDER`, `KV_TENANT_ID_PLACEHOLDER`, `KV_CSI_CLIENT_ID_PLACEHOLDER`.

The backend AKS Service is internal:
- service name: `taskline-backend-service`
- type: `ClusterIP`
- pods carry `livenessProbe` and `readinessProbe` on `/healthz`; Prisma's migrate init container has no probes by design (one-shot job)
