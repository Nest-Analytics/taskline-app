# Run the build stage on the host's native architecture ($BUILDPLATFORM).
# The output (static HTML/JS) is architecture-independent, and this avoids
# QEMU emulating esbuild's Go runtime when cross-building linux/amd64 from an
# ARM64 host (esbuild crashes with "lfstack.push invalid packing" under QEMU).
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Runtime stage uses the requested --platform and just serves the static files.
FROM nginx:1.27-alpine AS runtime

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
