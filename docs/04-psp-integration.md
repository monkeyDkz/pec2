# 🔗 Intégration PSP - Émulateur de Fournisseur de Paiement

## 📋 Vue d'ensemble

Ce document détaille l'intégration avec le PSP (Payment Service Provider) émulateur, les webhooks, et la communication entre le backend et le PSP.

## 🏗️ Architecture PSP

### Services
- **Backend** : `http://backend:3000` (dans Docker) / `http://localhost:3000` (externe)
- **PSP Émulateur** : `http://psp-emulator:3002` (dans Docker) / `http://localhost:3002` (externe)

### Communication
```
Backend → PSP : Envoi des demandes de paiement/remboursement
PSP → Backend : Notifications via webhooks
```

## 🔧 Configuration PSP

### Variables d'Environnement
```bash
# Dans docker-compose.yml
PSP_URL=http://psp-emulator:3002
WEBHOOK_URL=http://backend:3000/api/webhooks/psp-notification

# Pour tests externes
PSP_URL=http://localhost:3002
WEBHOOK_URL=http://localhost:3000/api/webhooks/psp-notification
```

### Délais de Traitement
Le PSP émulateur simule des délais réalistes :
- **Mode normal** : 2-5 secondes
- **Mode rapide** : 1-2 secondes (pour tests)
- **Mode lent** : 5-10 secondes (simulation charge)

## 💳 1. Endpoint PSP - Traitement de Paiement

### URL PSP
```
POST http://localhost:3002/api/payment/process
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
  "operation_id": "op_550e8400-e29b-41d4-a716-446655440001",
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
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
}
```

### Exemple cURL Direct PSP
```bash
# ⚠️ En production, seul le backend doit appeler le PSP
# Ceci est pour debug uniquement

curl -X POST http://localhost:3002/api/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "operation_id": "debug_op_123",
    "transaction_id": "debug_txn_123",
    "amount": 99.99,
    "currency": "EUR",
    "payment_method": {
      "type": "card",
      "card_number": "4111111111111111",
      "card_holder": "Debug User",
      "card_expiry": "12/27",
      "card_cvv": "123"
    },
    "callback_url": "http://backend:3000/api/webhooks/psp-notification"
  }'
```

### Réponse PSP
```json
{
  "success": true,
  "psp_reference": "PSP_1234567890_ABC123",
  "operation_id": "op_550e8400-e29b-41d4-a716-446655440001",
  "status": "processing",
  "message": "Payment processing initiated",
  "estimated_completion": "2025-07-19T10:45:00Z"
}
```

## 💰 2. Endpoint PSP - Remboursement

### URL PSP
```
POST http://localhost:3002/api/payment/refund
```

### Body
```json
{
  "operation_id": "rf_550e8400-e29b-41d4-a716-446655440002",
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "capture_reference": "PSP_1234567890_ABC123",
  "refund_amount": 50.00,
  "currency": "EUR",
  "reason": "Retour produit",
  "callback_url": "http://backend:3000/api/webhooks/psp-notification"
}
```

### Exemple cURL Remboursement PSP
```bash
curl -X POST http://localhost:3002/api/payment/refund \
  -H "Content-Type: application/json" \
  -d '{
    "operation_id": "debug_refund_123",
    "transaction_id": "debug_txn_123",
    "capture_reference": "PSP_1234567890_ABC123",
    "refund_amount": 25.00,
    "currency": "EUR",
    "reason": "Test de remboursement debug",
    "callback_url": "http://backend:3000/api/webhooks/psp-notification"
  }'
```

## 🔔 3. Webhooks PSP → Backend

### Endpoint Backend pour Webhooks
```
POST http://localhost:3000/api/webhooks/psp-notification
```

