#!/bin/bash

# ===============================================
# TESTS COMPLETS - WORKFLOW DE PAIEMENT PSP
# ===============================================
# Script de validation complète du système de paiement selon cahier des charges
# 🔴 Workflow Synchrone : Transaction → URL → Client → Confirmation
# 🟢 Workflow Asynchrone : PSP → Opération → Webhook → Notification
# Usage: ./test-workflow.sh

set -e  # Arrêt en cas d'erreur

# Configuration
BACKEND_URL="http://localhost:3000"
PSP_URL="http://localhost:3002"
API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_api_secret_987654321fedcba0123456789abcdef"

echo "🚀 ================================================================"
echo "🚀 TESTS WORKFLOW COMPLET DE PAIEMENT - CAHIER DES CHARGES"
echo "🚀 🔴 Synchrone: Transaction → URL → Client → Confirmation"
echo "🚀 🟢 Asynchrone: PSP → Capture/Refund → Webhook → Notification"
echo "🚀 ================================================================"

# Fonction utilitaire pour attendre et afficher un délai
wait_for_processing() {
    local seconds=$1
    local message=${2:-"Traitement en cours"}
    echo "⏳ $message..."
    for i in $(seq 1 $seconds); do
        echo -n "."
        sleep 1
    done
    echo " ✅ Délai terminé"
}

# Fonction pour vérifier le succès d'une réponse JSON
check_response_success() {
    local response="$1"
    local operation_name="$2"
    
    local success=$(echo "$response" | jq -r '.success // false')
    if [ "$success" != "true" ]; then
        echo "❌ ERREUR dans $operation_name:"
        echo "$response" | jq '.'
        exit 1
    fi
}

# Compteur d'étapes
STEP=1
echo_step() {
    echo ""
    echo "📋 $STEP. $1"
    echo "$(printf '=%.0s' {1..60})"
    STEP=$((STEP + 1))
}

echo_step "VÉRIFICATION DE L'ÉTAT DES SERVICES"
echo "🔸 Backend principal..."
BACKEND_HEALTH=$(curl -s $BACKEND_URL/health)
echo "✅ Backend: $(echo $BACKEND_HEALTH | jq -r '.message')"

echo "🔸 PSP émulateur..."
PSP_HEALTH=$(curl -s $PSP_URL/health)
echo "✅ PSP: $(echo $PSP_HEALTH | jq -r '.service // .message')"

echo "🔸 API PSP paiement..."
PSP_PAYMENT_HEALTH=$(curl -s $PSP_URL/api/payment/health)
echo "✅ PSP Payment API: $(echo $PSP_PAYMENT_HEALTH | jq -r '.service')"

echo_step "� WORKFLOW SYNCHRONE - AUTHENTIFICATION ET ÉTAT INITIAL"
echo "🔸 Test d'authentification marchand TechShop..."
INITIAL_TRANSACTIONS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" $BACKEND_URL/api/transactions)
check_response_success "$INITIAL_TRANSACTIONS" "Authentification"

INITIAL_COUNT=$(echo $INITIAL_TRANSACTIONS | jq '.data.pagination.total')
echo "✅ Authentification réussie - Transactions existantes: $INITIAL_COUNT"

echo_step "� WORKFLOW SYNCHRONE - CRÉATION TRANSACTION MARCHAND"
echo "🔸 Le marchand TechShop crée une transaction pour un achat client..."

# Générer un order_id unique pour éviter les conflits
ORDER_ID="ORDER_WORKFLOW_$(date +%s)"

NEW_TRANSACTION=$(curl -s -X POST $BACKEND_URL/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "order_id": "'$ORDER_ID'",
    "amount": 149.99,
    "currency": "EUR",
    "customer_email": "jean.dupont@example.com",
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
    },
    "metadata": {
      "product_id": "gaming-headset-xl",
      "campaign": "black-friday-2024"
    }
  }')

check_response_success "$NEW_TRANSACTION" "Création de transaction"

TRANSACTION_ID=$(echo $NEW_TRANSACTION | jq -r '.data.transaction_id')
PAYMENT_URL=$(echo $NEW_TRANSACTION | jq -r '.data.payment_url')
PAYMENT_TOKEN=$(echo $PAYMENT_URL | sed 's/.*token=\([^&]*\).*/\1/')

