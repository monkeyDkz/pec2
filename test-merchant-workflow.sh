#!/bin/bash

echo "🛍️ Test Complet du Site Marchand"
echo "=================================="

# Configuration
MERCHANT_URL="http://localhost:8081"
BACKEND_URL="http://localhost:3000"
PSP_URL="http://localhost:4000"

echo "📍 URLs de test:"
echo "   - Site Marchand: $MERCHANT_URL"
echo "   - Backend API: $BACKEND_URL"
echo "   - PSP Emulator: $PSP_URL"
echo ""

# Vérification que Docker est lancé
echo "🐳 Vérification des conteneurs Docker..."
if ! docker ps | grep -q "payment_merchant"; then
    echo "❌ Le conteneur test-merchant n'est pas en cours d'exécution"
    echo "💡 Lancez: docker-compose up -d"
    exit 1
fi

if ! docker ps | grep -q "payment_backend"; then
    echo "❌ Le conteneur backend n'est pas en cours d'exécution"
    echo "💡 Lancez: docker-compose up -d"
    exit 1
fi

if ! docker ps | grep -q "payment_psp"; then
    echo "❌ Le conteneur PSP emulator n'est pas en cours d'exécution"
    echo "💡 Lancez: docker-compose up -d"
    exit 1
fi

echo "✅ Tous les conteneurs Docker sont en cours d'exécution"
echo ""

# Test de connectivité
echo "🔍 Test de connectivité des services..."

# Test Site Marchand
echo "1️⃣ Test du site marchand..."
if curl -s -f "$MERCHANT_URL" > /dev/null; then
    echo "   ✅ Site marchand accessible"
else
    echo "   ❌ Site marchand non accessible"
fi

# Test Backend
echo "2️⃣ Test du backend API..."
if curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    echo "   ✅ Backend API accessible"
else
    echo "   ❌ Backend API non accessible"
fi

# Test PSP
echo "3️⃣ Test du PSP emulator..."
if curl -s -f "$PSP_URL/health" > /dev/null; then
    echo "   ✅ PSP Emulator accessible"
else
    echo "   ❌ PSP Emulator non accessible"
fi

echo ""

# Simulation d'un workflow complet
echo "🧪 Simulation d'un workflow de paiement complet..."
echo ""

echo "4️⃣ Test de création de transaction via l'API..."
TRANSACTION_DATA='{
  "amount": 99.99,
  "currency": "EUR",
  "description": "Test transaction depuis script",
  "merchantId": "test-merchant-123",
  "metadata": {
    "orderId": "TEST_ORDER_'$(date +%s)'",
    "source": "test_script"
  }
}'

TRANSACTION_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -H "X-Merchant-ID: test-merchant-123" \
  -H "X-API-Key: test-api-key-123" \
  -d "$TRANSACTION_DATA" 2>/dev/null)

if echo "$TRANSACTION_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "   ✅ Transaction créée avec succès"
    TRANSACTION_ID=$(echo "$TRANSACTION_RESPONSE" | jq -r '.data.id')
    echo "   📋 ID de transaction: $TRANSACTION_ID"
else
    echo "   ❌ Erreur lors de la création de la transaction"
    echo "   📄 Réponse: $TRANSACTION_RESPONSE"
fi

echo ""

# Instructions pour l'utilisateur
echo "🎯 Tests manuels recommandés:"
echo ""
echo "1. 🌐 Ouvrez votre navigateur sur: $MERCHANT_URL"
echo "2. ⚙️ Allez dans Configuration et vérifiez/configurez les credentials:"
echo "   - Backend URL: http://backend:3000"
echo "   - PSP URL: http://psp-emulator:4000"
echo "   - Merchant ID: test-merchant-123"
echo "   - API Key: test-api-key-123"
echo ""
echo "3. 🛒 Testez la boutique:"
echo "   - Ajoutez des produits au panier"
echo "   - Testez un paiement standard"
echo "   - Testez une pré-autorisation"
echo "   - Testez un échec de paiement"
echo ""
echo "4. 💰 Testez la gestion des transactions:"
echo "   - Visualisez les transactions"
echo "   - Capturez une pré-autorisation"
echo "   - Effectuez un remboursement"
echo ""

# Logs utiles
echo "📋 Commandes utiles pour le debug:"
echo ""
echo "# Voir les logs du site marchand:"
echo "docker logs payment_merchant"
echo ""
echo "# Voir les logs du backend:"
echo "docker logs payment_backend"
echo ""
echo "# Voir les logs du PSP:"
echo "docker logs payment_psp"
echo ""
echo "# Redémarrer tous les services:"
echo "docker-compose restart"
echo ""

echo "🎉 Script de test terminé !"
echo "📖 Consultez la documentation dans /docs/ pour plus de détails"
