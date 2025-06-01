# Build stage
FROM oven/bun:latest AS builder
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build


# Production stage
FROM oven/bun:slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info
ENV APP_PREFIX=KPI-Auth

COPY package.json ./
RUN bun install --production

COPY --from=builder /app/dist ./dist

RUN addgroup --system --gid 1001 bunuser \
    && adduser --system --uid 1001 --ingroup bunuser bunuser

RUN mkdir -p /app/logs \
    && chown -R bunuser:bunuser /app

USER bunuser
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD bun run --bun -e "fetch('http://localhost:' + process.env.PORT + '/system/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"
LABEL org.opencontainers.image.title="NestJS Auth Service" \
      org.opencontainers.image.description="NestJS Authentication Service running on Bun" \
      org.opencontainers.image.created="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
CMD ["bun", "dist/main.js"]