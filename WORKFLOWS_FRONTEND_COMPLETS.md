# 🔄 WORKFLOWS COMPLETS - FRONTEND VERS BACKEND

## 📋 STRUCTURE DU WORKFLOW UTILISATEUR

### **États de l'utilisateur :**
1. **Non inscrit** → Page d'inscription
2. **Inscrit non vérifié** → Vérification email
3. **Vérifié + Connecté** → Dashboard utilisateur (choix)
4. **Membre d'un marchand** → Dashboard marchand
5. **Admin** → Dashboard admin

---

## 🔑 **WORKFLOW 1 : INSCRIPTION → VÉRIFICATION → CONNEXION**

### **1.1 - Inscription (Publique)**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "MonMotDePasse123!",
  "first_name": "Nouveau",
  "last_name": "Utilisateur"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Inscription réussie ! Vérifiez votre email pour activer votre compte.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "first_name": "Nouveau",
      "last_name": "Utilisateur",
      "role": "merchant",
      "is_verified": false
    },
    "emailSent": true
  }
}
```

### **1.2 - Vérification Email (Publique)**
```http
POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "token": "{{token_from_email}}"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Email vérifié avec succès ! Votre compte est maintenant actif.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "first_name": "Nouveau",
      "last_name": "Utilisateur",
      "role": "merchant",
      "is_verified": true
    },
    "token": "jwt_token_here",
    "expiresIn": "24h"
  }
}
```

### **1.3 - Connexion (Publique)**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "MonMotDePasse123!"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "first_name": "Nouveau",
      "last_name": "Utilisateur",
      "role": "merchant",
      "is_verified": true
    },
    "token": "jwt_token_here",
    "expiresIn": "24h"
  }
}
```

---

## 🏪 **WORKFLOW 2 : DASHBOARD UTILISATEUR (NOUVEAU)**

### **2.1 - Vérifier les marchands disponibles**
```http
GET http://localhost:3000/api/merchants/available?page=1&limit=20
Authorization: Bearer {{jwt_token}}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "merchants": [
      {
        "id": "merchant-uuid-1",
        "name": "E-Shop Pro",
        "description": "Boutique en ligne spécialisée",
        "website_url": "https://eshop-pro.com",
        "business_type": "e-commerce",
        "created_at": "2024-01-15T10:00:00Z"
      },
      {
        "id": "merchant-uuid-2", 
        "name": "Restaurant Le Gourmet",
        "description": "Restaurant gastronomique",
        "website_url": "https://restaurant-gourmet.fr",
        "business_type": "restaurant",
        "created_at": "2024-01-20T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### **2.2 - Vérifier mes demandes en cours**
```http
GET http://localhost:3000/api/merchants/my-requests
Authorization: Bearer {{jwt_token}}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "request-uuid-1",
        "type": "create_merchant",
        "status": "pending",
        "merchant_name": "Ma Nouvelle Boutique",
        "justification": "Je veux créer ma boutique en ligne",
        "admin_notes": null,
        "created_at": "2024-01-25T09:00:00Z"
      }
    ]
  }
}
```

### **2.3 - Vérifier mes marchands (où je suis membre)**
```http
GET http://localhost:3000/api/merchants
Authorization: Bearer {{jwt_token}}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "merchants": [
      {
        "id": "merchant-uuid-3",
        "name": "Mon Commerce",
        "role": "admin",
        "status": "active",
        "api_key": "pk_live_xxxxx",
        "created_at": "2024-01-10T16:00:00Z"
      }
    ]
  }
}
```

---

## 🆕 **WORKFLOW 3 : CRÉER UN NOUVEAU MARCHAND**

### **3.1 - Demande de création**
```http
POST http://localhost:3000/api/merchants/create-request
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "merchantName": "Ma Nouvelle Boutique",
  "websiteUrl": "https://ma-boutique.com",
  "businessType": "e-commerce",
  "companyName": "Ma Boutique SARL",
  "companyAddress": "123 Rue du Commerce, 75001 Paris",
  "companyPhone": "+33123456789",
  "companyEmail": "contact@ma-boutique.com",
  "siret": "12345678901234",
  "description": "Boutique en ligne de vêtements artisanaux",
  "justification": "Je souhaite créer ma propre boutique en ligne pour vendre mes créations artisanales."
}
```

**Champs requis pour le frontend :**
- `merchantName` (string, requis) - Nom du marchand
- `websiteUrl` (string, requis) - URL du site web
- `businessType` (string) - Type d'activité : 'e-commerce', 'restaurant', 'service', 'other'
- `companyName` (string, requis) - Nom de l'entreprise
- `companyAddress` (string, requis) - Adresse de l'entreprise
- `companyPhone` (string) - Téléphone de l'entreprise
- `companyEmail` (string, requis) - Email de l'entreprise
- `siret` (string) - Numéro SIRET
- `description` (string) - Description de l'activité
- `justification` (string, requis) - Justification de la demande

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Demande de création de marchand soumise avec succès",
  "data": {
    "request": {
      "id": "request-uuid",
      "type": "create_merchant",
      "status": "pending",
      "merchant_name": "Ma Nouvelle Boutique",
      "created_at": "2024-01-25T10:00:00Z"
    }
  }
}
```

