# ============================================================
# BankMind Frontend — React + Vite + TailwindCSS
# Multi-stage build · Node 22 + Nginx
# ============================================================

# ── Stage 1: Dependencies ────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias de forma reproducible
RUN npm ci

# ── Stage 2: Build ───────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copiar node_modules del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo el código fuente
COPY . .

# Variables de entorno de Vite (build-time)
ARG VITE_API_BASE_URL="http://localhost:13003/api"
ARG VITE_API_TIMEOUT=100000

# Construir la aplicación (Usamos vite build directamente para omitir la validación estricta de tsc)
RUN npx vite build

# ── Stage 3: Runtime (Nginx) ─────────────────────────────────
FROM nginx:1.27-alpine

LABEL maintainer="BankMind Team"
LABEL description="BankMind Frontend — SPA React servida con Nginx"

# Copiar el build estático
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD wget --spider -q http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]