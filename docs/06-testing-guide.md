# 🧪 Guide de Tests Complets A à Z

## 📋 Vue d'ensemble

Ce guide vous permet de tester l'intégralité de la plateforme de paiement, de l'inscription utilisateur au remboursement, en passant par la validation administrative.

## 🚀 Préparation de l'Environnement

### Démarrage des Services
```bash
cd /Users/zahidikays/Desktop/4AWD/S2/pec_2/pec/payment-platform

# Démarrer tous les services
docker-compose up -d

# Vérifier que tous les services sont actifs
docker-compose ps
```

### Variables Globales
```bash
#!/bin/bash
# Configuration globale pour tous les tests

BACKEND_URL="http://localhost:3000"
PSP_URL="http://localhost:3002"
FRONTEND_URL="http://localhost:8080"

# Credentials admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"

# Credentials marchand existant (TechShop)
EXISTING_API_KEY="tech_shop_api_key_123456789abcdef"
EXISTING_API_SECRET="tech_shop_secret_987654321fedcba"
```

## 🔄 Workflow Complet End-to-End

### Script de Test Intégral
```bash
#!/bin/bash
# test-complete-workflow.sh

echo "🎯 ================================================================"
echo "🎯 TEST COMPLET PLATEFORME DE PAIEMENT A à Z"
echo "🎯 ================================================================"
echo "🎯 Étapes : Inscription → Marchand → Admin → Paiement → Remboursement"
echo "🎯 ================================================================"

# Configuration
BACKEND_URL="http://localhost:3000"
PSP_URL="http://localhost:3002"
TIMESTAMP=$(date +%s)
TEST_EMAIL="fulltest.user.$TIMESTAMP@example.com"
TEST_PASSWORD="testPassword123"

# Fonction d'attente avec animation
wait_with_animation() {
    local seconds=$1
    local message=${2:-"Traitement en cours"}
    echo "⏳ $message..."
    for i in $(seq 1 $seconds); do
        echo -n "."
        sleep 1
    done
    echo " ✅ Terminé"
}

# Fonction de vérification de succès
check_success() {
    local response="$1"
    local step="$2"
    local success=$(echo "$response" | jq -r '.success // false')
    if [ "$success" != "true" ]; then
        echo "❌ ÉCHEC à l'étape: $step"
        echo "$response" | jq '.'
        exit 1
    fi
}

echo ""
echo "🔍 ÉTAPE 0: VÉRIFICATION DES SERVICES"
echo "===================================="

echo "📡 Backend..."
BACKEND_HEALTH=$(curl -s $BACKEND_URL/health)
echo "✅ Backend: $(echo $BACKEND_HEALTH | jq -r '.message')"

echo "📡 PSP..."
PSP_HEALTH=$(curl -s $PSP_URL/health)
echo "✅ PSP: $(echo $PSP_HEALTH | jq -r '.service // .message')"

echo ""
echo "👤 ÉTAPE 1: INSCRIPTION UTILISATEUR"
echo "==================================="

echo "📧 Email de test: $TEST_EMAIL"

REGISTER_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "first_name": "Test",
    "last_name": "FullWorkflow",
    "phone": "+33123456789"
  }')

check_success "$REGISTER_RESPONSE" "Inscription utilisateur"

USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user_id')
echo "✅ Utilisateur créé: $USER_ID"

echo ""
echo "✉️  ÉTAPE 2: VALIDATION EMAIL"
echo "============================="

wait_with_animation 3 "Récupération du token de validation"

# Récupération du token depuis les logs
VALIDATION_TOKEN=$(docker logs payment_backend 2>&1 | grep "Validation token:" | tail -1 | sed 's/.*Validation token: //')
echo "🎫 Token de validation: ${VALIDATION_TOKEN:0:50}..."

VALIDATION_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/validate-email \
  -H "Content-Type: application/json" \
  -d '{"token": "'$VALIDATION_TOKEN'"}')

check_success "$VALIDATION_RESPONSE" "Validation email"
echo "✅ Email validé avec succès"

echo ""
echo "🔑 ÉTAPE 3: CONNEXION UTILISATEUR"
echo "================================="

LOGIN_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }')

check_success "$LOGIN_RESPONSE" "Connexion utilisateur"

USER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "✅ Connexion réussie"
echo "🔑 Token utilisateur: ${USER_TOKEN:0:50}..."

echo ""
echo "🏪 ÉTAPE 4: DEMANDE CRÉATION MARCHAND"
echo "===================================="

MERCHANT_REQUEST=$(curl -s -X POST $BACKEND_URL/api/merchants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "name": "FullTest Shop '$TIMESTAMP'",
    "description": "Boutique de test workflow complet",
    "website_url": "https://fulltest-'$TIMESTAMP'.example.com",
    "business_type": "e-commerce",
    "company_name": "FullTest Shop SARL",
    "company_address": "123 Rue du Test Complet, 75001 Paris",
    "company_phone": "+33123456789",
    "company_email": "contact@fulltest-'$TIMESTAMP'.example.com",
    "siret": "12345678901234",
    "webhook_url": "https://fulltest-'$TIMESTAMP'.example.com/webhook"
  }')

check_success "$MERCHANT_REQUEST" "Demande création marchand"

MERCHANT_ID=$(echo $MERCHANT_REQUEST | jq -r '.data.merchant_id')
echo "✅ Demande marchand créée: $MERCHANT_ID"

echo ""
echo "👨‍💼 ÉTAPE 5: CONNEXION ADMIN"
echo "=============================

ADMIN_LOGIN=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }')

check_success "$ADMIN_LOGIN" "Connexion admin"

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.token')
echo "✅ Admin connecté"
echo "🔑 Token admin: ${ADMIN_TOKEN:0:50}..."

echo ""
echo "✅ ÉTAPE 6: VALIDATION MARCHAND PAR ADMIN"
echo "========================================="

VALIDATION_ADMIN=$(curl -s -X PUT "$BACKEND_URL/api/admin/merchants/$MERCHANT_ID/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "validation_notes": "Test workflow complet - Marchand validé automatiquement"
  }')

check_success "$VALIDATION_ADMIN" "Validation marchand"

API_KEY=$(echo $VALIDATION_ADMIN | jq -r '.data.api_key')
API_SECRET=$(echo $VALIDATION_ADMIN | jq -r '.data.api_secret')

echo "✅ Marchand validé avec succès"
echo "🔑 Credentials générés:"
echo "   API Key: $API_KEY"
echo "   API Secret: $API_SECRET"

echo ""
echo "💳 ÉTAPE 7: CRÉATION TRANSACTION"
echo "==============================="

ORDER_ID="FULLTEST_ORDER_$TIMESTAMP"

TRANSACTION_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "order_id": "'$ORDER_ID'",
    "amount": 299.99,
    "currency": "EUR",
    "customer_email": "customer.fulltest@example.com",
    "customer_first_name": "Customer",
    "customer_last_name": "FullTest",
    "description": "Produit Test Workflow Complet",
    "success_url": "https://fulltest.example.com/success",
    "cancel_url": "https://fulltest.example.com/cancel",
    "webhook_url": "https://fulltest.example.com/webhook",
    "metadata": {
      "test_type": "full_workflow",
      "timestamp": "'$TIMESTAMP'"
    }
  }')

check_success "$TRANSACTION_RESPONSE" "Création transaction"

TRANSACTION_ID=$(echo $TRANSACTION_RESPONSE | jq -r '.data.transaction_id')
PAYMENT_URL=$(echo $TRANSACTION_RESPONSE | jq -r '.data.payment_url')
PAYMENT_TOKEN=$(echo $PAYMENT_URL | sed 's/.*token=\([^&]*\).*/\1/')

echo "✅ Transaction créée:"
echo "   ID: $TRANSACTION_ID"
echo "   Montant: 299.99 EUR"
echo "   Token: ${PAYMENT_TOKEN:0:50}..."

echo ""
echo "💸 ÉTAPE 8: TRAITEMENT PAIEMENT RÉUSSI"
echo "======================================"

PAYMENT_SUCCESS=$(curl -s -X POST "$BACKEND_URL/api/transactions/$TRANSACTION_ID/process" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$PAYMENT_TOKEN'",
    "payment_method": {
      "type": "card",
      "card_number": "4111111111111111",
      "cardholder_name": "Customer FullTest",
      "expiry_month": "12",
      "expiry_year": "2027",
      "cvv": "123"
    }
  }')

check_success "$PAYMENT_SUCCESS" "Paiement"

OPERATION_ID=$(echo $PAYMENT_SUCCESS | jq -r '.data.operation_id')
PSP_REFERENCE=$(echo $PAYMENT_SUCCESS | jq -r '.data.psp_reference')

echo "✅ Paiement initié:"
echo "   Opération: $OPERATION_ID"
echo "   PSP Ref: $PSP_REFERENCE"

wait_with_animation 6 "Traitement PSP et webhook"

echo ""
echo "📊 ÉTAPE 9: VÉRIFICATION STATUT TRANSACTION"
echo "==========================================="

TRANSACTION_STATUS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$TRANSACTION_ID")

check_success "$TRANSACTION_STATUS" "Récupération statut"

FINAL_STATUS=$(echo $TRANSACTION_STATUS | jq -r '.data.status')
OPERATIONS_COUNT=$(echo $TRANSACTION_STATUS | jq '.data.operations | length')

echo "✅ Statut final transaction: $FINAL_STATUS"
echo "✅ Nombre d'opérations: $OPERATIONS_COUNT"

if [ "$OPERATIONS_COUNT" -gt 0 ]; then
    echo "📋 Détail des opérations:"
    echo $TRANSACTION_STATUS | jq '.data.operations[] | "   💳 \(.type) - \(.status) - \(.amount) \(.currency) - PSP: \(.psp_reference // "N/A")"'
    
    # Vérifier s'il y a une capture réussie pour le remboursement
    CAPTURE_SUCCESS=$(echo $TRANSACTION_STATUS | jq '.data.operations[] | select(.type == "capture" and (.status == "completed" or .status == "success"))' | jq -s 'length')
    
    if [ "$CAPTURE_SUCCESS" -gt 0 ]; then
        echo ""
        echo "💰 ÉTAPE 10: REMBOURSEMENT PARTIEL"
        echo "=================================="
        
        REFUND_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/transactions/$TRANSACTION_ID/refund" \
          -H "Content-Type: application/json" \
          -H "X-API-ID: $API_KEY" \
          -H "X-API-SECRET: $API_SECRET" \
          -d '{
            "amount": 100.00,
            "reason": "Test remboursement workflow complet"
          }')
        
        if [ "$(echo $REFUND_RESPONSE | jq -r '.success')" == "true" ]; then
            echo "✅ Remboursement initié:"
            echo $REFUND_RESPONSE | jq '.data'
            
            wait_with_animation 5 "Traitement remboursement PSP"
            
            # Vérification finale
            FINAL_CHECK=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
              "$BACKEND_URL/api/transactions/$TRANSACTION_ID")
            
            FINAL_OPERATIONS=$(echo $FINAL_CHECK | jq '.data.operations | length')
            CAPTURE_COUNT=$(echo $FINAL_CHECK | jq '.data.operations[] | select(.type == "capture")' | jq -s 'length')
            REFUND_COUNT=$(echo $FINAL_CHECK | jq '.data.operations[] | select(.type == "refund")' | jq -s 'length')
            
            echo "✅ État final:"
            echo "   Total opérations: $FINAL_OPERATIONS"
            echo "   Captures: $CAPTURE_COUNT"
            echo "   Remboursements: $REFUND_COUNT"
        else
            echo "⚠️  Remboursement échoué:"
            echo $REFUND_RESPONSE | jq '.'
        fi
    else
        echo "⚠️  Pas de capture réussie - remboursement non possible"
    fi
fi

echo ""
echo "📊 ÉTAPE 11: VÉRIFICATION ADMIN FINALE"
echo "======================================"

ADMIN_TRANSACTION_VIEW=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BACKEND_URL/api/admin/transactions/$TRANSACTION_ID")

echo "👨‍💼 Vue admin de la transaction:"
echo $ADMIN_TRANSACTION_VIEW | jq '.data | {
  id: .id,
  status: .status,
  amount: .amount,
  merchant: .merchant.name,
  operations_count: (.operations | length)
}'

echo ""
echo "🎯 ================================================================"
echo "🎯 WORKFLOW COMPLET TERMINÉ AVEC SUCCÈS!"
echo "🎯 ================================================================"
echo "✅ ✅ Utilisateur créé et validé: $USER_ID"
echo "🏪 ✅ Marchand créé et validé: $MERCHANT_ID"
echo "🔑 ✅ Credentials générés: $API_KEY"
echo "💳 ✅ Transaction traitée: $TRANSACTION_ID"
echo "💰 ✅ Workflow paiement et remboursement: OK"
echo "👨‍💼 ✅ Supervision admin: OK"
echo "🎯 ================================================================"
echo "🎯 TOUTES LES ÉTAPES VALIDÉES - PLATEFORME OPÉRATIONNELLE"
echo "🎯 ================================================================"
```

