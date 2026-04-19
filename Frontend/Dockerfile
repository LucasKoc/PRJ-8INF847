# ---------- Stage 1 : build Angular ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (cache friendly)
COPY package*.json ./
RUN npm ci

# Copy sources
COPY angular.json tsconfig*.json .postcssrc.json ./
COPY src ./src
COPY public ./public

# Production build (outputs to dist/dpscheck-frontend/browser)
RUN npm run build -- --configuration production

# ---------- Stage 2 : runtime nginx ----------
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config and replace it with ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist/dpscheck-frontend/browser /usr/share/nginx/html

# Expose port and run
EXPOSE 80

# Nginx official image already has a proper CMD;
# we keep it so logs go to stdout/stderr
