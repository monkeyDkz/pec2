# 🏪 Workflow Marchand - Création et Validation

## 📋 Vue d'ensemble

Ce document détaille le workflow complet de gestion des marchands : demande de création, validation par l'administrateur, et activation.

## 👤 Prérequis

- Utilisateur authentifié avec un JWT token valide (voir [`01-auth-workflow.md`](./01-auth-workflow.md))
- Pour la validation : accès administrateur

## 🚀 1. Demande de Création de Marchand

### Endpoint
```
POST /api/merchants
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer JWT_TOKEN_USER"
}
```

### Body
```json
{
  "name": "TechShop Pro",
  "description": "Boutique spécialisée en matériel informatique et gaming",
  "website_url": "https://techshop-pro.example.com",
  "business_type": "e-commerce",
  "company_name": "TechShop Pro SARL",
  "company_address": "123 Avenue de la Technologie, 75001 Paris, France",
  "company_phone": "+33123456789",
  "company_email": "contact@techshop-pro.example.com",
  "siret": "12345678901234",
  "webhook_url": "https://techshop-pro.example.com/webhook/payment"
}
```

### Exemple cURL
```bash
# Utiliser le JWT token obtenu lors de la connexion utilisateur
USER_TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/api/merchants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "name": "TechShop Pro",
    "description": "Boutique spécialisée en matériel informatique et gaming",
    "website_url": "https://techshop-pro.example.com",
    "business_type": "e-commerce",
    "company_name": "TechShop Pro SARL",
    "company_address": "123 Avenue de la Technologie, 75001 Paris, France",
    "company_phone": "+33123456789",
    "company_email": "contact@techshop-pro.example.com",
    "siret": "12345678901234",
    "webhook_url": "https://techshop-pro.example.com/webhook/payment"
  }'
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Merchant application submitted successfully",
  "data": {
    "merchant_id": "3ba67415-29cc-416e-966d-98d8cbcaf38f",
    "name": "TechShop Pro",
    "status": "pending",
    "created_at": "2025-07-19T10:00:00Z"
  }
}
```

## 📋 2. Consultation des Demandes (Admin)

### Endpoint
```
GET /api/admin/merchants?status=pending
```

### Headers
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN"
}
```

### Connexion Admin
```bash
# Connexion en tant qu'admin
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.token')
```

### Exemple cURL
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/merchants?status=pending"
```

### Réponse
```json
{
  "success": true,
  "data": {
    "merchants": [
      {
        "id": "3ba67415-29cc-416e-966d-98d8cbcaf38f",
        "name": "TechShop Pro",
        "description": "Boutique spécialisée en matériel informatique et gaming",
        "website_url": "https://techshop-pro.example.com",
        "business_type": "e-commerce",
        "company_name": "TechShop Pro SARL",
        "status": "pending",
        "created_at": "2025-07-19T10:00:00Z",
        "created_by": "550e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

## ✅ 3. Validation du Marchand (Admin)

### Endpoint
```
PUT /api/admin/merchants/{merchant_id}/validate
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer ADMIN_JWT_TOKEN"
}
```

### Body
```json
{
  "validation_notes": "Documents vérifiés et conformes. Marchand approuvé."
}
```

### Exemple cURL
```bash
MERCHANT_ID="3ba67415-29cc-416e-966d-98d8cbcaf38f"

curl -X PUT http://localhost:3000/api/admin/merchants/$MERCHANT_ID/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "validation_notes": "Documents vérifiés et conformes. Marchand approuvé."
  }'
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Merchant validated successfully",
  "data": {
    "merchant_id": "3ba67415-29cc-416e-966d-98d8cbcaf38f",
    "name": "TechShop Pro",
    "status": "active",
    "api_key": "tech_shop_api_key_123456789abcdef",
    "api_secret": "tech_shop_secret_987654321fedcba",
    "validated_at": "2025-07-19T10:30:00Z",
    "validated_by": "admin_user_id"
  }
}
```

## 🔑 4. Récupération des Credentials API

Après validation, le marchand reçoit ses credentials API :

### API Key et Secret
```json
{
  "api_key": "tech_shop_api_key_123456789abcdef",
  "api_secret": "tech_shop_secret_987654321fedcba"
}
```

### Utilisation des Credentials
```bash
# Headers à utiliser pour toutes les requêtes marchand
X-API-ID: tech_shop_api_key_123456789abcdef
X-API-SECRET: tech_shop_secret_987654321fedcba
```

## 📊 5. Consultation du Profil Marchand

### Endpoint
```
GET /api/merchants/profile
```

### Headers
```json
{
  "X-API-ID": "tech_shop_api_key_123456789abcdef",
  "X-API-SECRET": "tech_shop_secret_987654321fedcba"
}
```

### Exemple cURL
```bash
API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"

curl -H "X-API-ID: $API_KEY" \
     -H "X-API-SECRET: $API_SECRET" \
     http://localhost:3000/api/merchants/profile
```

### Réponse
```json
{
  "success": true,
  "data": {
    "merchant": {
      "id": "3ba67415-29cc-416e-966d-98d8cbcaf38f",
      "name": "TechShop Pro",
      "description": "Boutique spécialisée en matériel informatique et gaming",
      "website_url": "https://techshop-pro.example.com",
      "business_type": "e-commerce",
      "status": "active",
      "webhook_url": "https://techshop-pro.example.com/webhook/payment",
      "created_at": "2025-07-19T10:00:00Z",
      "validated_at": "2025-07-19T10:30:00Z"
    }
  }
}
```

## ❌ 6. Refus de Validation (Admin)

### Endpoint
```
PUT /api/admin/merchants/{merchant_id}/reject
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer ADMIN_JWT_TOKEN"
}
```

### Body
```json
{
  "rejection_reason": "Documents manquants - SIRET invalide"
}
```

### Exemple cURL
```bash
curl -X PUT http://localhost:3000/api/admin/merchants/$MERCHANT_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "rejection_reason": "Documents manquants - SIRET invalide"
  }'
