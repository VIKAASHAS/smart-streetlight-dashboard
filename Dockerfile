# Multi-stage Dockerfile for Smart Streetlight Dashboard
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build frontend production bundle
RUN npm run build --prefix client

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built assets and dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

# Install server dependencies only
RUN npm install --prefix server --only=production

EXPOSE 5000

CMD ["node", "server/index.js"]
