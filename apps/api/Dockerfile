FROM node:20-alpine AS base
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm install --workspaces --include-workspace-root

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm run build --workspace=packages/shared
RUN npm run prisma:generate --workspace=apps/api
RUN npm run build --workspace=apps/api

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
