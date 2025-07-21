# 🐳 Guide Docker - Payment Platform

## 📋 Commandes à exécuter dans l'ordre

### 1. Aller dans le dossier du projet
```bash
cd /Users/zahidikays/Desktop/4AWD/S2/pec_2/pec/payment-platform
```

### 2. Arrêter les containers existants (si ils tournent)
```bash
docker-compose down
```

### 3. Supprimer les images pour forcer la reconstruction
```bash
# Supprimer seulement l'image backend pour forcer rebuild
docker rmi payment-platform_backend

# Ou supprimer toutes les images du projet
docker-compose down --rmi all
```

### 4. Reconstruire et démarrer tous les services
```bash
# Reconstruction complète et démarrage
docker-compose up --build -d

# Ou étape par étape :
docker-compose build backend
docker-compose up -d
```

### 5. Vérifier que tout fonctionne
```bash
# Voir les logs du backend
docker-compose logs -f backend

# Voir le statut de tous les services
docker-compose ps

# Tester la connexion
curl http://localhost:3000/health
```

### 6. Exécuter les migrations Sequelize (si nécessaire)
```bash
# Se connecter au container backend
docker-compose exec backend sh

# Dans le container, exécuter les migrations
npx sequelize-cli db:migrate

# Sortir du container
exit
```

## 🧪 Tests avec Docker

Une fois tous les services démarrés :

### Services disponibles :
- 🚀 **Backend** : http://localhost:3000
- 🌐 **Frontend** : http://localhost:8080
- 🗄️ **MySQL** : localhost:3306
- 📊 **MongoDB** : localhost:27017
- 💾 **Redis** : localhost:6379
- 🔄 **PSP Emulator** : http://localhost:3002
- 🛒 **Test Merchant** : http://localhost:8081

### Tester l'authentification :
1. Utilisez `test-auth.http` ou `request.http`
2. Toutes les URLs pointent vers `http://localhost:3000`
3. Les emails pointent vers le frontend sur `http://localhost:8080`

## 🔧 Architecture Docker mise à jour

### ✅ Changements effectués :

1. **Port backend : 3001 → 3000**
   - ✅ docker-compose.yml mis à jour
   - ✅ Dockerfile backend mis à jour
   - ✅ Configuration cohérente

2. **Sequelize intégré à Docker**
   - ✅ Migrations automatiques au démarrage
   - ✅ Script wait-for-it pour attendre MySQL
   - ✅ Gestion propre des dépendances

3. **Configuration environnement**
   - ✅ Variables d'environnement Docker
   - ✅ Connexion MySQL via nom de service
   - ✅ URLs frontend/backend cohérentes

## 🚨 Commandes de débogage

### Si quelque chose ne marche pas :

```bash
# Voir les logs détaillés
docker-compose logs backend
docker-compose logs mysql

# Redémarrer un service spécifique
docker-compose restart backend

# Reconstruire complètement
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Nettoyer Docker complètement
docker system prune -a
```

### Se connecter aux services :

```bash
# Backend
docker-compose exec backend sh

# MySQL
docker-compose exec mysql mysql -u root -p

# Voir les tables créées
docker-compose exec mysql mysql -u root -ppayment_root_password_2024 -e "USE payment_platform; SHOW TABLES;"
```

## 🎯 Résultat attendu

Après avoir exécuté ces commandes, vous devriez avoir :

- ✅ Backend sur port 3000 avec Sequelize
- ✅ Table `users` créée automatiquement
- ✅ Authentification fonctionnelle
- ✅ Emails Resend opérationnels
- ✅ Tests .http qui marchent
- ✅ Architecture professionnelle prête pour notation

**🚀 Votre projet Docker est maintenant prêt pour votre devoir !**
