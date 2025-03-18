FROM node:20-slim AS base
ENV NODE_ENV=production PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS runner
COPY --from=builder /app/.output /app
WORKDIR /app
CMD ["node", "./server/index.mjs"] 