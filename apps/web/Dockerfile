FROM node:20-alpine AS base
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspaces --include-workspace-root

COPY packages/shared packages/shared
COPY apps/web apps/web

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps/web"]