```

## 🔄 7. Suspension/Réactivation de Marchand

### Suspension
```bash
curl -X PUT http://localhost:3000/api/admin/merchants/$MERCHANT_ID/suspend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "suspension_reason": "Activité suspecte détectée"
  }'
```

### Réactivation
```bash
curl -X PUT http://localhost:3000/api/admin/merchants/$MERCHANT_ID/activate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "activation_notes": "Problème résolu, marchand réactivé"
  }'
```

## 📊 8. Script de Test Complet

### Création du Script
```bash
#!/bin/bash
# test-merchant-workflow.sh

echo "🏪 Test du Workflow Marchand Complet"
echo "===================================="

BACKEND_URL="http://localhost:3000"
TEST_EMAIL="merchant.test.$(date +%s)@example.com"
TEST_PASSWORD="merchantPass123"

# 1. Création d'un utilisateur pour le marchand
echo "1️⃣  Création utilisateur..."
REGISTER_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "first_name": "Merchant",
    "last_name": "Owner",
    "phone": "+33123456789"
  }')

USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user_id')
echo "👤 User créé: $USER_ID"

# 2. Validation email (simulation)
sleep 2
VALIDATION_TOKEN=$(docker logs payment_backend 2>&1 | grep "Validation token:" | tail -1 | sed 's/.*Validation token: //')
curl -s -X POST $BACKEND_URL/api/auth/validate-email \
  -H "Content-Type: application/json" \
  -d '{"token": "'$VALIDATION_TOKEN'"}' > /dev/null

# 3. Connexion utilisateur
echo "2️⃣  Connexion utilisateur..."
LOGIN_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }')

USER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "🔑 Token utilisateur: ${USER_TOKEN:0:50}..."

# 4. Demande de création marchand
echo "3️⃣  Demande création marchand..."
MERCHANT_REQUEST=$(curl -s -X POST $BACKEND_URL/api/merchants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "name": "Test Shop '.$(date +%s)'",
    "description": "Boutique de test automatisé",
    "website_url": "https://testshop.example.com",
    "business_type": "e-commerce",
    "company_name": "Test Shop SARL",
    "company_address": "123 Rue du Test, 75001 Paris",
    "company_phone": "+33123456789",
    "company_email": "contact@testshop.example.com",
    "siret": "12345678901234",
    "webhook_url": "https://testshop.example.com/webhook"
  }')

MERCHANT_ID=$(echo $MERCHANT_REQUEST | jq -r '.data.merchant_id')
echo "🏪 Marchand demandé: $MERCHANT_ID"

# 5. Connexion admin
echo "4️⃣  Connexion admin..."
ADMIN_LOGIN=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.token')
echo "👨‍💼 Token admin: ${ADMIN_TOKEN:0:50}..."

# 6. Consultation des demandes
echo "5️⃣  Consultation demandes..."
PENDING_MERCHANTS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/merchants?status=pending")

echo "📋 Marchands en attente:"
echo $PENDING_MERCHANTS | jq '.data.merchants[] | {id: .id, name: .name, status: .status}'

# 7. Validation du marchand
echo "6️⃣  Validation marchand..."
VALIDATION_RESPONSE=$(curl -s -X PUT $BACKEND_URL/api/admin/merchants/$MERCHANT_ID/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "validation_notes": "Test automatisé - Marchand approuvé"
  }')

echo "✅ Validation:"
echo $VALIDATION_RESPONSE | jq '.'

API_KEY=$(echo $VALIDATION_RESPONSE | jq -r '.data.api_key')
API_SECRET=$(echo $VALIDATION_RESPONSE | jq -r '.data.api_secret')

echo "🔑 Credentials générés:"
echo "   API Key: $API_KEY"
echo "   API Secret: $API_SECRET"

# 8. Test des credentials
echo "7️⃣  Test credentials..."
PROFILE_RESPONSE=$(curl -s -H "X-API-ID: $API_KEY" \
     -H "X-API-SECRET: $API_SECRET" \
     $BACKEND_URL/api/merchants/profile)

echo "📊 Profil marchand:"
echo $PROFILE_RESPONSE | jq '.data.merchant | {id: .id, name: .name, status: .status}'

echo "🎉 Workflow marchand terminé avec succès!"
echo "🔑 Credentials à utiliser pour les paiements:"
echo "   X-API-ID: $API_KEY"
echo "   X-API-SECRET: $API_SECRET"
```

### Exécution du Test
```bash
chmod +x test-merchant-workflow.sh
./test-merchant-workflow.sh
```

## 📋 9. États et Transitions

### Diagramme des États
```
[Demande] ---> [pending] ---> [active] (validation)
                   |
                   v
              [rejected] (refus)
                   
[active] <---> [suspended] (suspension/réactivation)
```

### Transitions Possibles
- `pending` → `active` : Validation par admin
- `pending` → `rejected` : Refus par admin  
- `active` → `suspended` : Suspension par admin
- `suspended` → `active` : Réactivation par admin

## ⚠️ Gestion des Erreurs

### Erreurs Communes
1. **Utilisateur non authentifié** : `401 - Unauthorized`
2. **Marchand déjà existant** : `400 - Merchant already exists for this user`
3. **SIRET invalide** : `400 - Invalid SIRET format`
4. **Admin uniquement** : `403 - Admin access required`
5. **Marchand inexistant** : `404 - Merchant not found`

---

**➡️ Étape suivante** : [`03-payment-workflow.md`](./03-payment-workflow.md) - Workflow de paiement complet