### Structure du Webhook PSP
```json
{
  "webhook_id": "WH_1234567890_XYZ789",
  "operation_id": "op_550e8400-e29b-41d4-a716-446655440001",
  "psp_reference": "PSP_1234567890_ABC123",
  "psp_transaction_id": "TXN_9876543210",
  "status": "success",
  "amount": 149.99,
  "currency": "EUR",
  "processing_time": "2.3s",
  "timestamp": "2025-07-19T10:45:00Z",
  "details": {
    "authorization_code": "AUTH_123456",
    "card_last_four": "1111",
    "card_brand": "visa"
  }
}
```

### Types de Statuts Webhook
- `success` : Opération réussie
- `failed` : Opération échouée
- `pending` : En attente (rare)
- `cancelled` : Opération annulée

## 🧪 4. Tests Directs PSP

### Santé du PSP
```bash
curl http://localhost:3002/health
```

### API de Santé PSP
```bash
curl http://localhost:3002/api/payment/health
```

### Historique des Webhooks
```bash
curl http://localhost:3002/api/webhook/history?limit=10
```

Réponse :
```json
{
  "total": 5,
  "history": [
    {
      "operation_id": "op_123",
      "status": "success",
      "sent_at": "2025-07-19T10:45:00Z",
      "webhook_id": "WH_1234567890_XYZ789"
    }
  ]
}
```

## 🎯 5. Cartes de Test PSP

### Cartes Réussies
```json
{
  "card_number": "4111111111111111",  // Visa classique
  "card_number": "5555555555554444",  // Mastercard
  "card_number": "378282246310005"    // American Express
}
```

### Cartes d'Échec
```json
{
  "card_number": "4000000000000002",  // Carte déclinée
  "card_number": "4000000000000127",  // CVV incorrect
  "card_number": "4000000000000069",  // Carte expirée
  "card_number": "4000000000000119"   // Fonds insuffisants
}
```

### CVV et Dates
```json
{
  "cvv": "123",                       // CVV valide
  "cvv": "000",                       // CVV invalide
  "expiry": "12/27",                  // Date valide
  "expiry": "12/22"                   // Date expirée
}
```

## 🔍 6. Monitoring et Debug PSP

### Logs PSP en Temps Réel
```bash
docker logs -f payment_psp
```

### Logs Backend Webhooks
```bash
docker logs payment_backend | grep -i webhook
```

### Vérification Communication
```bash
# Test connectivité Backend → PSP
docker exec payment_backend curl -s http://psp-emulator:3002/health

# Test connectivité PSP → Backend
docker exec payment_psp curl -s http://backend:3000/health
```

## 🛠️ 7. Script de Test PSP Intégration

