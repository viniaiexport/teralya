FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci --workspace @teralya/backend --include-workspace-root

COPY apps/backend apps/backend
RUN npm run backend:build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci --omit=dev --workspace @teralya/backend --include-workspace-root \
  && npm cache clean --force

COPY --from=builder /app/apps/backend/dist apps/backend/dist
USER node
EXPOSE 3001
CMD ["node", "apps/backend/dist/main.js"]

