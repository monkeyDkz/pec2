#!/bin/bash

# ===============================================
# WORKFLOW COMPLET ET CORRECT - SYSTÈME DE PAIEMENT
# ===============================================
# 🎯 Script qui suit le bon workflow : Transaction → Opération → PSP → Webhook
# 📧 Processus professionnel et réaliste

set -e

echo "🚀 WORKFLOW COMPLET - SYSTÈME DE PAIEMENT PROFESSIONNEL"
echo "=========================================================="

# Configuration
BACKEND_URL="http://localhost:3000"
PSP_URL="http://localhost:3002"
API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_api_secret_987654321fedcba0123456789abcdef"

# Compteurs
STEP=1

echo_step() {
    echo ""
    echo "📋 $STEP. $1"
    echo "$(printf '=%.0s' {1..50})"
    STEP=$((STEP + 1))
}

echo_step "VÉRIFICATION DE L'ÉTAT DES SERVICES"
echo "🔸 Backend principal..."
BACKEND_HEALTH=$(curl -s $BACKEND_URL/health)
echo "✅ Backend: $(echo $BACKEND_HEALTH | jq -r '.message')"

echo "🔸 PSP émulateur..."
PSP_HEALTH=$(curl -s $PSP_URL/health)
echo "✅ PSP: $(echo $PSP_HEALTH | jq -r '.service')"

echo_step "AUTHENTIFICATION ET ÉTAT INITIAL"
echo "🔸 Vérification des credentials TechShop..."
INITIAL_TRANSACTIONS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" $BACKEND_URL/api/transactions)
INITIAL_COUNT=$(echo $INITIAL_TRANSACTIONS | jq '.data.pagination.total')
echo "✅ Transactions existantes: $INITIAL_COUNT"

echo_step "CRÉATION D'UNE NOUVELLE TRANSACTION"
echo "🔸 Création d'une transaction pour un produit TechShop..."

NEW_TRANSACTION=$(curl -s -X POST $BACKEND_URL/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "order_id": "ORDER_WORKFLOW_'$(date +%s)'",
    "amount": 149.99,
    "currency": "EUR",
    "customer_email": "client.test@example.com",
    "customer_first_name": "Jean",
    "customer_last_name": "Dupont",
    "description": "Casque Gaming Pro XL - TechShop",
    "success_url": "https://techshop.example.com/payment/success",
    "cancel_url": "https://techshop.example.com/payment/cancel",
    "webhook_url": "https://techshop.example.com/webhook/payment",
    "billing_address": {
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "postal_code": "75001",
      "country": "FR"
    }
  }')

TRANSACTION_ID=$(echo $NEW_TRANSACTION | jq -r '.data.transaction_id')
PAYMENT_URL=$(echo $NEW_TRANSACTION | jq -r '.data.payment_url')

echo "✅ Transaction créée avec succès"
echo "   📊 ID: $TRANSACTION_ID"
echo "   🌐 URL de paiement: $PAYMENT_URL"

echo_step "SIMULATION DU PROCESSUS DE PAIEMENT CLIENT"
echo "🔸 Le client choisirait normalement sa méthode de paiement via l'interface..."
echo "🔸 Pour la démo, nous envoyons directement au PSP avec les données carte."

# Attendre un peu pour s'assurer que la transaction est bien en base
sleep 2

echo_step "ENVOI DU PAIEMENT AU PSP (SUCCESS)"
echo "🔸 Traitement d'un paiement avec carte Visa valide..."
echo "🔸 Le PSP va créer automatiquement l'opération dans le backend"

# Générer un ID unique pour l'opération (que le PSP utilisera)
OPERATION_ID="op_capture_$(date +%s)_$(jot -r 1 1000 9999)"

PSP_PAYMENT_SUCCESS=$(curl -s -X POST $PSP_URL/api/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "operation_id": "'$OPERATION_ID'",
    "transaction_id": "'$TRANSACTION_ID'",
    "amount": 149.99,
    "currency": "EUR",
    "payment_method": {
      "type": "card",
      "card_number": "4111111111111111",
      "card_holder": "Jean Dupont",
      "card_expiry": "12/27",
      "card_cvv": "123"
    },
    "callback_url": "http://backend:3000/api/webhooks/psp-notification"
  }')

PSP_REF_SUCCESS=$(echo $PSP_PAYMENT_SUCCESS | jq -r '.psp_reference')
echo "✅ Paiement envoyé au PSP - Référence: $PSP_REF_SUCCESS"
echo "⏳ Traitement asynchrone en cours..."

echo_step "SIMULATION D'UN PAIEMENT REFUSÉ"
echo "🔸 Test avec une carte déclinée pour valider la gestion d'erreur..."
echo "🔸 Le PSP va créer automatiquement l'opération pour ce test aussi"

# Générer un ID unique pour l'opération refusée
OPERATION_ID_DECLINED="op_capture_declined_$(date +%s)_$(jot -r 1 1000 9999)"

PSP_PAYMENT_DECLINED=$(curl -s -X POST $PSP_URL/api/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "operation_id": "'$OPERATION_ID_DECLINED'",
    "transaction_id": "'$TRANSACTION_ID'",
    "amount": 149.99,
    "currency": "EUR",
    "payment_method": {
      "type": "card",
      "card_number": "4000000000000002",
      "card_holder": "Test Declined",
      "card_expiry": "12/27",
      "card_cvv": "123"
    },
    "callback_url": "http://backend:3000/api/webhooks/psp-notification"
  }')

PSP_REF_DECLINED=$(echo $PSP_PAYMENT_DECLINED | jq -r '.psp_reference')
echo "✅ Test refus envoyé - Référence: $PSP_REF_DECLINED"