---

## 🤝 **WORKFLOW 4 : REJOINDRE UN MARCHAND EXISTANT**

### **4.1 - Demande pour rejoindre**
```http
POST http://localhost:3000/api/merchants/join-request
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "merchantId": "merchant-uuid-1",
  "requestedRole": "developer",
  "justification": "Je suis développeur spécialisé en e-commerce et je souhaite rejoindre votre équipe pour développer vos solutions de paiement."
}
```

**Champs requis pour le frontend :**
- `merchantId` (string, requis) - UUID du marchand à rejoindre
- `requestedRole` (string, requis) - Rôle demandé : 'developer', 'manager', 'support'
- `justification` (string, requis) - Justification de la demande

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Demande pour rejoindre le marchand soumise avec succès",
  "data": {
    "request": {
      "id": "request-uuid",
      "type": "join_merchant",
      "status": "pending",
      "merchant_id": "merchant-uuid-1",
      "requested_role": "developer",
      "created_at": "2024-01-25T11:00:00Z"
    }
  }
}
```

---

## 👑 **WORKFLOW 5 : ADMINISTRATION (ADMIN SEULEMENT)**

### **5.1 - Voir toutes les demandes**
```http
GET http://localhost:3000/api/admin/merchant-requests?status=pending&page=1&limit=20
Authorization: Bearer {{admin_jwt_token}}
```

**Filtres disponibles :**
- `status` : 'pending', 'approved', 'rejected'
- `type` : 'create_merchant', 'join_merchant'
- `page` : numéro de page
- `limit` : nombre par page

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "request-uuid-1",
        "type": "create_merchant",
        "status": "pending",
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "first_name": "Jean",
          "last_name": "Dupont"
        },
        "merchant_name": "Ma Nouvelle Boutique",
        "website_url": "https://ma-boutique.com",
        "business_type": "e-commerce",
        "justification": "Je veux créer ma boutique",
        "created_at": "2024-01-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### **5.2 - Approuver une demande**
```http
POST http://localhost:3000/api/admin/merchant-requests/{{request_id}}/approve
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "adminNotes": "Demande approuvée après vérification des documents"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Demande approuvée avec succès",
  "data": {
    "request": {
      "id": "request-uuid",
      "status": "approved",
      "admin_notes": "Demande approuvée après vérification des documents"
    },
    "merchant": {
      "id": "new-merchant-uuid",
      "name": "Ma Nouvelle Boutique",
      "api_key": "pk_live_xxxxx",
      "api_secret": "sk_live_xxxxx"
    }
  }
}
```

### **5.3 - Rejeter une demande**
```http
POST http://localhost:3000/api/admin/merchant-requests/{{request_id}}/reject
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "adminNotes": "Documents insuffisants, veuillez fournir le SIRET valide"
}
```

---

## 🏪 **WORKFLOW 6 : DASHBOARD MARCHAND (MEMBRE)**

### **6.1 - Dashboard principal**
```http
GET http://localhost:3000/api/merchants/dashboard
Authorization: Bearer {{jwt_token}}
```

### **6.2 - Détails d'un marchand spécifique**
```http
GET http://localhost:3000/api/merchants/{{merchant_id}}/details
Authorization: Bearer {{jwt_token}}
```

### **6.3 - Credentials API**
```http
GET http://localhost:3000/api/merchants/{{merchant_id}}/credentials
Authorization: Bearer {{jwt_token}}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "merchant": {
      "id": "merchant-uuid",
      "name": "Mon Commerce",
      "api_key": "pk_live_xxxxx",
      "api_secret": "sk_live_xxxxx",
      "webhook_url": "https://monsite.com/webhook",
      "status": "active"
    }
  }
}
```

---

## 📊 **COMPOSANTS FRONTEND NÉCESSAIRES**

### **Pages à créer :**
1. **Register.vue** - Inscription
2. **VerifyEmail.vue** - Vérification email
3. **Login.vue** - Connexion
4. **UserDashboard.vue** - Dashboard utilisateur (choix)
5. **MerchantSelection.vue** - Liste marchands disponibles
6. **CreateMerchantRequest.vue** - Formulaire création marchand
7. **JoinMerchantRequest.vue** - Formulaire rejoindre marchand
8. **MerchantDashboard.vue** - Dashboard marchand
9. **AdminDashboard.vue** - Dashboard admin
10. **AdminRequests.vue** - Gestion demandes admin

### **Services API à créer :**
```javascript
// authService.js
export const authService = {
  register(userData),
  verifyEmail(token),
  login(credentials),
  getProfile()
}

