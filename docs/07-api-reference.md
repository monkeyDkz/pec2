# 📚 Référence Complète des APIs

## 📋 Vue d'ensemble

Cette référence documente tous les endpoints de l'API, leurs paramètres, réponses, et codes d'erreur.

## 🌐 URLs de Base

```bash
# Backend API
BACKEND_URL="http://localhost:3000"

# PSP Émulateur  
PSP_URL="http://localhost:3002"

# Frontend
FRONTEND_URL="http://localhost:8080"
```

## 🔐 Authentification

### Types d'Authentification

#### 1. JWT Bearer Token (Utilisateurs/Admin)
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. API Credentials (Marchands)
```http
X-API-ID: tech_shop_api_key_123456789abcdef
X-API-SECRET: tech_shop_secret_987654321fedcba
```

## 👤 Endpoints Authentification

### POST /api/auth/register
Inscription d'un nouvel utilisateur.

#### Paramètres
```json
{
  "email": "string (requis, email valide)",
  "password": "string (requis, min 8 caractères)",
  "first_name": "string (requis)",
  "last_name": "string (requis)",
  "phone": "string (optionnel)"
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "uuid",
    "email": "string",
    "status": "pending"
  }
}
```

#### Erreurs
- `400` - Email déjà existant
- `400` - Données invalides
- `500` - Erreur serveur

---

### POST /api/auth/login
Connexion utilisateur.

#### Paramètres
```json
{
  "email": "string (requis)",
  "password": "string (requis)"
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "status": "string"
    },
    "token": "jwt_string",
    "expires_in": 86400
  }
}
```

#### Erreurs
- `401` - Credentials invalides
- `403` - Compte non activé
- `400` - Données manquantes

---

### POST /api/auth/validate-email
Validation de l'email via token.

#### Paramètres
```json
{
  "token": "string (requis)"
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "Email validated successfully",
  "data": {
    "user_id": "uuid",
    "email": "string",
    "status": "active"
  }
}
```

---

### GET /api/auth/profile
Récupération du profil utilisateur.

#### Headers
```http
Authorization: Bearer <jwt_token>
```

#### Réponse 200
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "phone": "string",
      "status": "string",
      "created_at": "datetime"
    }
  }
}
```

## 🏪 Endpoints Marchands

### POST /api/merchants
Demande de création de marchand.

#### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Paramètres
```json
{
  "name": "string (requis)",
  "description": "string (requis)",
  "website_url": "string (requis, URL valide)",
  "business_type": "string (requis)",
  "company_name": "string (requis)",
  "company_address": "string (requis)",
  "company_phone": "string (requis)",
  "company_email": "string (requis, email valide)",
  "siret": "string (requis, 14 chiffres)",
  "webhook_url": "string (requis, URL valide)"
}
```

#### Réponse 201
```json
{
  "success": true,
  "message": "Merchant application submitted successfully",
  "data": {
    "merchant_id": "uuid",
    "name": "string",
    "status": "pending",
    "created_at": "datetime"
  }
}
```

---

### GET /api/merchants/profile
Profil du marchand authentifié.

#### Headers
```http
X-API-ID: <api_key>
X-API-SECRET: <api_secret>
```

#### Réponse 200
```json
{
  "success": true,
  "data": {
    "merchant": {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "website_url": "string",
      "business_type": "string",
      "status": "string",
      "webhook_url": "string",
      "created_at": "datetime",
      "validated_at": "datetime"
    }
  }
}
```

## 💳 Endpoints Transactions

### POST /api/transactions
Création d'une nouvelle transaction.

#### Headers
```http
X-API-ID: <api_key>
X-API-SECRET: <api_secret>
Content-Type: application/json
```

#### Paramètres
```json
{
  "order_id": "string (requis, unique)",
  "amount": "number (requis, > 0)",
  "currency": "string (requis, ISO 4217)",
  "customer_email": "string (requis, email valide)",
  "customer_first_name": "string (requis)",
  "customer_last_name": "string (requis)",
  "description": "string (requis)",
  "success_url": "string (requis, URL valide)",
  "cancel_url": "string (requis, URL valide)",
  "webhook_url": "string (optionnel, URL valide)",
  "billing_address": {
    "street": "string (requis)",
    "city": "string (requis)",
    "postal_code": "string (requis)",
    "country": "string (requis, code ISO 2)"
  },
  "shipping_address": {
    "street": "string (optionnel)",
    "city": "string (optionnel)",
    "postal_code": "string (optionnel)",
    "country": "string (optionnel)"
  },
  "metadata": "object (optionnel)"
}
```

#### Réponse 201
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction_id": "uuid",
    "payment_url": "string",
    "order_id": "string",
    "amount": "number",
    "currency": "string",
    "status": "pending",
    "expires_at": "datetime"
  }
}
```

