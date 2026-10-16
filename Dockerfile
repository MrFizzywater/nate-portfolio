# Stage 1: Build Astro static site
FROM node:22-alpine AS builder
WORKDIR /app

# Build arguments passed by Coolify / CI
ARG BUNNY_API_KEY
ARG BUNNY_STORAGE_ZONE
ARG BUNNY_STORAGE_ENDPOINT
ARG PUBLIC_BUNNY_CDN_URL

ENV BUNNY_API_KEY=$BUNNY_API_KEY
ENV BUNNY_STORAGE_ZONE=$BUNNY_STORAGE_ZONE
ENV BUNNY_STORAGE_ENDPOINT=$BUNNY_STORAGE_ENDPOINT
ENV PUBLIC_BUNNY_CDN_URL=$PUBLIC_BUNNY_CDN_URL

# Copy package manifests
COPY package*.json ./

# Install dependencies: use npm ci if package-lock.json is valid, fallback cleanly to npm install
RUN if [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi

# Copy all source files (excluding patterns in .dockerignore)
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
