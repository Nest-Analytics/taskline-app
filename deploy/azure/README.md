# Azure Deployment

This repo no longer deploys as a single Azure Web App ZIP package.

Current model:
- `backend/terraform/` provisions the shared Azure infrastructure
- `frontend/terraform/` validates the shared AKS boundary for the frontend workload
- `.github/workflows/deploy.yml` builds and deploys separate frontend and backend containers into AKS

Current runtime split:
- frontend container: static SPA behind Nginx
- backend container: API, auth, metrics, logging, database access