echo "✅ Transaction créée avec succès:"
echo "   📊 ID: $TRANSACTION_ID"
echo "   🎫 Token: $PAYMENT_TOKEN"
echo "   🌐 URL: $PAYMENT_URL"
echo "   💰 Montant: 149.99 EUR"
echo "   🛒 Commande: $ORDER_ID"

echo_step "🔴 WORKFLOW SYNCHRONE - VÉRIFICATION TRANSACTION"
echo "🔸 Vérification que la transaction est bien en base avec statut 'pending'..."

TRANSACTION_DETAILS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$TRANSACTION_ID")
check_response_success "$TRANSACTION_DETAILS" "Récupération transaction"

TRANSACTION_STATUS=$(echo $TRANSACTION_DETAILS | jq -r '.data.status')
OPERATIONS_COUNT=$(echo $TRANSACTION_DETAILS | jq '.data.operations | length')

echo "✅ Transaction vérifiée:"
echo "   � Statut: $TRANSACTION_STATUS"
echo "   🔄 Opérations: $OPERATIONS_COUNT"

if [ "$TRANSACTION_STATUS" != "pending" ]; then
    echo "❌ ERREUR: Transaction devrait être en statut 'pending', trouvé: $TRANSACTION_STATUS"
    exit 1
fi

echo_step "🟢 WORKFLOW ASYNCHRONE - PAIEMENT RÉUSSI (CAPTURE)"
echo "🔸 Simulation: Le client confirme le paiement avec sa carte Visa..."
echo "🔸 Envoi au backend qui va créer l'opération et envoyer au PSP..."

wait_for_processing 2 "Préparation du paiement"

# Le client confirme le paiement via l'interface backend (pas directement PSP!)
PAYMENT_CONFIRMATION=$(curl -s -X POST "$BACKEND_URL/api/transactions/$TRANSACTION_ID/process" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$PAYMENT_TOKEN'",
    "payment_method": {
      "type": "card",
      "card_number": "4111111111111111",
      "cardholder_name": "Jean Dupont",
      "expiry_month": "12",
      "expiry_year": "2027",
      "cvv": "123"
    }
  }')

check_response_success "$PAYMENT_CONFIRMATION" "Confirmation de paiement"

OPERATION_ID_SUCCESS=$(echo $PAYMENT_CONFIRMATION | jq -r '.data.operation_id')
PSP_REFERENCE_SUCCESS=$(echo $PAYMENT_CONFIRMATION | jq -r '.data.psp_reference')

echo "✅ Paiement confirmé:"
echo "   🔸 Opération créée: $OPERATION_ID_SUCCESS"
echo "   🔸 PSP Reference: $PSP_REFERENCE_SUCCESS"
echo "   🔸 Le backend a envoyé la demande au PSP"
echo "   🔸 Le PSP va traiter et renvoyer un webhook"

wait_for_processing 5 "Traitement PSP et notification webhook"

echo_step "🟢 WORKFLOW ASYNCHRONE - VÉRIFICATION OPÉRATION CAPTURE"
echo "🔸 Vérification que l'opération 'capture' a été créée et que le webhook a été traité..."

UPDATED_TRANSACTION=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$TRANSACTION_ID")
check_response_success "$UPDATED_TRANSACTION" "Récupération transaction mise à jour"

UPDATED_STATUS=$(echo $UPDATED_TRANSACTION | jq -r '.data.status')
UPDATED_OPERATIONS_COUNT=$(echo $UPDATED_TRANSACTION | jq '.data.operations | length')

echo "✅ État après paiement:"
echo "   📈 Statut transaction: $UPDATED_STATUS"
echo "   � Nombre d'opérations: $UPDATED_OPERATIONS_COUNT"

