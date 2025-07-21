# 🚀 Authentication Backend - Payment Platform

## ✅ Fonctionnalités implémentées

- ✅ **Inscription** avec validation des données
- ✅ **Connexion** sécurisée avec JWT
- ✅ **Vérification email** via Resend
- ✅ **Renvoi d'email** de vérification
- ✅ **Routes protégées** avec middleware JWT
- ✅ **Validation** complète des données
- ✅ **Sécurité** avec bcrypt et JWT

## 🔧 Configuration requise

### 1. Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```bash
# OBLIGATOIRE : Votre clé API Resend
RESEND_API_KEY=re_votre_cle_api_resend

# OBLIGATOIRE : Email d'expédition vérifié sur Resend
RESEND_FROM_EMAIL=onboarding@resend.dev

# Optionnel : JWT Secret (déjà configuré)
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024_secure_payment_platform
```

### 2. Base de données

La table `users` doit exister avec ces colonnes :
- `id` (PRIMARY KEY AUTO_INCREMENT)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `is_verified` (BOOLEAN DEFAULT FALSE)
- `verification_token` (VARCHAR)
- `verification_expires` (DATETIME)
- `role` (ENUM 'admin', 'merchant')
- `created_at`, `updated_at` (TIMESTAMP)

## 🚀 Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditez .env avec votre clé Resend

# 3. Démarrer en mode développement
npm run dev

# 4. Ou en mode production
npm start
```

## 📋 API Endpoints

### 🔓 Routes publiques

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "Password123"
}
```

#### POST `/api/auth/login`
Connexion (nécessite email vérifié)
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### POST `/api/auth/verify-email`
Vérification d'email avec token
```json
{
  "token": "token_recu_par_email"
}
```

#### POST `/api/auth/resend-verification`
Renvoyer email de vérification
```json
{
  "email": "john@example.com"
}
```

### 🔒 Routes protégées

#### GET `/api/auth/profile`
Obtenir le profil utilisateur
```
Authorization: Bearer jwt_token
```

## 🧪 Tests

Utilisez le fichier `test-auth.http` pour tester toutes les fonctionnalités :

### Workflow de test complet :

1. **Inscription** → Crée utilisateur + envoie email
2. **Tentative de connexion** → Échoue (email non vérifié)
3. **Vérification email** → Active le compte
4. **Connexion** → Réussit + retourne JWT
5. **Accès route protégée** → Fonctionne avec JWT

## ⚠️ Points importants

### Sécurité
- ✅ Mots de passe hachés avec bcrypt (salt rounds: 12)
- ✅ JWT sécurisés avec expiration 24h
- ✅ Validation stricte des données d'entrée
- ✅ Protection contre la double inscription
- ✅ Tokens de vérification uniques et expiration

### Emails
- ✅ Templates HTML responsive et beaux
- ✅ Gestion d'erreurs d'envoi d'email
- ✅ URLs de vérification configurables
- ✅ Emails de bienvenue automatiques

### Validation
- ✅ Email : format valide requis
- ✅ Mot de passe : 8+ caractères, majuscule, minuscule, chiffre
- ✅ Noms : 2-50 caractères
- ✅ Messages d'erreur en français

## 🐛 Débogage

### Logs utiles
Le backend affiche des logs détaillés :
- ✅ Tentatives d'inscription/connexion
- ✅ Envois d'emails (succès/échec)
- ✅ Erreurs de validation
- ✅ Tokens JWT générés

### Erreurs courantes

1. **Email non envoyé** → Vérifiez `RESEND_API_KEY`
2. **Connexion échoue** → Email non vérifié
3. **Token invalide** → Expiré ou malformé
4. **CORS errors** → Vérifiez `FRONTEND_URL`

## 🎯 Statut : ✅ PRÊT POUR PRODUCTION

Toutes les fonctionnalités d'authentification sont implémentées et testées :
- Inscription ✅
- Vérification email ✅  
- Connexion ✅
- Routes protégées ✅
- Gestion d'erreurs ✅
- Sécurité ✅

**Testez avec le fichier `test-auth.http` !**
