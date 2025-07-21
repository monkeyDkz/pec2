# 👨‍💼 Workflow Administration et Validation

## 📋 Vue d'ensemble

Ce document détaille tous les workflows d'administration : validation des marchands, gestion des utilisateurs, supervision des transactions, et administration système.

## 🔐 Connexion Administrateur

### Credentials Admin par Défaut
```bash
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
```

### Connexion
```
POST /api/auth/login
```

### Exemple cURL
```bash
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.token')
echo "🔑 Token Admin: $ADMIN_TOKEN"
```

## 🏪 1. Gestion des Marchands

### Consultation des Demandes de Marchands

#### Endpoint
```
GET /api/admin/merchants
```

#### Paramètres
```bash
?status=pending     # Filtrer par statut
&page=1            # Pagination
&limit=10          # Nombre par page
&search=techshop   # Recherche par nom
```

#### Headers
```json
{
  "Authorization": "Bearer ADMIN_JWT_TOKEN"
}
```

#### Exemple cURL
```bash
# Toutes les demandes en attente
PENDING_MERCHANTS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/merchants?status=pending")

echo "📋 Marchands en attente:"
echo $PENDING_MERCHANTS | jq '.data.merchants[] | {id: .id, name: .name, created_at: .created_at}'

# Recherche par nom
SEARCH_MERCHANTS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/merchants?search=tech")

echo "🔍 Résultats recherche 'tech':"
echo $SEARCH_MERCHANTS | jq '.data.merchants[] | {id: .id, name: .name}'
```

### Détail d'un Marchand

#### Endpoint
```
GET /api/admin/merchants/{merchant_id}
```

#### Exemple cURL
```bash
MERCHANT_ID="3ba67415-29cc-416e-966d-98d8cbcaf38f"

MERCHANT_DETAILS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/merchants/$MERCHANT_ID")

echo "📊 Détails marchand:"
echo $MERCHANT_DETAILS | jq '.data'
```

### Validation d'un Marchand

#### Endpoint
```
PUT /api/admin/merchants/{merchant_id}/validate
```

#### Body
```json
{
  "validation_notes": "Dossier complet et conforme. SIRET vérifié."
}
```

#### Exemple cURL
```bash
VALIDATION_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/admin/merchants/$MERCHANT_ID/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "validation_notes": "Dossier complet et conforme. SIRET vérifié."
  }')

echo "✅ Marchand validé:"
echo $VALIDATION_RESPONSE | jq '.data'

# Récupération des credentials générés
API_KEY=$(echo $VALIDATION_RESPONSE | jq -r '.data.api_key')
API_SECRET=$(echo $VALIDATION_RESPONSE | jq -r '.data.api_secret')

echo "🔑 Credentials générés:"
echo "   API Key: $API_KEY"
echo "   API Secret: $API_SECRET"
```

### Refus d'un Marchand

#### Endpoint
```
PUT /api/admin/merchants/{merchant_id}/reject
```

#### Body
```json
{
  "rejection_reason": "SIRET invalide et documents manquants"
}
```

#### Exemple cURL
```bash
REJECTION_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/admin/merchants/$MERCHANT_ID/reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "rejection_reason": "SIRET invalide et documents manquants"
  }')

echo "❌ Marchand refusé:"
echo $REJECTION_RESPONSE | jq '.'
```

### Suspension d'un Marchand

#### Endpoint
```
PUT /api/admin/merchants/{merchant_id}/suspend
```

#### Body
```json
{
  "suspension_reason": "Activité frauduleuse détectée",
  "duration_days": 30
}
```

#### Exemple cURL
```bash
SUSPENSION_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/admin/merchants/$MERCHANT_ID/suspend" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "suspension_reason": "Activité frauduleuse détectée",
    "duration_days": 30
  }')

echo "⏸️  Marchand suspendu:"
echo $SUSPENSION_RESPONSE | jq '.'
```

### Réactivation d'un Marchand

#### Endpoint
```
PUT /api/admin/merchants/{merchant_id}/activate
```

#### Exemple cURL
```bash
ACTIVATION_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/admin/merchants/$MERCHANT_ID/activate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "activation_notes": "Problème résolu, marchand réactivé"
  }')

echo "▶️  Marchand réactivé:"
echo $ACTIVATION_RESPONSE | jq '.'
```

