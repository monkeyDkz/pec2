FROM node:18-alpine

WORKDIR /app

# Installer des dépendances système de base
RUN apk add --no-cache bash

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Démarrer l'application avec logs détaillés
CMD ["node", "app.js"]