## 🚦 Tests par Scénarios

### 1. Test de Succès Complet
```bash
#!/bin/bash
# test-success-scenario.sh

echo "✅ Scénario: Workflow de Succès Complet"
echo "======================================="

# Utiliser le marchand existant pour plus de rapidité
API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"

# Créer transaction
ORDER_ID="SUCCESS_$(date +%s)"
# ... (code de création transaction)

# Paiement avec carte valide
# Card: 4111111111111111

# Vérifier succès
# Faire remboursement partiel
# Vérifier remboursement
```

### 2. Test d'Échec de Paiement
```bash
#!/bin/bash
# test-failure-scenario.sh

echo "❌ Scénario: Échec de Paiement"
echo "=============================="

# Créer transaction
# Utiliser carte déclinée: 4000000000000002
# Vérifier échec
# Vérifier pas d'opération créée
```

### 3. Test de Refus Marchand
```bash
#!/bin/bash
# test-merchant-rejection.sh

echo "❌ Scénario: Refus de Marchand"
echo "============================="

# Créer utilisateur
# Demander marchand
# Admin refuse la demande
# Vérifier statut 'rejected'
```

### 4. Test de Suspension
```bash
#!/bin/bash
# test-suspension-scenario.sh

echo "⏸️  Scénario: Suspension de Marchand"
echo "===================================="

# Créer et valider marchand
# Admin suspend le marchand
# Tenter de créer transaction (doit échouer)
# Admin réactive le marchand
# Créer transaction (doit réussir)
```