#### Erreurs
- `400` - Données invalides
- `401` - Credentials invalides
- `403` - Marchand non actif
- `409` - Order ID déjà existant

---

### GET /api/transactions
Liste des transactions du marchand.

#### Headers
```http
X-API-ID: <api_key>
X-API-SECRET: <api_secret>
```

#### Paramètres de Requête
```
?page=1                     # Numéro de page (défaut: 1)
&limit=10                   # Éléments par page (défaut: 10, max: 100)
&status=completed           # Filtrer par statut
&order_id=ORDER_123         # Filtrer par order_id
&customer_email=test@       # Filtrer par email client
&start_date=2025-07-01      # Date de début (YYYY-MM-DD)
&end_date=2025-07-31        # Date de fin (YYYY-MM-DD)
&min_amount=10.00           # Montant minimum
&max_amount=1000.00         # Montant maximum
&sort=created_at            # Tri (created_at, amount, status)
&order=desc                 # Ordre (asc, desc)
```

#### Réponse 200
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "order_id": "string",
        "amount": "number",
        "currency": "string",
        "status": "string",
        "customer_email": "string",
        "customer_first_name": "string",
        "customer_last_name": "string",
        "description": "string",
        "created_at": "datetime",
        "paid_at": "datetime",
        "operations": [
          {
            "id": "uuid",
            "type": "string",
            "amount": "number",
            "status": "string",
            "psp_reference": "string",
            "created_at": "datetime"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

### GET /api/transactions/{transaction_id}
Détail d'une transaction spécifique.

#### Headers
```http
X-API-ID: <api_key>
X-API-SECRET: <api_secret>
```

#### Réponse 200
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_id": "string",
    "amount": "number",
    "currency": "string",
    "status": "string",
    "customer_email": "string",
    "customer_first_name": "string",
    "customer_last_name": "string",
    "billing_address": "object",
    "shipping_address": "object",
    "description": "string",
    "success_url": "string",
    "cancel_url": "string",
    "webhook_url": "string",
    "payment_token": "string",
    "metadata": "object",
    "created_at": "datetime",
    "paid_at": "datetime",
    "expires_at": "datetime",
    "operations": [
      {
        "id": "uuid",
        "type": "capture|refund",
        "amount": "number",
        "currency": "string",
        "status": "pending|processing|completed|failed",
        "psp_reference": "string",
        "psp_transaction_id": "string",
        "error_message": "string",
        "error_code": "string",
        "refund_reason": "string",
        "parent_operation_id": "uuid",
        "metadata": "object",
        "submitted_to_psp_at": "datetime",
        "processed_at": "datetime",
        "created_at": "datetime"
      }
    ]
  }
}
```

#### Erreurs
- `404` - Transaction non trouvée
- `403` - Accès non autorisé

---

### POST /api/transactions/{transaction_id}/process
Traitement du paiement.

#### Headers
```http
Content-Type: application/json
```

#### Paramètres
```json
{
  "token": "string (requis)",
  "payment_method": {
    "type": "card",
    "card_number": "string (requis, 13-19 chiffres)",
    "cardholder_name": "string (requis)",
    "expiry_month": "string (requis, 01-12)",
    "expiry_year": "string (requis, YYYY)",
    "cvv": "string (requis, 3-4 chiffres)"
  }
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "Payment processing initiated",
  "data": {
    "operation_id": "uuid",
    "psp_reference": "string",
    "status": "processing",
    "message": "Payment sent to PSP for processing"
  }
}
```

#### Erreurs
- `400` - Token invalide ou données manquantes
- `400` - Transaction expirée
- `409` - Transaction déjà traitée
- `422` - Données de carte invalides

---

### POST /api/transactions/{transaction_id}/refund
Demande de remboursement.

#### Headers
```http
X-API-ID: <api_key>
X-API-SECRET: <api_secret>
Content-Type: application/json
```

#### Paramètres
```json
{
  "amount": "number (optionnel, remboursement partiel)",
  "reason": "string (requis)",
  "refund_method": "original_payment|bank_transfer (optionnel)"
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "Refund processing initiated",
  "data": {
    "refund_id": "uuid",
    "operation_id": "uuid",
    "amount": "number",
    "currency": "string",
    "status": "processing",
    "psp_reference": "string"
  }
}
```

#### Erreurs
- `400` - Aucune capture trouvée
- `400` - Montant supérieur au disponible
- `409` - Remboursement déjà en cours

## 👨‍💼 Endpoints Administration

### GET /api/admin/dashboard
Tableau de bord administrateur.

#### Headers
```http
Authorization: Bearer <admin_jwt_token>
```

#### Réponse 200
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_merchants": "number",
      "active_merchants": "number",
      "pending_merchants": "number",
      "total_users": "number",
      "active_users": "number"
    },
    "transactions": {
      "today": {
        "count": "number",
        "volume": "number",
        "success_rate": "number"
      },
      "this_month": {
        "count": "number",
        "volume": "number",
        "success_rate": "number"
      }
    },
    "top_merchants": [
      {
        "id": "uuid",
        "name": "string",
        "transaction_count": "number",
        "total_volume": "number"
      }
    ]
  }
}
```

