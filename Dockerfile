# syntax=docker/dockerfile:1.6
# FBM Sniper Community Server
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production
COPY . .
EXPOSE 3340
ENV NODE_ENV=production
ENV PORT=3340
ENV HOST=0.0.0.0
CMD ["node", "server.cjs"]
