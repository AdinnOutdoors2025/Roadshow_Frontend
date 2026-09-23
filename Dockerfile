# syntax=docker/dockerfile:1.7
# Roadshow frontend (Next.js 16) — multi-stage, standalone output.

ARG NODE_VERSION=24

# ---------- deps ----------
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------- build ----------
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_OUTPUT_STANDALONE=true

# NEXT_PUBLIC_* values are inlined into the browser bundle at build time.
# The real .env is mounted as a BuildKit secret for the build step only
# (never copied into a layer); these args override individual values.
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_API_BASE_LIVE
ARG INTERNAL_API_BASE

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Standalone output copies .env files next to server.js — strip them in the
# same step so the secret never lands in a layer (runtime uses env_file).
RUN --mount=type=secret,id=frontend_env,target=/app/.env,required=false \
    npm run build && rm -f .next/standalone/.env .next/standalone/.env.*

# ---------- runtime ----------
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/favicon.ico').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
