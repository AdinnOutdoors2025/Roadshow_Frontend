# syntax=docker/dockerfile:1.7
# Roadshow frontend (Next.js 16) — runtime-only image.
#
# The app is built on the HOST first (npm run build:docker), then this image
# receives ONLY the standalone build output (.next/standalone, .next/static,
# public). No source code, no npm install of the project, no build step here.
# NEXT_PUBLIC_* values are inlined at host build time from the local .env.

ARG NODE_VERSION=24

# ---------- sharp (Linux binary for next/image) ----------
# A Windows host build traces only the win32 sharp binary; install the Linux
# one at the same version so image optimisation works inside the container.
FROM node:${NODE_VERSION}-bookworm-slim AS sharp
WORKDIR /sharp
COPY .next/standalone/node_modules/sharp/package.json /tmp/sharp-package.json
RUN npm init -y >/dev/null \
    && npm install --no-audit --no-fund --omit=dev \
       "sharp@$(node -p "require('/tmp/sharp-package.json').version")"

# ---------- runtime ----------
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --chown=node:node public ./public
COPY --chown=node:node .next/standalone ./
COPY --chown=node:node .next/static ./.next/static
COPY --from=sharp --chown=node:node /sharp/node_modules ./node_modules

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/favicon.ico').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
