# 💳 Workflow de Paiement Complet

## 📋 Vue d'ensemble

Ce document détaille le workflow complet de paiement : création de transaction, traitement PSP, gestion des succès/échecs, et remboursements.

## 🔑 Prérequis

- Marchand validé avec ses credentials API (voir [`02-merchant-workflow.md`](./02-merchant-workflow.md))
- Services backend et PSP démarrés

### Credentials de Test TechShop
```bash
API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"
```

## 🚀 1. Création d'une Transaction

### Endpoint
```
POST /api/transactions
```

### Headers
```json
{
  "Content-Type": "application/json",
  "X-API-ID": "tech_shop_api_key_123456789abcdef",
  "X-API-SECRET": "tech_shop_secret_987654321fedcba"
}
```

### Body
```json
{
  "order_id": "ORDER_123456789",
  "amount": 149.99,
  "currency": "EUR",
  "customer_email": "client@example.com",
  "customer_first_name": "Jean",
  "customer_last_name": "Dupont",
  "description": "Casque Gaming Pro XL",
  "success_url": "https://monsite.com/success",
  "cancel_url": "https://monsite.com/cancel",
  "webhook_url": "https://monsite.com/webhook",
  "billing_address": {
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "postal_code": "75001",
    "country": "FR"
  },
  "shipping_address": {
    "street": "456 Avenue des Champs",
    "city": "Lyon",
    "postal_code": "69001",
    "country": "FR"
  },
  "metadata": {
    "product_id": "gaming-headset-xl",
    "campaign": "black-friday-2024"
  }
}
```

### Exemple cURL
```bash
API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"
ORDER_ID="ORDER_$(date +%s)"

TRANSACTION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/transactions \
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
    "description": "Casque Gaming Pro XL",
    "success_url": "https://techshop.example.com/success",
    "cancel_url": "https://techshop.example.com/cancel",
    "webhook_url": "https://techshop.example.com/webhook",
    "billing_address": {
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "postal_code": "75001",
      "country": "FR"
    },
    "metadata": {
      "product_id": "gaming-headset-xl",
      "campaign": "test-workflow"
    }
  }')
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_url": "http://localhost:8080/payment/550e8400-e29b-41d4-a716-446655440000?token=abc123...",
    "order_id": "ORDER_123456789",
    "amount": 149.99,
    "currency": "EUR",
    "status": "pending",
    "expires_at": "2025-07-19T11:00:00Z"
  }
}
```

### Extraction des Données
```bash
TRANSACTION_ID=$(echo $TRANSACTION_RESPONSE | jq -r '.data.transaction_id')
PAYMENT_URL=$(echo $TRANSACTION_RESPONSE | jq -r '.data.payment_url')
PAYMENT_TOKEN=$(echo $PAYMENT_URL | sed 's/.*token=\([^&]*\).*/\1/')

echo "Transaction ID: $TRANSACTION_ID"
echo "Payment Token: $PAYMENT_TOKEN"
echo "Payment URL: $PAYMENT_URL"
```

## 💸 2. Traitement du Paiement (Succès)

### Endpoint
```
POST /api/transactions/{transaction_id}/process
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
  "token": "payment_token_from_url",
  "payment_method": {
    "type": "card",
    "card_number": "4111111111111111",
    "cardholder_name": "Jean Dupont",
    "expiry_month": "12",
    "expiry_year": "2027",
    "cvv": "123"
  }
}
```

### Exemple cURL (Paiement Réussi)
```bash
PAYMENT_SUCCESS=$(curl -s -X POST "http://localhost:3000/api/transactions/$TRANSACTION_ID/process" \
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

echo "✅ Paiement envoyé au PSP:"
echo $PAYMENT_SUCCESS | jq '.'
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Payment processing initiated",
  "data": {
    "operation_id": "op_550e8400-e29b-41d4-a716-446655440001",
    "psp_reference": "PSP_1234567890_ABC123",
    "status": "processing",
    "message": "Payment sent to PSP for processing"
  }
}
```

## ❌ 3. Traitement du Paiement (Échec)

### Cartes de Test pour Échec
```json
{
  "card_number": "4000000000000002",  // Carte déclinée
  "card_number": "4000000000000127",  // CVV incorrect
  "card_number": "4000000000000069"   // Carte expirée
}
```

### Exemple cURL (Paiement Échoué)
```bash
PAYMENT_FAILED=$(curl -s -X POST "http://localhost:3000/api/transactions/$TRANSACTION_ID/process" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$PAYMENT_TOKEN'",
    "payment_method": {
      "type": "card",
      "card_number": "4000000000000002",
      "cardholder_name": "Jean Dupont",
      "expiry_month": "12",
      "expiry_year": "2027",
      "cvv": "123"
    }
  }')

echo "❌ Paiement échoué:"
echo $PAYMENT_FAILED | jq '.'
```

## 📊 4. Vérification du Statut de Transaction

### Endpoint
```
GET /api/transactions/{transaction_id}
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
TRANSACTION_STATUS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "http://localhost:3000/api/transactions/$TRANSACTION_ID")

echo "📊 Statut de la transaction:"
echo $TRANSACTION_STATUS | jq '.'
```