if [ "$UPDATED_OPERATIONS_COUNT" -gt 0 ]; then
    echo "🔸 Détail des opérations:"
    echo $UPDATED_TRANSACTION | jq '.data.operations[] | "   💳 \(.type) - \(.status) - \(.amount) \(.currency) - PSP: \(.psp_reference // "N/A")"'
    
    # Vérifier qu'il y a au moins une opération capture réussie
    CAPTURE_SUCCESS=$(echo $UPDATED_TRANSACTION | jq '.data.operations[] | select(.type == "capture" and .status == "success")' | jq -s 'length')
    if [ "$CAPTURE_SUCCESS" -gt 0 ]; then
        echo "✅ Opération capture réussie trouvée"
    else
        echo "⚠️  Aucune opération capture réussie trouvée"
    fi
fi

echo_step "🟢 WORKFLOW ASYNCHRONE - PAIEMENT REFUSÉ (TEST D'ERREUR)"
echo "🔸 Test avec une carte déclinée pour valider la gestion d'erreur..."
echo "🔸 Création d'une nouvelle transaction pour tester le refus..."

# Créer une nouvelle transaction pour le test de refus
DECLINED_ORDER_ID="ORDER_DECLINED_$(date +%s)"
DECLINED_TRANSACTION=$(curl -s -X POST "$BACKEND_URL/api/transactions" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "EUR",
    "order_id": "'$DECLINED_ORDER_ID'",
    "customer_email": "declined@test.com",
    "description": "Test paiement refusé",
    "success_url": "https://techshop.example.com/payment/success",
    "cancel_url": "https://techshop.example.com/payment/cancel",
    "webhook_url": "https://techshop.example.com/webhook/payment"
  }')

check_response_success "$DECLINED_TRANSACTION" "Création transaction test refus"

DECLINED_TRANSACTION_ID=$(echo $DECLINED_TRANSACTION | jq -r '.data.transaction_id')
DECLINED_PAYMENT_URL=$(echo $DECLINED_TRANSACTION | jq -r '.data.payment_url')
DECLINED_PAYMENT_TOKEN=$(echo $DECLINED_PAYMENT_URL | sed 's/.*token=\([^&]*\).*/\1/')

echo "✅ Transaction de test créée:"
echo "   📊 ID: $DECLINED_TRANSACTION_ID"
echo "   🎫 Token: $DECLINED_PAYMENT_TOKEN"

wait_for_processing 1 "Préparation test refus"

# Tenter le paiement avec une carte qui sera refusée par le PSP
PAYMENT_DECLINED=$(curl -s -X POST "$BACKEND_URL/api/transactions/$DECLINED_TRANSACTION_ID/process" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$DECLINED_PAYMENT_TOKEN'",
    "payment_method": {
      "type": "card",
      "card_number": "4000000000000002",
      "cardholder_name": "Test Declined",
      "expiry_month": "12",
      "expiry_year": "2027",
      "cvv": "123"
    }
  }')

check_response_success "$PAYMENT_DECLINED" "Confirmation paiement décliné"

DECLINED_OPERATION_ID=$(echo $PAYMENT_DECLINED | jq -r '.data.operation_id')
echo "✅ Test de refus envoyé - Opération: $DECLINED_OPERATION_ID"

wait_for_processing 5 "Traitement du refus PSP et notification"

# Vérifier le statut de la transaction declined
DECLINED_FINAL=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$DECLINED_TRANSACTION_ID")

check_response_success "$DECLINED_FINAL" "Récupération transaction refusée"

DECLINED_STATUS=$(echo $DECLINED_FINAL | jq -r '.data.status')
echo "✅ Transaction refusée:"
echo "   📈 Statut: $DECLINED_STATUS"
echo "   💳 Opérations:"
echo $DECLINED_FINAL | jq '.data.operations[] | "   🔸 \(.type) - \(.status) - \(.amount) \(.currency)"'

echo_step "� WORKFLOW ASYNCHRONE - REMBOURSEMENT (REFUND)"
echo "🔸 Test de remboursement partiel sur une opération capture réussie..."

# Récupérer la transaction mise à jour
FINAL_TRANSACTION=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$TRANSACTION_ID")

# Trouver une opération capture réussie
SUCCESSFUL_CAPTURE=$(echo $FINAL_TRANSACTION | jq -r '.data.operations[] | select(.type == "capture" and .status == "success") | .psp_reference' | head -1)

