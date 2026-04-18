FROM node:24-bookworm-slim AS runtime

WORKDIR /app

# Prisma needs OpenSSL at runtime to pick the right query engine binary.
# Installing it here avoids the "Prisma failed to detect the libssl/openssl version" warning.
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev --ignore-scripts && \
    npx prisma generate --schema prisma/schema.prisma

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]
