# 🔐 Workflow d'Authentification et Gestion Utilisateurs

## 📋 Vue d'ensemble

Ce document détaille tous les workflows d'authentification : inscription, validation par email, connexion, et gestion des utilisateurs.

## 🚀 1. Inscription d'un Nouvel Utilisateur

### Endpoint
```
POST /api/auth/register
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "email": "nouveau@example.com",
  "password": "monMotDePasse123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+33123456789"
}
```

### Exemple cURL
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "motdepasse123",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+33123456789"
  }'
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for validation.",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "jean.dupont@example.com",
    "status": "pending"
  }
}
```

### Réponse d'Erreur
```json
{
  "success": false,
  "error": "Email already exists"
}
```

## ✉️ 2. Validation par Email

### Récupération du Token de Validation
Après inscription, un email est envoyé avec un lien de validation contenant un token.
Format du lien : `http://localhost:8080/validate-email?token=VALIDATION_TOKEN`

### Endpoint de Validation
```
POST /api/auth/validate-email
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Exemple cURL
```bash
# Récupérer le token depuis l'email ou les logs
VALIDATION_TOKEN="your_validation_token_here"

curl -X POST http://localhost:3000/api/auth/validate-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$VALIDATION_TOKEN'"
  }'
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Email validated successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "jean.dupont@example.com",
    "status": "active"
  }
}
```

## 🔑 3. Connexion Utilisateur

### Endpoint
```
POST /api/auth/login
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "email": "jean.dupont@example.com",
  "password": "motdepasse123"
}
```

### Exemple cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "motdepasse123"
  }'
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jean.dupont@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

## 👤 4. Profil Utilisateur

### Récupération du Profil
```
GET /api/auth/profile
```

### Headers
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Exemple cURL
```bash
# Utiliser le token reçu lors de la connexion
USER_TOKEN="your_jwt_token_here"

curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:3000/api/auth/profile
```

### Réponse
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jean.dupont@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "phone": "+33123456789",
      "status": "active",
      "created_at": "2025-07-19T10:00:00Z"
    }
  }
}
```

## 🔄 5. Changement de Mot de Passe

### Endpoint
```
PUT /api/auth/change-password
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Body
```json
{
  "current_password": "motdepasse123",
  "new_password": "nouveauMotDePasse456"
}
```

### Exemple cURL
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "current_password": "motdepasse123",
    "new_password": "nouveauMotDePasse456"
  }'
```

## 🔐 6. Réinitialisation de Mot de Passe

### Demande de Réinitialisation
```
POST /api/auth/forgot-password
```

### Body
```json
{
  "email": "jean.dupont@example.com"
}
```

### Exemple cURL
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com"
  }'
```

### Validation de la Réinitialisation
```
POST /api/auth/reset-password
```

### Body
```json
{
  "token": "reset_token_from_email",
  "new_password": "nouveauMotDePasse789"
}
```

## 📊 7. Script de Test Complet

### Création du Script
```bash
#!/bin/bash
# test-auth-workflow.sh

echo "🔐 Test du Workflow d'Authentification Complet"
echo "================================================"

BACKEND_URL="http://localhost:3000"
TEST_EMAIL="test.user.$(date +%s)@example.com"
TEST_PASSWORD="testPassword123"

echo "📧 Email de test: $TEST_EMAIL"

# 1. Inscription
echo "1️⃣  Inscription..."
REGISTER_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+33123456789"
  }')

echo "✅ Réponse inscription:"
echo $REGISTER_RESPONSE | jq '.'

USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user_id')
echo "👤 User ID: $USER_ID"

# 2. Récupération du token de validation depuis les logs
echo "2️⃣  Récupération du token de validation..."
sleep 2
VALIDATION_TOKEN=$(docker logs payment_backend 2>&1 | grep "Validation token:" | tail -1 | sed 's/.*Validation token: //')
echo "🎫 Token de validation: $VALIDATION_TOKEN"

# 3. Validation email
echo "3️⃣  Validation de l'email..."
VALIDATION_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/validate-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$VALIDATION_TOKEN'"
  }')

echo "✅ Réponse validation:"
echo $VALIDATION_RESPONSE | jq '.'

# 4. Connexion
echo "4️⃣  Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }')

echo "✅ Réponse connexion:"
echo $LOGIN_RESPONSE | jq '.'

USER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "🔑 JWT Token: $USER_TOKEN"

# 5. Récupération du profil
echo "5️⃣  Récupération du profil..."
PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $USER_TOKEN" \
  $BACKEND_URL/api/auth/profile)

echo "✅ Profil utilisateur:"
echo $PROFILE_RESPONSE | jq '.'

echo "🎉 Workflow d'authentification terminé avec succès!"
```

### Exécution du Test
```bash
chmod +x test-auth-workflow.sh
./test-auth-workflow.sh
```

## ⚠️ Gestion des Erreurs

### Erreurs Communes
1. **Email déjà existant** : `400 - Email already exists`
2. **Token invalide** : `400 - Invalid or expired token`
3. **Credentials invalides** : `401 - Invalid credentials`
4. **Token JWT expiré** : `401 - Token expired`
5. **Utilisateur non activé** : `403 - Account not activated`

### Debug et Logs
```bash
# Consulter les logs du backend pour les tokens de validation
docker logs payment_backend | grep -i "validation\|email\|token"

# Consulter les logs d'erreur
docker logs payment_backend | grep -i "error\|failed"
```

---

**➡️ Étape suivante** : [`02-merchant-workflow.md`](./02-merchant-workflow.md) - Création et validation de marchands