// merchantService.js
export const merchantService = {
  getAvailableMerchants(params),
  getMyRequests(),
  getMyMerchants(),
  createMerchantRequest(data),
  joinMerchantRequest(data),
  getMerchantDetails(id),
  getMerchantCredentials(id)
}

// adminService.js
export const adminService = {
  getMerchantRequests(params),
  approveMerchantRequest(id, notes),
  rejectMerchantRequest(id, notes)
}
```

### **Routes manquantes identifiées :**
❌ **AUCUNE ROUTE MANQUANTE** - Toutes les routes nécessaires sont disponibles dans le backend !

---

## 🎯 **ÉTAT DES ROUTES - VALIDATION COMPLÈTE**

### ✅ **Routes d'authentification :** COMPLET
- Inscription ✅
- Vérification email ✅
- Connexion ✅
- Profil utilisateur ✅

### ✅ **Routes marchands :** COMPLET
- Marchands disponibles ✅
- Mes demandes ✅
- Mes marchands ✅
- Créer demande marchand ✅
- Rejoindre marchand ✅
- Dashboard marchand ✅
- Credentials ✅

### ✅ **Routes admin :** COMPLET
- Liste demandes ✅
- Approuver demande ✅
- Rejeter demande ✅
- Dashboard admin ✅

**🚀 BACKEND COMPLET - PRÊT POUR DÉVELOPPEMENT FRONTEND !**

---

## 📱 **INTERFACE UTILISATEUR - FLUX**

```
📧 INSCRIPTION → 📬 EMAIL → ✅ VÉRIFICATION → 🔑 CONNEXION
                                                    ↓
                                         🏠 DASHBOARD UTILISATEUR
                                                    ↓
                        ┌─────────────────────────┬─────────────────────────┐
                        ↓                         ↓                         ↓
                🤝 REJOINDRE MARCHAND     🆕 CRÉER MARCHAND        📊 MES MARCHANDS
                        ↓                         ↓                         ↓
                📝 FORMULAIRE DEMANDE     📋 FORMULAIRE CRÉATION    🏪 DASHBOARD MARCHAND
                        ↓                         ↓                         ↓
                ⏳ ATTENTE VALIDATION     ⏳ ATTENTE VALIDATION      💳 GESTION PAIEMENTS
                        ↓                         ↓
                👑 VALIDATION ADMIN       👑 VALIDATION ADMIN
                        ↓                         ↓
                ✅ ACCÈS MARCHAND         ✅ NOUVEAU MARCHAND CRÉÉ
```

**✅ TOUS LES WORKFLOWS DOCUMENTÉS ET PRÊTS POUR LE FRONTEND !**
