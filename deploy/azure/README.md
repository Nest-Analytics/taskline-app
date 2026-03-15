# Azure Web App

## Linux App Service with ZIP Deploy
1. Zip the app contents, not the parent folder.
2. Set runtime to Node 20 LTS or newer.
3. Set startup command to `bash startup.sh` or `bash deploy/azure/startup.sh`.
4. Set app setting `SCM_DO_BUILD_DURING_DEPLOYMENT=true`.
5. Keep `PORT` managed by Azure.

Why this matters:
- `npm start` serves the already-built `dist/` folder.
- `SCM_DO_BUILD_DURING_DEPLOYMENT=true` tells Azure/Kudu to run the Node build/install steps during ZIP deployment.
- `startup.sh` gives Azure a safe fallback to build `dist/` if it is missing on first boot.

## Windows App Service
If you deploy to a Windows App Service plan, `web.config` must be at the app root. A copy is included at the repository root for ZIP deploys, and another copy lives in this folder as the deployment template.