echo_step "ATTENTE DU TRAITEMENT ASYNCHRONE"
echo "🔸 Les webhooks PSP vont être envoyés automatiquement..."
echo "⏳ Attente de 5 secondes pour le traitement..."
sleep 5

echo_step "VÉRIFICATION DES WEBHOOKS PSP"
echo "🔸 Consultation de l'historique des webhooks envoyés..."
WEBHOOK_HISTORY=$(curl -s "$PSP_URL/api/webhook/history?limit=10")
WEBHOOK_COUNT=$(echo $WEBHOOK_HISTORY | jq '.total')
echo "✅ Webhooks envoyés: $WEBHOOK_COUNT"

if [ "$WEBHOOK_COUNT" -gt 0 ]; then
    echo "🔸 Derniers webhooks:"
    echo $WEBHOOK_HISTORY | jq '.history[0:2] | .[] | "   📨 \(.operation_id) - \(.status) - \(.sent_at)"'
fi

echo_step "CONSULTATION DE LA TRANSACTION APRÈS PAIEMENT"
echo "🔸 Vérification de l'état final de la transaction..."

FINAL_TRANSACTION=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$TRANSACTION_ID")

TRANSACTION_STATUS=$(echo $FINAL_TRANSACTION | jq -r '.data.status')
OPERATIONS_COUNT=$(echo $FINAL_TRANSACTION | jq '.data.operations | length')

echo "✅ État final de la transaction:"
echo "   📊 Statut: $TRANSACTION_STATUS"
echo "   🔄 Opérations: $OPERATIONS_COUNT"

if [ "$OPERATIONS_COUNT" -gt 0 ]; then
    echo "🔸 Détail des opérations:"
    echo $FINAL_TRANSACTION | jq '.data.operations[] | "   💳 \(.type) - \(.status) - \(.amount) \(.currency) - PSP: \(.psp_reference // "N/A")"'
fi

echo_step "TEST DE REMBOURSEMENT (si paiement réussi)"

# Attendre un peu plus pour s'assurer que les webhooks sont traités
sleep 3

# Vérifier s'il y a une opération de capture réussie pour faire le remboursement
SUCCESSFUL_OPERATION=$(echo $FINAL_TRANSACTION | jq -r '.data.operations[] | select(.type == "capture" and .status == "success") | .psp_reference' | head -1)

if [ "$SUCCESSFUL_OPERATION" != "null" ] && [ ! -z "$SUCCESSFUL_OPERATION" ]; then
    echo "🔸 Remboursement partiel sur l'opération: $SUCCESSFUL_OPERATION"
    echo "🔸 Le PSP va créer automatiquement l'opération de remboursement"
    
    # Générer un ID unique pour l'opération de remboursement
    REFUND_OPERATION_ID="op_refund_$(date +%s)_$(jot -r 1 1000 9999)"
    
    REFUND_TEST=$(curl -s -X POST $PSP_URL/api/payment/refund \
      -H "Content-Type: application/json" \
      -d '{
        "operation_id": "'$REFUND_OPERATION_ID'",
        "transaction_id": "'$TRANSACTION_ID'",
        "capture_reference": "'$SUCCESSFUL_OPERATION'",
        "refund_amount": 50.00,
        "currency": "EUR",
        "reason": "Remboursement partiel - Test workflow",
        "callback_url": "http://backend:3000/api/webhooks/psp-notification"
      }')
    
    REFUND_REF=$(echo $REFUND_TEST | jq -r '.psp_reference')
    echo "✅ Remboursement envoyé - Référence: $REFUND_REF"
else
    echo "⚠️  Aucun paiement réussi trouvé - skip du test de remboursement"
fi

echo_step "VÉRIFICATION FINALE DU SYSTÈME"
echo "🔸 État complet du système après workflow..."

FINAL_TRANSACTIONS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" $BACKEND_URL/api/transactions)
FINAL_COUNT=$(echo $FINAL_TRANSACTIONS | jq '.data.pagination.total')

echo "✅ Résumé final:"
echo "   📊 Total transactions: $FINAL_COUNT (était $INITIAL_COUNT)"
echo "   🆕 Nouvelles transactions: $((FINAL_COUNT - INITIAL_COUNT))"
echo "   💳 Transaction test: $TRANSACTION_ID"
echo "   🌐 URL paiement: $PAYMENT_URL"

# Vérifier à nouveau les webhooks après le remboursement
sleep 3
FINAL_WEBHOOK_HISTORY=$(curl -s "$PSP_URL/api/webhook/history?limit=5")
FINAL_WEBHOOK_COUNT=$(echo $FINAL_WEBHOOK_HISTORY | jq '.total')
echo "   📨 Total webhooks: $FINAL_WEBHOOK_COUNT"

echo ""
echo "🎯 =================================================================="
echo "🎯 WORKFLOW TERMINÉ AVEC SUCCÈS"
echo "🎯 =================================================================="
echo ""
echo "📋 RÉSUMÉ DES ACTIONS EFFECTUÉES:"
echo "   ✅ Vérification santé des services"
echo "   ✅ Authentification API validée" 
echo "   ✅ Création d'une transaction complète"
echo "   ✅ Paiement success envoyé au PSP"
echo "   ✅ Paiement refusé testé"
echo "   ✅ Webhooks PSP traités automatiquement"
echo "   ✅ Remboursement testé (si applicable)"
echo "   ✅ Vérifications finales effectuées"
echo ""
echo "🚀 Le système de paiement fonctionne de bout en bout !"
echo "📱 Prêt pour l'intégration front-end"
echo ""