## 👥 2. Gestion des Utilisateurs

### Liste des Utilisateurs

#### Endpoint
```
GET /api/admin/users
```

#### Paramètres
```bash
?status=active     # Filtrer par statut
&page=1           # Pagination
&limit=20         # Nombre par page
&email=@example   # Recherche par email
```

#### Exemple cURL
```bash
USERS_LIST=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/users?limit=5")

echo "👥 Utilisateurs:"
echo $USERS_LIST | jq '.data.users[] | {id: .id, email: .email, status: .status, created_at: .created_at}'
```

### Détail d'un Utilisateur

#### Endpoint
```
GET /api/admin/users/{user_id}
```

#### Exemple cURL
```bash
USER_ID="550e8400-e29b-41d4-a716-446655440000"

USER_DETAILS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/users/$USER_ID")

echo "👤 Détails utilisateur:"
echo $USER_DETAILS | jq '.data'
```

### Suspension d'un Utilisateur

#### Endpoint
```
PUT /api/admin/users/{user_id}/suspend
```

#### Body
```json
{
  "suspension_reason": "Violation des conditions d'utilisation",
  "duration_days": 7
}
```

#### Exemple cURL
```bash
USER_SUSPENSION=$(curl -s -X PUT "http://localhost:3000/api/admin/users/$USER_ID/suspend" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "suspension_reason": "Violation des conditions d'utilisation",
    "duration_days": 7
  }')

echo "⏸️  Utilisateur suspendu:"
echo $USER_SUSPENSION | jq '.'
```

## 💳 3. Supervision des Transactions

### Toutes les Transactions (Admin)

#### Endpoint
```
GET /api/admin/transactions
```

#### Paramètres
```bash
?status=completed        # Filtrer par statut
&merchant_id=xxx        # Filtrer par marchand
&start_date=2025-07-01  # Date de début
&end_date=2025-07-31    # Date de fin
&min_amount=100         # Montant minimum
&max_amount=1000        # Montant maximum
&page=1                 # Pagination
&limit=50               # Nombre par page
```

#### Exemple cURL
```bash
# Toutes les transactions du jour
TODAY=$(date +%Y-%m-%d)
DAILY_TRANSACTIONS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/transactions?start_date=$TODAY&limit=10")

echo "📊 Transactions du jour:"
echo $DAILY_TRANSACTIONS | jq '.data.transactions[] | {
  id: .id,
  merchant: .merchant.name,
  amount: .amount,
  status: .status,
  created_at: .created_at
}'

# Transactions suspectes (montants élevés)
SUSPICIOUS_TRANSACTIONS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/transactions?min_amount=1000&status=completed")

echo "🚨 Transactions importantes:"
echo $SUSPICIOUS_TRANSACTIONS | jq '.data.transactions[] | {
  id: .id,
  amount: .amount,
  merchant: .merchant.name
}'
```

### Détail d'une Transaction (Admin)

#### Endpoint
```
GET /api/admin/transactions/{transaction_id}
```

#### Exemple cURL
```bash
TRANSACTION_ID="550e8400-e29b-41d4-a716-446655440000"

ADMIN_TRANSACTION_DETAILS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/transactions/$TRANSACTION_ID")

echo "📋 Détails transaction (vue admin):"
echo $ADMIN_TRANSACTION_DETAILS | jq '.data'
```

### Annulation Administrative d'une Transaction

#### Endpoint
```
PUT /api/admin/transactions/{transaction_id}/cancel
```

#### Body
```json
{
  "cancellation_reason": "Fraude détectée",
  "refund_customer": true
}
```

#### Exemple cURL
```bash
CANCEL_TRANSACTION=$(curl -s -X PUT "http://localhost:3000/api/admin/transactions/$TRANSACTION_ID/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "cancellation_reason": "Fraude détectée",
    "refund_customer": true
  }')

echo "❌ Transaction annulée:"
echo $CANCEL_TRANSACTION | jq '.'
```

## 📊 4. Statistiques et Rapports

### Tableau de Bord Admin

#### Endpoint
```
GET /api/admin/dashboard
```

#### Exemple cURL
```bash
ADMIN_DASHBOARD=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/dashboard")

echo "📊 Tableau de bord:"
echo $ADMIN_DASHBOARD | jq '.'
```

