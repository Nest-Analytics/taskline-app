# Flow

## Request Flow

```text
Browser
  |
  v
Frontend Service (taskline-frontend-service)
  |
  v
Frontend Pod (Nginx + SPA)
  |
  +---- /login, /logout, /api ----> Backend Service (taskline-backend-service)
                                      |
                                      v
                                   Backend Pod
                                      |
                                      v
                                   PostgreSQL
```

## Local Run Flow

```text
.env
  |----> frontend npm scripts
  |----> backend npm scripts

frontend dev server ----proxy----> backend on localhost:5000
backend ----DATABASE_URL----> local postgres via docker compose

if no users exist:
frontend auth screen ----POST /api/signup----> backend
```

## Local Kubernetes Flow

```text
Minikube
  |
  +---- frontend NodePort service
  |        |
  |        v
  |      frontend pod  (liveness/readiness: GET /)
  |        |
  |        v
  |      backend ClusterIP service
  |        |
  |        v
  |      backend pod  (liveness/readiness: GET /healthz)
  |        |       envFrom -> taskline-backend-secrets (from k8s/local/secret.yaml)
  |        v
  |      postgres pod
  |
  +---- Prometheus ----scrapes----> backend /metrics
```

## Azure Flow

```text
 GitHub push to class
  |
  v
GitHub Actions
  |
  +---- build backend image (:sha, pushed)
  +---- build frontend image (:sha, pushed; build stage runs on $BUILDPLATFORM)
  +---- backend terraform
  |       |
  |       +---- RG, AKS (with Key Vault CSI addon), PostgreSQL, App Insights,
  |       |    Log Analytics, optional ACR
  |       +---- Key Vault + secrets:
  |             API, DATABASE-URL, APPINSIGHTS-CONNECTION-STRING,
  |             APP-TITLE, APP-VERSION, PORT
  |       +---- outputs: key_vault_name, tenant_id,
  |             csi_user_assigned_identity_client_id
  +---- frontend terraform (data-only lookup)
  +---- deploy backend to AKS
  |       |
  |       +---- render SecretProviderClass from TF outputs
  |       +---- apply SecretProviderClass  ──► CSI driver mirrors KV secrets
  |       |                                    into `taskline-backend-secrets`
  |       +---- apply service + deployment
  |             (deployment mounts the CSI volume to trigger the sync;
  |              envFrom: taskline-backend-secrets feeds Prisma + app)
  +---- deploy frontend to AKS
          |
          +---- patch ConfigMap APP_TITLE_PLACEHOLDER
          +---- apply configmap + service + deployment
  |
  v
AKS
  |
  +---- public frontend LoadBalancer
  |       (liveness/readiness: GET /)
  +---- internal backend ClusterIP
  |       (liveness/readiness: GET /healthz)
  +---- Azure PostgreSQL
  +---- Azure Key Vault  ──► CSI Secrets Store driver on AKS
  +---- Log Analytics / Container Insights
  +---- Application Insights
```
