# Deploy Checklist

Push branch:
- `class`

## GitHub Actions Secrets

Required:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `TF_STATE_RESOURCE_GROUP`
- `TF_STATE_STORAGE_ACCOUNT`
- `TF_STATE_CONTAINER`
- `API` — app API key; Terraform writes it to Key Vault as `API`
- `POSTGRES_ADMIN_PASSWORD` — Terraform uses it to create the server and compose `DATABASE-URL` in Key Vault

> `APPINSIGHTS_CONNECTION_STRING` is no longer a workflow secret. Terraform
> reads it from the `azurerm_application_insights` resource it creates and
> stores it in Key Vault as `APPINSIGHTS-CONNECTION-STRING`.

Conditional:
- `GHCR_TOKEN` if `REGISTRY=ghcr`
- `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` if `REGISTRY=dockerhub`

## GitHub Actions Variables

Required:
- `REGISTRY` — `ghcr`, `dockerhub`, or `acr`
- `BACKEND_REGISTRY_PATH`
- `FRONTEND_REGISTRY_PATH`
- `APP_TITLE` — surfaced to frontend ConfigMap and stored in Key Vault
- `APP_VERSION` — stored in Key Vault
- `TF_VAR_resource_group_name`
- `TF_VAR_location`
- `TF_VAR_aks_cluster_name`
- `TF_VAR_aks_dns_prefix` optional
- `TF_VAR_aks_default_node_pool_name` optional
- `TF_VAR_aks_default_node_pool_vm_size` optional
- `TF_VAR_key_vault_name`
- `TF_VAR_log_analytics_workspace_name`
- `TF_VAR_application_insights_name`
- `TF_VAR_postgres_server_name`
- `TF_VAR_postgres_database_name`
- `TF_VAR_postgres_admin_username`
- `TF_VAR_postgres_firewall_rule_name` optional
- `TF_VAR_frontend_deployment_name` optional
- `TF_VAR_frontend_service_name` optional

## Azure Prerequisites

Required:
- OIDC federated credential is configured for this repo/workflow
- Terraform backend storage account already exists
- Terraform backend blob container already exists
- the GitHub Actions identity has access to:
  - the Terraform backend storage account
  - the Azure subscription or target resource group

## Secrets flow (Key Vault → AKS)

Runtime secrets live in Azure Key Vault and are pulled into each backend pod via the AKS **Azure Key Vault Provider for Secrets Store CSI Driver** (enabled as an AKS addon in Terraform).

- Terraform provisions the vault and writes every runtime value: `API`, `DATABASE-URL`, `APPINSIGHTS-CONNECTION-STRING`, `APP-TITLE`, `APP-VERSION`, `PORT`.
- `backend/k8s/aks/secret-provider-class.yaml` tells CSI which secrets to pull and mirrors them into a Kubernetes Secret named `taskline-backend-secrets`.
- The deploy job renders three placeholders in that manifest from Terraform outputs (`key_vault_name`, `tenant_id`, `csi_user_assigned_identity_client_id`) before applying.
- The backend Deployment mounts the CSI volume (required to trigger the sync) and consumes the mirrored secret via `envFrom`. Prisma's `migrate deploy` init container reads `DATABASE_URL` from the same env.

## Registry Expectations

If `REGISTRY=ghcr`:
- `BACKEND_REGISTRY_PATH` looks like `ghcr.io/<owner>/taskline-backend`
- `FRONTEND_REGISTRY_PATH` looks like `ghcr.io/<owner>/taskline-frontend`

If `REGISTRY=dockerhub`:
- `BACKEND_REGISTRY_PATH` looks like `<user>/taskline-backend`
- `FRONTEND_REGISTRY_PATH` looks like `<user>/taskline-frontend`

If `REGISTRY=acr`:
- `BACKEND_REGISTRY_PATH` looks like `<acr>.azurecr.io/taskline-backend`
- `FRONTEND_REGISTRY_PATH` looks like `<acr>.azurecr.io/taskline-frontend`

## Repo State Before Push

Required:
- frontend builds locally (Docker build: `docker build --platform linux/amd64 -t taskline-frontend:latest ./frontend`)
- backend Prisma generate works (`npm --prefix backend run db:generate`)
- backend database migrations run cleanly
- sign-up flow works
- first-user sign-up works when the database is empty
- manifests are committed under:
  - `frontend/k8s/aks/` and `frontend/k8s/local/`
  - `backend/k8s/aks/` (including `secret-provider-class.yaml`) and `backend/k8s/local/`
- Terraform is committed under:
  - `frontend/terraform/`
  - `backend/terraform/`
- workflow file is committed:
  - `.github/workflows/deploy.yml`

## Expected Pipeline Order

1. Build backend image
2. Build frontend image
3. Apply backend Terraform (provisions RG, AKS with CSI addon, PostgreSQL, Key Vault + secrets, App Insights, Log Analytics, optional ACR)
4. Apply frontend Terraform (validation layer — looks up the shared RG/AKS)
5. Deploy backend: render `SecretProviderClass`, apply it, then apply Service and Deployment (probes gate readiness)
6. Deploy frontend: render ConfigMap, apply ConfigMap/Service/Deployment

## Push Command

```bash
git push origin class
```