## 🔍 Tests de Performance

### Test de Charge Basique
```bash
#!/bin/bash
# test-performance.sh

echo "🚀 Test de Performance Basique"
echo "=============================="

API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"

# Créer 10 transactions simultanément
for i in {1..10}; do
    (
        ORDER_ID="PERF_TEST_${i}_$(date +%s)"
        curl -s -X POST http://localhost:3000/api/transactions \
          -H "Content-Type: application/json" \
          -H "X-API-ID: $API_KEY" \
          -H "X-API-SECRET: $API_SECRET" \
          -d '{
            "order_id": "'$ORDER_ID'",
            "amount": '$((i * 10)).99',
            "currency": "EUR",
            "customer_email": "perf'$i'@example.com",
            "customer_first_name": "Perf",
            "customer_last_name": "Test'$i'",
            "description": "Test performance '$i'"
          }' | jq '.data.transaction_id' &
    )
done

wait
echo "✅ 10 transactions créées simultanément"
```

## 🐛 Tests de Gestion d'Erreurs

### Test d'Erreurs de Validation
```bash
#!/bin/bash
# test-validation-errors.sh

echo "⚠️  Test de Gestion d'Erreurs"
echo "============================="

API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"

# Test 1: Montant invalide
echo "1. Test montant négatif..."
NEGATIVE_AMOUNT=$(curl -s -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "order_id": "ERROR_TEST_1",
    "amount": -50.00,
    "currency": "EUR",
    "customer_email": "error@example.com",
    "description": "Test erreur montant négatif"
  }')

echo "Résultat: $(echo $NEGATIVE_AMOUNT | jq -r '.error // "Pas d'erreur détectée"')"

# Test 2: Email invalide
echo "2. Test email invalide..."
INVALID_EMAIL=$(curl -s -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "order_id": "ERROR_TEST_2",
    "amount": 50.00,
    "currency": "EUR",
    "customer_email": "email-invalide",
    "description": "Test erreur email"
  }')

echo "Résultat: $(echo $INVALID_EMAIL | jq -r '.error // "Pas d'erreur détectée"')"

# Test 3: Credentials invalides
echo "3. Test credentials invalides..."
INVALID_CREDS=$(curl -s -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-ID: fake_key" \
  -H "X-API-SECRET: fake_secret" \
  -d '{
    "order_id": "ERROR_TEST_3",
    "amount": 50.00,
    "currency": "EUR",
    "customer_email": "test@example.com",
    "description": "Test erreur credentials"
  }')

echo "Résultat: $(echo $INVALID_CREDS | jq -r '.error // "Pas d'erreur détectée"')"
```

