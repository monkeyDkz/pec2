# 🐳 Guide Docker - Payment Platform

## 🚀 Configuration mise à jour

✅ **Port backend : 3000** (au lieu de 3001)
✅ **Base de données vide** (pas d'init-db.sql)
✅ **Migrations Sequelize** pour créer les tables
✅ **Modèles professionnels** avec Sequelize ORM

## 📋 Commandes pour démarrer le projet Docker

### 1. Arrêter et nettoyer les conteneurs existants
```bash
cd /Users/zahidikays/Desktop/4AWD/S2/pec_2/pec/payment-platform

# Arrêter tous les services
docker-compose down

# Supprimer les conteneurs et volumes (pour un redémarrage propre)
docker-compose down -v

# Optionnel : Supprimer les images pour rebuild complet
docker-compose down --rmi all -v
```

### 2. Construire et démarrer les services
```bash
# Construire toutes les images
docker-compose build

# Démarrer tous les services
docker-compose up -d

# Ou en une seule commande (build + start)
docker-compose up -d --build
```

### 3. Vérifier que les services sont démarrés
```bash
# Voir l'état des conteneurs
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f backend

# Voir les logs de la base de données
docker-compose logs mysql
```

### 4. Exécuter les migrations Sequelize dans le conteneur backend
```bash
# Se connecter au conteneur backend
docker-compose exec backend sh

# Dans le conteneur, exécuter les migrations
npx sequelize-cli db:migrate

# Vérifier que la table users a été créée
npx sequelize-cli db:migrate:status

# Sortir du conteneur
exit
```

### 5. Tester l'API
```bash
# Vérifier que l'API répond
curl http://localhost:3000/health

# Tester les routes d'authentification
curl http://localhost:3000/api/auth/test
```

## 🎯 URLs des services

- **Backend API** : http://localhost:3000
- **Frontend** : http://localhost:8080  
- **MySQL** : localhost:3306
- **Redis** : localhost:6379
- **MongoDB** : localhost:27017
- **PSP Emulator** : http://localhost:3002
- **Test Merchant** : http://localhost:8081

## 🧪 Tests avec VS Code

Une fois les services démarrés, utilisez les fichiers :
- `backend/request.http` 
- `backend/test-auth.http`

Changez l'URL de base pour utiliser `http://localhost:3000`

## 🔧 Commandes utiles Docker

### Redémarrer juste le backend
```bash
docker-compose restart backend
```

### Voir les logs d'un service spécifique
```bash
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Reconstruire juste le backend
```bash
docker-compose build backend
docker-compose up -d backend
```

### Se connecter à la base de données MySQL
```bash
docker-compose exec mysql mysql -u root -p payment_platform
# Password: payment_root_password_2024
```

### Commandes de migration dans le conteneur
```bash
# Se connecter au backend
docker-compose exec backend sh

# Voir l'état des migrations
npx sequelize-cli db:migrate:status

# Faire une nouvelle migration (si besoin)
npx sequelize-cli migration:generate --name add-something

# Annuler la dernière migration
npx sequelize-cli db:migrate:undo

# Refaire toutes les migrations
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

## 🎓 Workflow complet pour votre devoir

1. **Démarrer les services** : `docker-compose up -d --build`
2. **Exécuter les migrations** : `docker-compose exec backend npx sequelize-cli db:migrate`
3. **Tester l'authentification** : Utiliser les fichiers `.http` sur `localhost:3000`
4. **Vérifier les emails** : Inscription → Email Resend → Vérification
5. **Démonstration complète** : Inscription → Connexion → Routes protégées

## ⚠️ Notes importantes

- La base de données est maintenant **vide** au démarrage
- Les tables sont créées par les **migrations Sequelize**
- Plus besoin du script `init-db.sql`
- Architecture professionnelle avec ORM
- Port standardisé sur **3000** pour le backend

## 🚀 Prêt pour la démonstration !

Votre plateforme utilise maintenant une architecture moderne et professionnelle parfaite pour un devoir académique.
