# Taskline

Split deployment:
- [frontend/README.md](frontend/README.md): React + Vite SPA, Nginx container, public entrypoint
- [backend/README.md](backend/README.md): Express + Prisma API, PostgreSQL, metrics, logging
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml): parent CI/CD pipeline
- [FLOW.md](FLOW.md): concise deployment and request flow diagrams
- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md): pre-push verification list

## Local Env

Shared local env file: [.env](.env)

Used by backend:
- `APP_TITLE`
- `APP_VERSION`
- `API`
- `PORT`
- `DATABASE_URL`

Used by frontend:
- `VITE_APP_TITLE`
- `VITE_BACKEND_URL` optional
- `VITE_PORT` optional

## Local Run

Backend:
```bash
cd backend
npm install
docker compose up -d postgres
npm run db:migrate:deploy
npm run start
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

First run behavior:
- the auth screen supports both sign in and sign up
- if the database has no users, sign up becomes the first-user bootstrap path automatically
- the app starts with no seeded tasks

## Local Kubernetes

Build images into Minikube:
```bash
eval $(minikube docker-env)
docker build --platform linux/amd64 -t taskline-backend:latest ./backend
docker build --platform linux/amd64 -t taskline-frontend:latest ./frontend
```

Apply backend:
```bash
kubectl apply -f backend/k8s/local/postgres.yaml
kubectl apply -f backend/k8s/local/secret.yaml
kubectl apply -f backend/k8s/local/service.yaml
kubectl apply -f backend/k8s/local/deployment.yaml
kubectl apply -f backend/k8s/local/servicemonitor.yaml
```

Apply frontend:
```bash
kubectl apply -f frontend/k8s/local/configmap.yaml
kubectl apply -f frontend/k8s/local/service.yaml
kubectl apply -f frontend/k8s/local/deployment.yaml
```

Open the app:
```bash
minikube service taskline-frontend-service --url
```

> Local pods carry the same `/healthz` and `/` probes as AKS — if the backend
> can't reach Postgres, its readiness probe will keep it out of the Service.

## Azure / GitHub

### Secrets flow

Runtime backend secrets live in **Azure Key Vault**. They're pulled into each pod through the AKS **Azure Key Vault Provider for Secrets Store CSI Driver** (enabled as an addon by Terraform) and mirrored into a Kubernetes Secret named `taskline-backend-secrets` via a `SecretProviderClass`. The backend Deployment consumes that secret with `envFrom`, so `DATABASE_URL`, `API`, `APPINSIGHTS_CONNECTION_STRING`, `APP_TITLE`, `APP_VERSION`, and `PORT` all arrive as environment variables — Prisma's `migrate deploy` init container uses the same env.

Terraform owns every secret:
- `API` — pulled from the `API` GitHub Actions secret and written to Key Vault
- `DATABASE-URL` — composed from the admin username/password and the Postgres FQDN Terraform creates
- `APPINSIGHTS-CONNECTION-STRING` — read from the `azurerm_application_insights` resource Terraform provisions (no longer a separate GitHub secret)
- `APP-TITLE`, `APP-VERSION`, `PORT` — from workflow variables

### GitHub Actions secrets required:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `TF_STATE_RESOURCE_GROUP`
- `TF_STATE_STORAGE_ACCOUNT`
- `TF_STATE_CONTAINER`
- `API`
- `POSTGRES_ADMIN_PASSWORD`
- `GHCR_TOKEN` if `REGISTRY=ghcr`
- `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` if `REGISTRY=dockerhub`

### GitHub Actions variables required:
- `REGISTRY`
- `BACKEND_REGISTRY_PATH`
- `FRONTEND_REGISTRY_PATH`
- `APP_TITLE`
- `APP_VERSION`
- `TF_VAR_resource_group_name`
- `TF_VAR_location`
- `TF_VAR_aks_cluster_name`
- `TF_VAR_aks_dns_prefix` optional
- `TF_VAR_aks_default_node_pool_name` optional
- `TF_VAR_key_vault_name`
- `TF_VAR_log_analytics_workspace_name`
- `TF_VAR_application_insights_name`
- `TF_VAR_postgres_server_name`
- `TF_VAR_postgres_database_name`
- `TF_VAR_postgres_admin_username`
- `TF_VAR_postgres_firewall_rule_name` optional
- `TF_VAR_frontend_deployment_name` optional
- `TF_VAR_frontend_service_name` optional

### Pipeline order:
1. Build backend image (pushed tagged `:sha`)
2. Build frontend image (pushed tagged `:sha`)
3. Apply backend Terraform — provisions RG, AKS (with CSI addon), PostgreSQL, Key Vault + runtime secrets, App Insights, Log Analytics, optional ACR; exports `key_vault_name`, `tenant_id`, `csi_user_assigned_identity_client_id`
4. Apply frontend Terraform validation layer (data-only lookup)
5. Deploy backend to AKS — render `SecretProviderClass` from TF outputs, apply it, then apply Service and Deployment (probes gate readiness)
6. Deploy frontend to AKS — render ConfigMap, apply ConfigMap/Service/Deployment

Deploy branch:
- push to `class`

### Health checks
Both deployments (AKS and local) carry `livenessProbe` and `readinessProbe`:
- backend → `GET /healthz` on port 5000 (from `server.js`, verifies the DB round-trip)
- frontend → `GET /` on port 80 (nginx)
