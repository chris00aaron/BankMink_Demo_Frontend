# ── Stage 1: Build del bundle de React ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json primero para aprovechar la caché de capas
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el resto del código fuente y compilar
COPY . .
RUN npx vite build

# ── Stage 2: Servidor Nginx ligero para producción ───────────────────────────
FROM nginx:alpine

# Copiar los archivos estáticos compilados desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto del Frontend
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