---

### GET /api/admin/merchants
Liste des marchands (admin).

#### Headers
```http
Authorization: Bearer <admin_jwt_token>
```

#### Paramètres de Requête
```
?status=pending|active|suspended|rejected
&page=1
&limit=10
&search=nom_marchand
```

#### Réponse 200
```json
{
  "success": true,
  "data": {
    "merchants": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "website_url": "string",
        "business_type": "string",
        "company_name": "string",
        "status": "string",
        "created_at": "datetime",
        "validated_at": "datetime",
        "created_by": "uuid"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

### PUT /api/admin/merchants/{merchant_id}/validate
Validation d'un marchand.

#### Headers
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

#### Paramètres
```json
{
  "validation_notes": "string (optionnel)"
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "Merchant validated successfully",
  "data": {
    "merchant_id": "uuid",
    "name": "string",
    "status": "active",
    "api_key": "string",
    "api_secret": "string",
    "validated_at": "datetime",
    "validated_by": "uuid"
  }
}
```

---

### PUT /api/admin/merchants/{merchant_id}/reject
Refus d'un marchand.

#### Headers
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

#### Paramètres
```json
{
  "rejection_reason": "string (requis)"
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "Merchant rejected successfully",
  "data": {
    "merchant_id": "uuid",
    "status": "rejected",
    "rejection_reason": "string",
    "rejected_at": "datetime",
    "rejected_by": "uuid"
  }
}
```

---

### GET /api/admin/transactions
Toutes les transactions (admin).

#### Headers
```http
Authorization: Bearer <admin_jwt_token>
```

#### Paramètres de Requête
```
?status=completed|failed|pending|processing
&merchant_id=uuid
&start_date=2025-07-01
&end_date=2025-07-31
&min_amount=100.00
&max_amount=10000.00
&page=1
&limit=50
```

#### Réponse 200
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "order_id": "string",
        "amount": "number",
        "currency": "string",
        "status": "string",
        "customer_email": "string",
        "created_at": "datetime",
        "merchant": {
          "id": "uuid",
          "name": "string"
        },
        "operations": [
          {
            "type": "string",
            "status": "string",
            "amount": "number"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "pages": 20
    }
  }
}
```

## 🔔 Endpoints Webhooks

### POST /api/webhooks/psp-notification
Réception des notifications PSP.

#### Headers
```http
Content-Type: application/json
```

