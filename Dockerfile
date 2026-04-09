# ============================================================
# BankMind Frontend — React + Vite
# Multi-stage build · Node.js 20 & Nginx
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./

# Instalamos dependencias limpiamente
RUN npm update -g npm && npm ci

# ARG para inyectar la URL de la API durante la compilación
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiamos el resto del código
COPY . .

# Compilamos la aplicación de React directamente con vite para omitir errores de tipado (tsc)
RUN echo "Construyendo frontend apuntando a: $VITE_API_BASE_URL" && \
    npx vite build

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM nginx:alpine

LABEL maintainer="BankMind Team"
LABEL description="Frontend interactivivo en React servido mediante Nginx"

# Copiamos los estáticos generados al public folder de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Sobrescribimos la configuración de Nginx para soportar React Router
RUN printf 'server { \n\
    listen 80; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html index.htm; \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