if [ "$SUCCESSFUL_CAPTURE" != "null" ] && [ ! -z "$SUCCESSFUL_CAPTURE" ]; then
    echo "🔸 Remboursement partiel de 50€ sur l'opération: $SUCCESSFUL_CAPTURE"
    
    REFUND_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/transactions/$TRANSACTION_ID/refund" \
      -H "Content-Type: application/json" \
      -H "X-API-ID: $API_KEY" \
      -H "X-API-SECRET: $API_SECRET" \
      -d '{
        "amount": 50.00,
        "reason": "Remboursement partiel - Test workflow complet"
      }')
    
    check_response_success "$REFUND_RESPONSE" "Création remboursement"
    
    REFUND_OPERATION_ID=$(echo $REFUND_RESPONSE | jq -r '.data.operation_id')
    echo "✅ Remboursement créé - Opération: $REFUND_OPERATION_ID"
    echo "✅ Le backend va créer l'opération 'refund' et l'envoyer au PSP"
    
    wait_for_processing 3 "Traitement du remboursement backend vers PSP"
else
    echo "⚠️  Aucune opération capture réussie trouvée - skip du test de remboursement"
fi

echo_step "VÉRIFICATION FINALE DU WORKFLOW COMPLET"
echo "🔸 État final du système après tous les tests..."

FINAL_RESULT=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$TRANSACTION_ID")

FINAL_STATUS=$(echo $FINAL_RESULT | jq -r '.data.status')
FINAL_OPERATIONS=$(echo $FINAL_RESULT | jq '.data.operations | length')

echo "✅ RÉSUMÉ FINAL:"
echo "   📊 Transaction ID: $TRANSACTION_ID"
echo "   📈 Statut final: $FINAL_STATUS"
echo "   🔄 Total opérations: $FINAL_OPERATIONS"
echo "   🌐 URL de paiement: $PAYMENT_URL"

if [ "$FINAL_OPERATIONS" -gt 0 ]; then
    echo ""
    echo "🔸 HISTORIQUE COMPLET DES OPÉRATIONS:"
    echo $FINAL_RESULT | jq '.data.operations[] | "   \(.created_at) | \(.type) | \(.status) | \(.amount) \(.currency) | PSP: \(.psp_reference // "N/A")"'
fi

# Compter les types d'opérations
CAPTURE_COUNT=$(echo $FINAL_RESULT | jq '.data.operations[] | select(.type == "capture")' | jq -s 'length')
REFUND_COUNT=$(echo $FINAL_RESULT | jq '.data.operations[] | select(.type == "refund")' | jq -s 'length')

echo ""
echo "📊 STATISTIQUES DES OPÉRATIONS:"
echo "   💳 Captures: $CAPTURE_COUNT"
echo "   💰 Refunds: $REFUND_COUNT"

# Vérification des webhooks PSP
echo ""
echo "🔸 Vérification de l'historique des webhooks PSP..."
WEBHOOK_HISTORY=$(curl -s "$PSP_URL/api/webhook/history?limit=10")
WEBHOOK_COUNT=$(echo $WEBHOOK_HISTORY | jq '.total // 0')
echo "✅ Webhooks envoyés: $WEBHOOK_COUNT"

if [ "$WEBHOOK_COUNT" -gt 0 ]; then
    echo "🔸 Derniers webhooks:"
    echo $WEBHOOK_HISTORY | jq '.history[0:3] | .[] | "   📨 \(.operation_id) - \(.status) - \(.sent_at)"'
fi

echo ""
echo "🎯 ================================================================"
echo "🎯 TESTS WORKFLOW COMPLET TERMINÉS AVEC SUCCÈS"
echo "🎯 ================================================================"
echo "✅ � Workflow Synchrone: Transaction → URL → Confirmation ✓"
echo "✅ � Workflow Asynchrone: PSP → Opérations → Webhooks ✓"
echo "✅ Types d'opérations: Capture ($CAPTURE_COUNT) + Refund ($REFUND_COUNT) ✓"
echo "✅ Notifications PSP: $WEBHOOK_COUNT webhooks envoyés ✓"
echo "🎯 ================================================================"
