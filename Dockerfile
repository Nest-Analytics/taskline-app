FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/logger.js ./logger.js
COPY --from=build /app/metrics.js ./metrics.js
COPY --from=build /app/runtime-values.js ./runtime-values.js
COPY --from=build /app/appinsights.js ./appinsights.js

EXPOSE 3000

CMD ["npm", "start"]
