#!/bin/bash

# Script de démarrage pour Docker avec migrations Sequelize
echo "🚀 Démarrage du backend Payment Platform..."

# Attendre que MySQL soit disponible
echo "⏳ Attente de MySQL..."
./wait-for-it.sh mysql:3306 --timeout=60 --strict -- echo "✅ MySQL is up"

# Exécuter les migrations Sequelize
echo "🔄 Exécution des migrations Sequelize..."
npx sequelize-cli db:migrate

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
npm start
