FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copiar todo el proyecto (backend + frontend)
COPY . .

EXPOSE 3000

CMD ["node", "backend/src/app.js"]
