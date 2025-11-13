# Step 1 : Build
FROM node:20-slim AS builder

WORKDIR /app

# Install Node dependences
COPY package*.json ./
RUN npm install

# Copy the code
COPY . .

# Build Next.js app
RUN npm run build

# Step 2 : Runner
FROM node:20-slim

WORKDIR /app

# Copy builder files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# .env for PostgreSQL DB
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Port
EXPOSE 3000

# Start app
CMD ["npm", "start"]