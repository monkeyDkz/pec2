# 🚀 Guide de démarrage - Payment Platform Backend

## 📋 Commandes à exécuter dans l'ordre

### 1. Installation des dépendances
```bash
cd /Users/zahidikays/Desktop/4AWD/S2/pec_2/pec/payment-platform/backend
npm install
```

### 2. Configuration de l'environnement
```bash
# Le fichier .env est déjà configuré avec les bonnes valeurs
# Vérifiez que votre clé Resend est correcte dans .env :
# RESEND_API_KEY=re_6MgbSiCi_JwR6PV91j9wGVh4mAH9RMEEu
```

### 3. Créer la base de données (si elle n'existe pas)
```bash
# Connectez-vous à MySQL et créez la DB :
mysql -u root -p
CREATE DATABASE IF NOT EXISTS payment_platform;
USE payment_platform;
exit;
```

### 4. Exécuter les migrations Sequelize
```bash
# Cela va créer la table users avec tous les champs nécessaires
npx sequelize-cli db:migrate
```

### 5. (Optionnel) Créer des données de test
```bash
npx sequelize-cli db:seed:all
```

### 6. Démarrer le serveur en mode développement
```bash
npm run dev
```

### 7. Ou démarrer en mode production
```bash
npm start
```

## 🧪 Tests avec request.http

Une fois le serveur démarré sur http://localhost:3000, utilisez :

1. **request.http** - Tests de base
2. **test-auth.http** - Tests complets et organisés

### Workflow de test complet :

1. **Inscription** → `POST /api/auth/register`
2. **Tentative connexion** → Doit échouer (email non vérifié)
3. **Vérifier email** → Avec le token reçu par email
4. **Connexion** → Doit réussir et retourner JWT
5. **Accès route protégée** → `GET /api/auth/profile` avec JWT

## ⚙️ Structure des modèles Sequelize

✅ **Modèle User** créé avec Sequelize
✅ **Migration** pour créer la table users
✅ **Associations** prêtes pour les futures tables
✅ **Méthodes statiques** pour l'authentification
✅ **Validation** intégrée
✅ **Index** pour les performances

## 🔧 Scripts package.json disponibles

```json
{
  "start": "node app.js",           // Production
  "dev": "nodemon app.js",          // Développement avec rechargement auto
  "migrate": "npx sequelize-cli db:migrate",
  "seed": "npx sequelize-cli db:seed:all"
}
```

## 🎯 Port standardisé : 3000

✅ Backend : http://localhost:3000
✅ Toutes les configurations mises à jour
✅ CORS configuré pour frontend sur port 8080
✅ Emails pointent vers http://localhost:8080

## 🚀 Prêt pour la production !

L'architecture est maintenant professionnelle avec :
- ✅ Sequelize ORM
- ✅ Migrations de base de données
- ✅ Modèles propres
- ✅ Authentification sécurisée
- ✅ Validation par email
- ✅ Port standardisé
- ✅ Tests organisés