### Création du Script
```bash
#!/bin/bash
# test-psp-integration.sh

echo "🔗 Test d'Intégration PSP Complet"
echo "================================="

BACKEND_URL="http://localhost:3000"
PSP_URL="http://localhost:3002"

echo "🏥 1. SANTÉ DES SERVICES"
echo "======================="

echo "Backend:"
curl -s $BACKEND_URL/health | jq '.'

echo "PSP:"
curl -s $PSP_URL/health | jq '.'

echo "PSP Payment API:"
curl -s $PSP_URL/api/payment/health | jq '.'

echo ""
echo "📜 2. HISTORIQUE WEBHOOKS PSP"
echo "============================="

WEBHOOK_HISTORY=$(curl -s "$PSP_URL/api/webhook/history?limit=5")
echo $WEBHOOK_HISTORY | jq '.'

WEBHOOK_COUNT=$(echo $WEBHOOK_HISTORY | jq '.total // 0')
echo "📊 Total webhooks envoyés: $WEBHOOK_COUNT"

echo ""
echo "🧪 3. TEST PAIEMENT DIRECT PSP"
echo "=============================="

echo "⚠️  Test direct PSP (debug uniquement)"

DIRECT_PSP_TEST=$(curl -s -X POST $PSP_URL/api/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "operation_id": "debug_op_'$(date +%s)'",
    "transaction_id": "debug_txn_'$(date +%s)'",
    "amount": 19.99,
    "currency": "EUR",
    "payment_method": {
      "type": "card",
      "card_number": "4111111111111111",
      "card_holder": "Debug Test",
      "card_expiry": "12/27",
      "card_cvv": "123"
    },
    "callback_url": "http://backend:3000/api/webhooks/psp-notification"
  }')

echo "📤 Réponse PSP direct:"
echo $DIRECT_PSP_TEST | jq '.'

PSP_REF=$(echo $DIRECT_PSP_TEST | jq -r '.psp_reference')
echo "🔗 PSP Reference: $PSP_REF"

echo ""
echo "⏳ Attente traitement et webhook..."
sleep 3

echo ""
echo "📜 4. VÉRIFICATION WEBHOOK ENVOYÉ"
echo "================================="

UPDATED_HISTORY=$(curl -s "$PSP_URL/api/webhook/history?limit=1")
echo "📨 Dernier webhook:"
echo $UPDATED_HISTORY | jq '.history[0]'

echo ""
echo "🔗 5. TEST COMMUNICATION RÉSEAU"
echo "==============================="

echo "Backend → PSP:"
docker exec payment_backend curl -s http://psp-emulator:3002/health | jq -r '.service // "❌ Échec"'

echo "PSP → Backend:"
docker exec payment_psp curl -s http://backend:3000/health | jq -r '.message // "❌ Échec"'

echo ""
echo "🎯 Test d'intégration PSP terminé!"
```

### Exécution du Test
```bash
chmod +x test-psp-integration.sh
./test-psp-integration.sh
```

## 🔧 8. Configuration des Délais PSP

### Modification du Mode de Délai
```bash
# Mode rapide (pour tests)
echo '{"mode": "fast", "min_delay": 1000, "max_delay": 2000}' > /tmp/psp_delay_config.json
docker cp /tmp/psp_delay_config.json payment_psp:/app/config/delay.js

# Mode normal
echo '{"mode": "normal", "min_delay": 2000, "max_delay": 5000}' > /tmp/psp_delay_config.json
docker cp /tmp/psp_delay_config.json payment_psp:/app/config/delay.js

# Redémarrer le PSP pour appliquer
docker restart payment_psp
```

## ⚠️ 9. Résolution des Problèmes

### Erreurs Communes

#### 1. PSP Inaccessible
```bash
# Vérifier que le PSP est démarré
docker ps | grep psp

# Vérifier les logs
docker logs payment_psp

# Redémarrer si nécessaire
docker restart payment_psp
```

#### 2. Webhooks Non Reçus
```bash
# Vérifier la configuration réseau
docker network ls
docker network inspect payment-platform_default

# Vérifier l'URL de callback
docker logs payment_backend | grep "PSP_URL"
```

#### 3. Délais Trop Longs
```bash
# Consulter la configuration des délais
docker exec payment_psp cat /app/config/delay.js

# Passer en mode rapide
docker exec payment_psp sh -c 'echo "{\"mode\":\"fast\"}" > /app/config/delay.js'
docker restart payment_psp
```

### Debug Avancé
```bash
# Intercepter les requêtes PSP
docker exec payment_psp npm install -g tcpdump

# Monitorer le trafic réseau
docker exec payment_backend netstat -tulpn | grep 3002

# Vérifier les variables d'environnement
docker exec payment_backend env | grep PSP
```

## 📊 10. Métriques PSP

### Statistiques de Performance
```bash
curl http://localhost:3002/api/stats
```

Réponse :
```json
{
  "total_payments": 150,
  "successful_payments": 142,
  "failed_payments": 8,
  "total_refunds": 12,
  "average_processing_time": "2.3s",
  "uptime": "2h 15m",
  "webhook_success_rate": "98.5%"
}
```

---

**➡️ Étape suivante** : [`05-admin-workflow.md`](./05-admin-workflow.md) - Administration et validation