### Réponse
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order_id": "ORDER_123456789",
    "amount": "149.99",
    "currency": "EUR",
    "status": "completed",
    "paid_at": "2025-07-19T10:45:00Z",
    "operations": [
      {
        "id": "op_550e8400-e29b-41d4-a716-446655440001",
        "type": "capture",
        "amount": "149.99",
        "currency": "EUR",
        "status": "completed",
        "psp_reference": "PSP_1234567890_ABC123",
        "psp_transaction_id": "TXN_9876543210",
        "created_at": "2025-07-19T10:44:30Z",
        "processed_at": "2025-07-19T10:45:00Z"
      }
    ]
  }
}
```

## 💰 5. Remboursement (Refund)

### Prérequis
- Transaction avec opération `capture` réussie
- Montant du remboursement ≤ montant capturé

### Endpoint
```
POST /api/transactions/{transaction_id}/refund
```

### Headers
```json
{
  "Content-Type": "application/json",
  "X-API-ID": "tech_shop_api_key_123456789abcdef",
  "X-API-SECRET": "tech_shop_secret_987654321fedcba"
}
```

### Body
```json
{
  "amount": 50.00,
  "reason": "Retour produit défectueux",
  "refund_method": "original_payment"
}
```

### Exemple cURL (Remboursement Partiel)
```bash
REFUND_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/transactions/$TRANSACTION_ID/refund" \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "amount": 50.00,
    "reason": "Retour produit défectueux",
    "refund_method": "original_payment"
  }')

echo "💰 Remboursement:"
echo $REFUND_RESPONSE | jq '.'
```

### Remboursement Total
```bash
# Pour un remboursement total, ne pas spécifier le montant
FULL_REFUND=$(curl -s -X POST "http://localhost:3000/api/transactions/$TRANSACTION_ID/refund" \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "reason": "Annulation commande client",
    "refund_method": "original_payment"
  }')
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Refund processing initiated",
  "data": {
    "refund_id": "rf_550e8400-e29b-41d4-a716-446655440002",
    "operation_id": "op_550e8400-e29b-41d4-a716-446655440003",
    "amount": 50.00,
    "currency": "EUR",
    "status": "processing",
    "psp_reference": "PSP_1234567890_REFUND123"
  }
}
```

## 📋 6. Liste des Transactions

### Endpoint
```
GET /api/transactions
```

### Paramètres de Requête
```bash
?page=1
&limit=10
&status=completed
&order_id=ORDER_123
&start_date=2025-07-01
&end_date=2025-07-31
```

### Exemple cURL
```bash
curl -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "http://localhost:3000/api/transactions?limit=5&status=completed"
```

## 🔔 7. Webhooks de Notification

### URL de Webhook
L'URL configurée lors de la création du marchand recevra les notifications.

### Structure du Webhook
```json
{
  "event_type": "transaction.completed",
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "merchant_id": "3ba67415-29cc-416e-966d-98d8cbcaf38f",
  "order_id": "ORDER_123456789",
  "amount": "149.99",
  "currency": "EUR",
  "status": "completed",
  "timestamp": "2025-07-19T10:45:00Z",
  "operation_id": "op_550e8400-e29b-41d4-a716-446655440001",
  "operation_type": "capture",
  "operation_status": "completed",
  "psp_reference": "PSP_1234567890_ABC123"
}
```

### Types d'Événements
- `transaction.processing` : Transaction en cours de traitement
- `transaction.completed` : Transaction réussie
- `transaction.failed` : Transaction échouée
- `refund.processing` : Remboursement en cours
- `refund.completed` : Remboursement réussi
- `refund.failed` : Remboursement échoué

## 🧪 8. Script de Test Complet

### Création du Script
```bash
#!/bin/bash
# test-payment-workflow.sh

echo "💳 Test du Workflow de Paiement Complet"
echo "======================================="

BACKEND_URL="http://localhost:3000"
API_KEY="tech_shop_api_key_123456789abcdef"
API_SECRET="tech_shop_secret_987654321fedcba"

# Fonction d'attente
wait_processing() {
    echo "⏳ Attente du traitement PSP..."
    sleep 5
    echo "✅ Délai terminé"
}

echo "🔄 1. CRÉATION DE TRANSACTION"
echo "============================"

ORDER_ID="TEST_ORDER_$(date +%s)"

TRANSACTION_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-ID: $API_KEY" \
  -H "X-API-SECRET: $API_SECRET" \
  -d '{
    "order_id": "'$ORDER_ID'",
    "amount": 199.99,
    "currency": "EUR",
    "customer_email": "test@example.com",
    "customer_first_name": "Test",
    "customer_last_name": "User",
    "description": "Produit de test",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel",
    "webhook_url": "https://example.com/webhook"
  }')

TRANSACTION_ID=$(echo $TRANSACTION_RESPONSE | jq -r '.data.transaction_id')
PAYMENT_URL=$(echo $TRANSACTION_RESPONSE | jq -r '.data.payment_url')
PAYMENT_TOKEN=$(echo $PAYMENT_URL | sed 's/.*token=\([^&]*\).*/\1/')

