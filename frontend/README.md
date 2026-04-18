# Frontend

React + Vite SPA, served by Nginx in containerized deployments.

## Local Env

Reads the repo-root [.env](../.env) through the npm scripts.

Important keys:
- `VITE_APP_TITLE`
- `VITE_BACKEND_URL` optional
- `VITE_PORT` optional

Runtime config file:
- [public/app-config.js](public/app-config.js)

The frontend also reads:
- `window.__APP_CONFIG__.appTitle`
- `window.__APP_CONFIG__.apiBaseUrl`

In clustered deployments, `apiBaseUrl` is left empty — the Nginx config ([nginx/default.conf](nginx/default.conf)) proxies `/api/`, `/login`, and `/logout` to the backend ClusterIP Service (`taskline-backend-service`), so the browser uses same-origin paths.

## Local Run

```bash
cd frontend
npm install
npm run dev
```

Default local URL:
```text
http://localhost:3000
```

First run behavior:
- the auth screen supports both sign in and sign up
- if the backend database is empty, sign up becomes the first-user bootstrap path automatically
- the workspace starts empty

By default, local dev proxies:
- `/login`
- `/logout`
- `/api`

to `http://localhost:5000`

## Local Kubernetes

Files:
- [k8s/local/configmap.yaml](k8s/local/configmap.yaml)
- [k8s/local/service.yaml](k8s/local/service.yaml)
- [k8s/local/deployment.yaml](k8s/local/deployment.yaml)

Build:docker build --platform linux/amd64 -t taskline-frontend:latest ./frontend
```bash
eval $(minikube docker-env)

```

Apply:
```bash
kubectl apply -f frontend/k8s/local/configmap.yaml
kubectl apply -f frontend/k8s/local/service.yaml
kubectl apply -f frontend/k8s/local/deployment.yaml
```

Public entrypoint:
```bash
minikube service taskline-frontend-service --url
```

## Azure

Terraform lives in [terraform/](terraform/) — it's a data-only validation layer that looks up the shared resource group and AKS cluster provisioned by `backend/terraform`.

AKS manifests live in [k8s/aks/](k8s/aks/):
- [deployment.yaml](k8s/aks/deployment.yaml) / [deployment-ghcr.yaml](k8s/aks/deployment-ghcr.yaml) — image pulled `Always`, `livenessProbe` + `readinessProbe` on `GET /`
- [service.yaml](k8s/aks/service.yaml) — `LoadBalancer`
- [configmap.yaml](k8s/aks/configmap.yaml) — `app-config.js`; `APP_TITLE_PLACEHOLDER` is patched by the workflow

The frontend AKS Service is public:
- service name: `taskline-frontend-service`
- type: `LoadBalancer`

## Docker build

The build stage runs on the host's native architecture (`$BUILDPLATFORM`), only the runtime Nginx stage is pinned to the requested `--platform`. This avoids esbuild's Go-runtime crash under QEMU when cross-building `linux/amd64` from Apple Silicon:

```bash
docker build --platform linux/amd64 -t taskline-frontend:latest ./frontend
```
