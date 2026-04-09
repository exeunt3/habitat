# ── Stage 1: build client ─────────────────────────────────────────────────────
FROM node:20-alpine AS client-builder

WORKDIR /build/client

# Install client deps
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps

# Build client
COPY client/ ./
RUN npm run build          # outputs to /build/client/dist


# ── Stage 2: build server ─────────────────────────────────────────────────────
FROM node:20-alpine AS server-builder

WORKDIR /build/server

# Install server deps (production + dev for tsc)
COPY server/package*.json ./
RUN npm ci

# Generate Prisma client
COPY server/prisma ./prisma
RUN npx prisma generate

# Build server TypeScript
COPY server/ ./
RUN npm run build          # outputs to /build/server/dist


# ── Stage 3: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy production node_modules + compiled server
COPY --from=server-builder /build/server/node_modules ./node_modules
COPY --from=server-builder /build/server/dist          ./dist
COPY --from=server-builder /build/server/prisma       ./prisma

# Embed the static client build so the server can serve it
COPY --from=client-builder /build/client/dist ./public

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