echo "✅ Transaction créée:"
echo "   ID: $TRANSACTION_ID"
echo "   Token: $PAYMENT_TOKEN"

echo ""
echo "💸 2. PAIEMENT RÉUSSI"
echo "==================="

PAYMENT_SUCCESS=$(curl -s -X POST "$BACKEND_URL/api/transactions/$TRANSACTION_ID/process" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$PAYMENT_TOKEN'",
    "payment_method": {
      "type": "card",
      "card_number": "4111111111111111",
      "cardholder_name": "Test User",
      "expiry_month": "12",
      "expiry_year": "2027",
      "cvv": "123"
    }
  }')

echo "✅ Paiement initié:"
echo $PAYMENT_SUCCESS | jq '.data'

wait_processing

echo ""
echo "📊 3. VÉRIFICATION STATUT"
echo "========================"

TRANSACTION_STATUS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
  "$BACKEND_URL/api/transactions/$TRANSACTION_ID")

echo "✅ Statut transaction:"
echo $TRANSACTION_STATUS | jq '.data | {id: .id, status: .status, amount: .amount}'

CAPTURE_OPERATION=$(echo $TRANSACTION_STATUS | jq -r '.data.operations[] | select(.type == "capture" and .status == "completed") | .id' | head -1)

if [ "$CAPTURE_OPERATION" != "null" ] && [ ! -z "$CAPTURE_OPERATION" ]; then
    echo "✅ Capture réussie trouvée: $CAPTURE_OPERATION"
    
    echo ""
    echo "💰 4. REMBOURSEMENT PARTIEL"
    echo "==========================="
    
    REFUND_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/transactions/$TRANSACTION_ID/refund" \
      -H "Content-Type: application/json" \
      -H "X-API-ID: $API_KEY" \
      -H "X-API-SECRET: $API_SECRET" \
      -d '{
        "amount": 50.00,
        "reason": "Test de remboursement automatisé"
      }')
    
    echo "✅ Remboursement initié:"
    echo $REFUND_RESPONSE | jq '.data'
    
    wait_processing
    
    echo ""
    echo "📊 5. STATUT FINAL"
    echo "================="
    
    FINAL_STATUS=$(curl -s -H "X-API-ID: $API_KEY" -H "X-API-SECRET: $API_SECRET" \
      "$BACKEND_URL/api/transactions/$TRANSACTION_ID")
    
    echo "✅ État final:"
    echo $FINAL_STATUS | jq '.data | {
      id: .id,
      status: .status,
      amount: .amount,
      operations: [.operations[] | {type: .type, status: .status, amount: .amount}]
    }'
    
    CAPTURE_COUNT=$(echo $FINAL_STATUS | jq '.data.operations[] | select(.type == "capture")' | jq -s 'length')
    REFUND_COUNT=$(echo $FINAL_STATUS | jq '.data.operations[] | select(.type == "refund")' | jq -s 'length')
    
    echo ""
    echo "📈 RÉSUMÉ:"
    echo "   Captures: $CAPTURE_COUNT"
    echo "   Refunds: $REFUND_COUNT"
    echo "   Transaction: $TRANSACTION_ID"
    
else
    echo "❌ Aucune capture réussie - skip du remboursement"
fi

echo ""
echo "🎉 Test de workflow de paiement terminé!"
```

### Exécution du Test
```bash
chmod +x test-payment-workflow.sh
./test-payment-workflow.sh
```

## 🔧 9. Test de Paiement Échoué

### Script pour Test d'Échec
```bash
#!/bin/bash
# test-payment-failure.sh

echo "❌ Test de Paiement Échoué"
echo "=========================="

# Utiliser une carte de test qui sera déclinée
PAYMENT_FAILED=$(curl -s -X POST "$BACKEND_URL/api/transactions/$TRANSACTION_ID/process" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$PAYMENT_TOKEN'",
    "payment_method": {
      "type": "card",
      "card_number": "4000000000000002",
      "cardholder_name": "Test Declined",
      "expiry_month": "12",
      "expiry_year": "2027",
      "cvv": "123"
    }
  }')

echo "❌ Réponse paiement échoué:"
echo $PAYMENT_FAILED | jq '.'
```

## ⚠️ Gestion des Erreurs

### Erreurs Communes
1. **Transaction non trouvée** : `404 - Transaction not found`
2. **Token invalide** : `400 - Invalid payment token`
3. **Transaction expirée** : `400 - Transaction expired`
4. **Montant invalide** : `400 - Invalid amount`
5. **Opération déjà traitée** : `409 - Transaction already processed`
6. **Remboursement impossible** : `400 - No capture found for refund`

### Codes d'Erreur PSP
- `CARD_DECLINED` : Carte refusée par la banque
- `INSUFFICIENT_FUNDS` : Fonds insuffisants
- `INVALID_CARD` : Numéro de carte invalide
- `EXPIRED_CARD` : Carte expirée
- `INVALID_CVV` : Code CVV incorrect

---

**➡️ Étape suivante** : [`04-psp-integration.md`](./04-psp-integration.md) - Détails de l'intégration PSP