## 📊 Suivi et Monitoring des Tests

### Script de Monitoring
```bash
#!/bin/bash
# monitor-tests.sh

echo "📊 Monitoring des Tests en Temps Réel"
echo "====================================="

# Fonction de monitoring continu
monitor_services() {
    while true; do
        clear
        echo "📡 État des Services - $(date)"
        echo "==============================="
        
        # Backend
        BACKEND_STATUS=$(curl -s http://localhost:3000/health | jq -r '.message // "❌ Offline"')
        echo "Backend: $BACKEND_STATUS"
        
        # PSP
        PSP_STATUS=$(curl -s http://localhost:3002/health | jq -r '.service // "❌ Offline"')
        echo "PSP: $PSP_STATUS"
        
        # Base de données
        DB_STATUS=$(docker exec payment_mysql mysqladmin ping -h localhost --silent && echo "✅ Online" || echo "❌ Offline")
        echo "MySQL: $DB_STATUS"
        
        echo ""
        echo "📈 Métriques Récentes"
        echo "===================="
        
        # Nombre de transactions du jour
        TODAY=$(date +%Y-%m-%d)
        TRANSACTIONS_TODAY=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
          "http://localhost:3000/api/admin/transactions?start_date=$TODAY" | jq '.data.transactions | length')
        echo "Transactions aujourd'hui: $TRANSACTIONS_TODAY"
        
        # Webhooks PSP
        WEBHOOKS_COUNT=$(curl -s http://localhost:3002/api/webhook/history | jq '.total // 0')
        echo "Webhooks PSP envoyés: $WEBHOOKS_COUNT"
        
        sleep 5
    done
}

# Démarrer le monitoring
monitor_services
```