#### Paramètres (envoyés par le PSP)
```json
{
  "webhook_id": "string",
  "operation_id": "uuid",
  "psp_reference": "string",
  "psp_transaction_id": "string",
  "status": "success|failed|pending|cancelled",
  "amount": "number",
  "currency": "string",
  "processing_time": "string",
  "timestamp": "datetime",
  "details": {
    "authorization_code": "string",
    "card_last_four": "string",
    "card_brand": "string",
    "error_code": "string",
    "error_message": "string"
  }
}
```

#### Réponse 200
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## 🔧 Endpoints PSP (Émulateur)

### GET /api/payment/health
Santé du service PSP.

#### Réponse 200
```json
{
  "service": "PSP Emulator",
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "datetime"
}
```

---

### POST /api/payment/process
Traitement de paiement PSP.

#### Paramètres
```json
{
  "operation_id": "uuid",
  "transaction_id": "uuid",
  "amount": "number",
  "currency": "string",
  "payment_method": {
    "type": "card",
    "card_number": "string",
    "card_holder": "string",
    "card_expiry": "string",
    "card_cvv": "string"
  },
  "callback_url": "string"
}
```

#### Réponse 200
```json
{
  "success": true,
  "psp_reference": "string",
  "operation_id": "uuid",
  "status": "processing",
  "message": "Payment processing initiated",
  "estimated_completion": "datetime"
}
```

---

### GET /api/webhook/history
Historique des webhooks PSP.

#### Paramètres de Requête
```
?limit=10
&operation_id=uuid
```

#### Réponse 200
```json
{
  "total": "number",
  "history": [
    {
      "operation_id": "uuid",
      "status": "success|failed",
      "sent_at": "datetime",
      "webhook_id": "string",
      "response_status": "number"
    }
  ]
}
```

## 📊 Codes de Statut

### Statuts de Transaction
- `pending` - Transaction créée, en attente de paiement
- `processing` - Paiement en cours de traitement
- `completed` - Transaction réussie et finalisée
- `failed` - Transaction échouée
- `cancelled` - Transaction annulée
- `expired` - Transaction expirée

### Statuts d'Opération
- `pending` - Opération créée
- `processing` - En cours de traitement PSP
- `completed` - Opération réussie
- `failed` - Opération échouée
- `cancelled` - Opération annulée

### Statuts de Marchand
- `pending` - En attente de validation
- `active` - Marchand validé et actif
- `suspended` - Marchand suspendu
- `rejected` - Demande refusée

### Statuts d'Utilisateur
- `pending` - En attente de validation email
- `active` - Compte validé et actif
- `suspended` - Compte suspendu

## ⚠️ Codes d'Erreur

### Codes HTTP Standard
- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Accès interdit
- `404` - Ressource non trouvée
- `409` - Conflit (ressource déjà existante)
- `422` - Données non traitables
- `500` - Erreur serveur interne

### Codes d'Erreur Personnalisés

#### Authentification
- `AUTH_001` - Token invalide ou expiré
- `AUTH_002` - Credentials API invalides
- `AUTH_003` - Compte non activé
- `AUTH_004` - Permissions insuffisantes

#### Transactions
- `TXN_001` - Transaction non trouvée
- `TXN_002` - Transaction expirée
- `TXN_003` - Transaction déjà traitée
- `TXN_004` - Montant invalide
- `TXN_005` - Devise non supportée

#### Paiements
- `PAY_001` - Carte déclinée
- `PAY_002` - Fonds insuffisants
- `PAY_003` - Carte expirée
- `PAY_004` - CVV invalide
- `PAY_005` - Limite dépassée

#### Marchands
- `MER_001` - Marchand non trouvé
- `MER_002` - Marchand non actif
- `MER_003` - SIRET invalide
- `MER_004` - Demande déjà existante

## 🔗 Liens Utiles

- **Postman Collection** : [À créer] - Collection des endpoints
- **OpenAPI Spec** : [À créer] - Spécification OpenAPI 3.0
- **SDK JavaScript** : [À créer] - SDK pour intégration frontend
- **Webhooks Guide** : [À créer] - Guide d'implémentation des webhooks

---

**🎯 Documentation complète** : Tous les endpoints et workflows sont maintenant documentés pour faciliter l'intégration et les tests.