#### Réponse Type
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_merchants": 15,
      "active_merchants": 12,
      "pending_merchants": 3,
      "total_users": 250,
      "active_users": 240
    },
    "transactions": {
      "today": {
        "count": 45,
        "volume": 12500.00,
        "success_rate": 94.5
      },
      "this_month": {
        "count": 1200,
        "volume": 350000.00,
        "success_rate": 92.8
      }
    },
    "top_merchants": [
      {
        "id": "merchant_1",
        "name": "TechShop Pro",
        "transaction_count": 150,
        "total_volume": 45000.00
      }
    ]
  }
}
```

### Rapports Financiers

#### Endpoint
```
GET /api/admin/reports/financial
```

#### Paramètres
```bash
?period=monthly        # daily, weekly, monthly, yearly
&year=2025            # Année
&month=7              # Mois (optionnel)
&merchant_id=xxx      # Marchand spécifique (optionnel)
```

#### Exemple cURL
```bash
# Rapport mensuel
MONTHLY_REPORT=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/reports/financial?period=monthly&year=2025&month=7")

echo "💰 Rapport financier mensuel:"
echo $MONTHLY_REPORT | jq '.data'

# Rapport par marchand
MERCHANT_REPORT=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/reports/financial?period=monthly&merchant_id=3ba67415-29cc-416e-966d-98d8cbcaf38f")

echo "🏪 Rapport marchand:"
echo $MERCHANT_REPORT | jq '.data'
```

## 🔧 5. Configuration Système

### Paramètres de la Plateforme

#### Endpoint
```
GET /api/admin/settings
```

#### Exemple cURL
```bash
PLATFORM_SETTINGS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/settings")

echo "⚙️  Paramètres plateforme:"
echo $PLATFORM_SETTINGS | jq '.data'
```

### Modification des Paramètres

#### Endpoint
```
PUT /api/admin/settings
```

#### Body
```json
{
  "payment_processing_fee": 2.5,
  "max_transaction_amount": 10000.00,
  "merchant_validation_required": true,
  "webhook_retry_attempts": 3,
  "transaction_timeout_minutes": 30
}
```

#### Exemple cURL
```bash
UPDATE_SETTINGS=$(curl -s -X PUT "http://localhost:3000/api/admin/settings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "payment_processing_fee": 2.8,
    "max_transaction_amount": 15000.00,
    "webhook_retry_attempts": 5
  }')

echo "⚙️  Paramètres mis à jour:"
echo $UPDATE_SETTINGS | jq '.'
```

## 📜 6. Logs et Audit

### Logs d'Audit

#### Endpoint
```
GET /api/admin/audit-logs
```

#### Paramètres
```bash
?action=merchant_validation  # Type d'action
&user_id=xxx                # Utilisateur
&start_date=2025-07-01      # Date début
&end_date=2025-07-31        # Date fin
&page=1                     # Pagination
&limit=50                   # Nombre par page
```

#### Exemple cURL
```bash
AUDIT_LOGS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/audit-logs?limit=10")

echo "📜 Logs d'audit récents:"
echo $AUDIT_LOGS | jq '.data.logs[] | {
  timestamp: .timestamp,
  action: .action,
  user: .user_email,
  details: .details
}'
```

### Logs Système

#### Endpoint
```
GET /api/admin/system-logs
```

#### Exemple cURL
```bash
SYSTEM_LOGS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3000/api/admin/system-logs?level=error&limit=20")

echo "🚨 Erreurs système récentes:"
echo $SYSTEM_LOGS | jq '.data.logs[] | {
  timestamp: .timestamp,
  level: .level,
  message: .message,
  service: .service
}'
```

## 🧪 7. Script de Test Administration Complet

### Création du Script
```bash
#!/bin/bash
# test-admin-workflow.sh

echo "👨‍💼 Test du Workflow Administration Complet"
echo "============================================="

BACKEND_URL="http://localhost:3000"

echo "🔐 1. CONNEXION ADMIN"
echo "===================="

ADMIN_LOGIN=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.token')
echo "✅ Connexion admin réussie"
echo "🔑 Token: ${ADMIN_TOKEN:0:50}..."

echo ""
echo "📊 2. TABLEAU DE BORD"
echo "===================="