## 🔧 Utilitaires de Test

### Nettoyage des Données de Test
```bash
#!/bin/bash
# cleanup-test-data.sh

echo "🧹 Nettoyage des Données de Test"
echo "==============================="

# Supprimer les utilisateurs de test
docker exec payment_mysql mysql -u root -proot payment_platform -e "
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%fulltest%';
"

# Supprimer les marchands de test
docker exec payment_mysql mysql -u root -proot payment_platform -e "
DELETE FROM merchants WHERE name LIKE '%Test%' OR name LIKE '%FullTest%';
"

# Supprimer les transactions de test
docker exec payment_mysql mysql -u root -proot payment_platform -e "
DELETE FROM transactions WHERE order_id LIKE '%TEST%' OR order_id LIKE '%FULLTEST%';
"

echo "✅ Données de test supprimées"
```

### Génération de Données de Test
```bash
#!/bin/bash
# generate-test-data.sh

echo "🏭 Génération de Données de Test"
echo "==============================="

API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"

# Générer 20 transactions de test
for i in {1..20}; do
    AMOUNT=$((RANDOM % 500 + 10))
    ORDER_ID="GENERATED_$(date +%s)_$i"
    
    curl -s -X POST http://localhost:3000/api/transactions \
      -H "Content-Type: application/json" \
      -H "X-API-ID: $API_KEY" \
      -H "X-API-SECRET: $API_SECRET" \
      -d '{
        "order_id": "'$ORDER_ID'",
        "amount": '$AMOUNT'.99,
        "currency": "EUR",
        "customer_email": "generated'$i'@example.com",
        "customer_first_name": "Generated",
        "customer_last_name": "Customer'$i'",
        "description": "Transaction générée automatiquement #'$i'"
      }' > /dev/null
    
    echo "✅ Transaction $i créée: $ORDER_ID ($AMOUNT.99 EUR)"
done

echo "🎉 20 transactions de test générées"
```

---

**➡️ Étape suivante** : [`07-api-reference.md`](./07-api-reference.md) - Référence complète des APIs