DASHBOARD=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/dashboard")

echo "📈 Vue d'ensemble:"
echo $DASHBOARD | jq '.data.overview'

echo ""
echo "🏪 3. GESTION MARCHANDS"
echo "======================="

# Marchands en attente
PENDING_MERCHANTS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/merchants?status=pending")

PENDING_COUNT=$(echo $PENDING_MERCHANTS | jq '.data.merchants | length')
echo "📋 Marchands en attente: $PENDING_COUNT"

if [ "$PENDING_COUNT" -gt 0 ]; then
    echo "🔍 Premiers marchands en attente:"
    echo $PENDING_MERCHANTS | jq '.data.merchants[0:3] | .[] | {
      id: .id,
      name: .name,
      created_at: .created_at
    }'
    
    # Valider le premier marchand en attente
    FIRST_MERCHANT_ID=$(echo $PENDING_MERCHANTS | jq -r '.data.merchants[0].id')
    if [ "$FIRST_MERCHANT_ID" != "null" ]; then
        echo ""
        echo "✅ Validation du marchand: $FIRST_MERCHANT_ID"
        
        VALIDATION=$(curl -s -X PUT "$BACKEND_URL/api/admin/merchants/$FIRST_MERCHANT_ID/validate" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -d '{
            "validation_notes": "Test automatisé - Validation admin"
          }')
        
        echo "🔑 Credentials générés:"
        echo $VALIDATION | jq '.data | {api_key: .api_key, api_secret: .api_secret}'
    fi
fi

echo ""
echo "👥 4. GESTION UTILISATEURS"
echo "========================="

USERS_LIST=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/users?limit=5")

echo "👤 Derniers utilisateurs:"
echo $USERS_LIST | jq '.data.users[] | {
  id: .id,
  email: .email,
  status: .status,
  created_at: .created_at
}'

echo ""
echo "💳 5. SUPERVISION TRANSACTIONS"
echo "=============================="

TODAY=$(date +%Y-%m-%d)
DAILY_TRANSACTIONS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/transactions?start_date=$TODAY&limit=5")

DAILY_COUNT=$(echo $DAILY_TRANSACTIONS | jq '.data.transactions | length')
echo "📊 Transactions du jour: $DAILY_COUNT"

if [ "$DAILY_COUNT" -gt 0 ]; then
    echo "💳 Dernières transactions:"
    echo $DAILY_TRANSACTIONS | jq '.data.transactions[] | {
      id: .id,
      amount: .amount,
      status: .status,
      merchant: .merchant.name
    }'
fi

echo ""
echo "📜 6. AUDIT ET LOGS"
echo "=================="

AUDIT_LOGS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/audit-logs?limit=3")

echo "📋 Dernières actions d'audit:"
echo $AUDIT_LOGS | jq '.data.logs[] | {
  timestamp: .timestamp,
  action: .action,
  user: .user_email
}'

echo ""
echo "⚙️  7. PARAMÈTRES SYSTÈME"
echo "========================"

SETTINGS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/settings")

echo "🔧 Configuration actuelle:"
echo $SETTINGS | jq '.data | {
  payment_processing_fee: .payment_processing_fee,
  max_transaction_amount: .max_transaction_amount,
  merchant_validation_required: .merchant_validation_required
}'

echo ""
echo "🎉 Test administration terminé avec succès!"
```

### Exécution du Test
```bash
chmod +x test-admin-workflow.sh
./test-admin-workflow.sh
```

## ⚠️ Sécurité et Bonnes Pratiques

### Contrôle d'Accès
- ✅ Seuls les utilisateurs avec le rôle `admin` peuvent accéder aux endpoints admin
- ✅ Vérification JWT sur toutes les requêtes
- ✅ Logs d'audit de toutes les actions sensibles

### Actions Sensibles
- **Validation marchand** : Génération automatique des credentials API
- **Suspension** : Impact immédiat sur l'accès aux services
- **Annulation transaction** : Peut déclencher des remboursements automatiques

### Monitoring
- ✅ Logs d'audit pour traçabilité
- ✅ Alertes sur actions à risque
- ✅ Rapports réguliers d'activité

---

**➡️ Étape suivante** : [`06-testing-guide.md`](./06-testing-guide.md) - Guide de tests complets A à Z
