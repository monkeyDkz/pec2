# 🏦 BACKEND API COMPLET - TOUTES LES ROUTES FONCTIONNELLES

## 🌐 ENVIRONNEMENT DOCKER

### **Variables d'environnement (.env)**
```env
# Serveur
APP_PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Base de données MySQL (Docker)
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=payment_root_password_2024
DB_NAME=payment_platform

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_2024

# Email (Resend)
RESEND_API_KEY=re_6MgbSiCi_JwR6PV91j9wGVh4mAH9RMEEu
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=kays.zahidi@gmail.com

# Redis (Docker)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# MongoDB (Docker)
MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_DB_NAME=payment_analytics
MONGODB_USER=admin
MONGODB_PASSWORD=mongo_admin_2024

# Services internes
PSP_URL=http://psp-emulator:3002
BACKEND_URL=http://backend:3000

# URLs frontend
VERIFICATION_URL=http://localhost:8080/verify-email
DASHBOARD_URL=http://localhost:8080/dashboard
```

### **Démarrage Docker**
```bash
# Démarrer tous les services
cd /Users/zahidikays/Desktop/4AWD/S2/pec_2/pec/payment-platform
docker-compose up -d

# Vérifier les services
docker-compose ps

# Voir les logs
docker-compose logs backend
```

---

## 👥 COMPTES DE TEST (Seeders)

### **Comptes utilisateurs disponibles:**
```javascript
// Admin
email: 'admin@payment-platform.com'
password: 'AdminPassword123!'
role: 'admin'

// Merchant 1
email: 'merchant1@example.com'
password: 'MerchantPass123!'
role: 'merchant'

// Merchant 2
email: 'merchant2@example.com'
password: 'MerchantPass123!'
role: 'merchant'

// Nouvel utilisateur
email: 'newuser@example.com'
password: 'UserPass123!'
role: 'merchant'
```

---

## 🔐 AUTHENTIFICATION - `/api/auth`

### **Base URL:** `http://localhost:3000/api/auth`

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/register` | Inscription utilisateur | Public |
| `POST` | `/login` | Connexion utilisateur | Public |
| `POST` | `/verify-email` | Validation email | Public |
| `POST` | `/resend-verification` | Renvoyer email validation | Public |
| `GET` | `/profile` | Profil utilisateur | JWT |
| `GET` | `/test` | Test routes auth | Public |

### **Exemples de requêtes:**

#### 🔹 **Inscription**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
}
```
```

#### 🔹 **Connexion**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@payment-platform.com",
  "password": "AdminPassword123!"
}
```

#### 🔹 **Profil (avec JWT)**

```http
GET http://localhost:3000/api/auth/profile
Authorization: Bearer {{jwt_token}}
```

---

## 🏪 MARCHANDS - `/api/merchants`

### **Base URL:** `http://localhost:3000/api/merchants`
### **Auth:** JWT Token requis pour toutes les routes

| Méthode | Route | Description | Permissions |
|---------|-------|-------------|-------------|
| `GET` | `/dashboard` | Dashboard marchand | Authentifié |
| `GET` | `/` | Mes marchands | Authentifié |
| `GET` | `/available` | Marchands disponibles | Authentifié |
| `POST` | `/request` | Demande marchand | Authentifié |
| `GET` | `/my-requests` | Mes demandes | Authentifié |
| `POST` | `/join-request` | Rejoindre marchand | Authentifié |
| `POST` | `/create-request` | Créer marchand | Authentifié |
| `GET` | `/:id/details` | Détails marchand | Membre |
| `GET` | `/:id/members` | Membres marchand | Manager+ |
| `PUT` | `/:id` | Modifier marchand | Manager+ |
| `POST` | `/:id/regenerate-keys` | Régénérer clés API | Admin |
| `GET` | `/:id/transactions` | Transactions marchand | Membre |
| `GET` | `/:id/credentials` | Credentials marchand | Membre |
| `POST` | `/:id/refund` | Créer remboursement | Manager+ |
| `GET` | `/:id/refunds` | Liste remboursements | Membre |
| `POST` | `/:id/regenerate-secret` | Nouveau secret | Admin |
| `POST` | `/:id/test-webhook` | Test webhook | Manager+ |

### **Exemples de requêtes:**

#### 🔹 **Dashboard marchand**
```http
GET http://localhost:3000/api/merchants/dashboard
Authorization: Bearer {{jwt_token}}
```

#### 🔹 **Demande création marchand**
```http
POST http://localhost:3000/api/merchants/create-request
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "merchantName": "Ma Boutique",
  "websiteUrl": "https://ma-boutique.com",
  "companyName": "Ma Boutique SARL",
  "businessType": "e-commerce",
  "description": "Vente de produits artisanaux"
}
```

#### 🔹 **Rejoindre un marchand**
```http
POST http://localhost:3000/api/merchants/join-request
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "merchantId": "uuid-du-marchand",
  "requestedRole": "developer",
  "justification": "Je souhaite rejoindre votre équipe"
}
```

---

## 👑 ADMINISTRATION - `/api/admin`

### **Base URL:** `http://localhost:3000/api/admin`
### **Auth:** JWT Token + Role Admin requis

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/merchant-requests` | Liste demandes marchands |
| `GET` | `/merchant-requests/:id` | Détail demande |
| `POST` | `/merchant-requests/:id/approve` | Approuver demande |
| `POST` | `/merchant-requests/:id/reject` | Rejeter demande |
| `GET` | `/merchants` | Liste marchands |
| `POST` | `/merchants/:id/suspend` | Suspendre marchand |
| `POST` | `/merchants/:id/activate` | Activer marchand |
| `POST` | `/merchants/:id/regenerate-keys` | Régénérer clés |
| `GET` | `/transactions` | Toutes transactions |
| `GET` | `/transactions/stats` | Stats transactions |
| `POST` | `/transactions/:id/refund` | Rembourser |
| `POST` | `/transactions/:id/force-complete` | Forcer validation |
| `GET` | `/stats` | Stats plateforme |
| `GET` | `/dashboard` | Dashboard admin |
| `POST` | `/impersonate/:userId` | Impersonnation |
| `GET` | `/settings` | Paramètres plateforme |
| `POST` | `/settings` | Sauver paramètres |

### **Exemples de requêtes:**

#### 🔹 **Liste demandes marchands**
```http
GET http://localhost:3000/api/admin/merchant-requests?status=pending
Authorization: Bearer {{admin_jwt_token}}
```

#### 🔹 **Approuver demande**
```http
POST http://localhost:3000/api/admin/merchant-requests/{{request_id}}/approve
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "adminNotes": "Demande approuvée après vérification"
}
```

#### 🔹 **Dashboard admin**
```http
GET http://localhost:3000/api/admin/dashboard
Authorization: Bearer {{admin_jwt_token}}
```

---

## 💳 TRANSACTIONS - `/api/transactions`

### **Base URL:** `http://localhost:3000/api/transactions`

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/` | Créer transaction | API Key |
| `GET` | `/:id` | Détail transaction | API Key |
| `GET` | `/` | Liste transactions | API Key |
| `POST` | `/:id/process` | Traiter paiement | Token |
| `POST` | `/:id/cancel` | Annuler transaction | Token |
| `POST` | `/:transaction_id/refund` | Remboursement | API Key |
| `GET` | `/:transaction_id/operations` | Liste opérations | API Key |
| `GET` | `/backoffice/list` | Liste (backoffice) | JWT |
| `GET` | `/backoffice/:id` | Détail (backoffice) | JWT |

### **Exemples de requêtes:**

#### 🔹 **Créer transaction (API Marchand)**
```http
POST http://localhost:3000/api/transactions
Authorization: Bearer {{api_key}}
Content-Type: application/json

{
  "order_id": "ORDER-123",
  "amount": 99.99,
  "currency": "EUR",
  "customer_email": "client@example.com",
  "description": "Achat produits",
  "return_url": "https://monsite.com/success",
  "cancel_url": "https://monsite.com/cancel",
  "metadata": {
    "product_id": "123",
    "quantity": 2
  }
}
```

#### 🔹 **Traiter paiement (Page paiement)**
```http
POST http://localhost:3000/api/transactions/{{transaction_id}}/process
Content-Type: application/json

{
  "token": "{{payment_token}}",
  "payment_method": {
    "type": "card",
    "card_number": "4242424242424242",
    "exp_month": "12",
    "exp_year": "2025",
    "cvc": "123",
    "cardholder_name": "John Doe"
  }
}
```

#### 🔹 **Remboursement**
```http
POST http://localhost:3000/api/transactions/{{transaction_id}}/refund
Authorization: Bearer {{api_key}}
Content-Type: application/json

{
  "amount": 50.00,
  "reason": "Produit défectueux",
  "metadata": {
    "support_ticket": "TICKET-456"
  }
}
```

---

## 🔄 WEBHOOKS - `/api/webhooks`

### **Base URL:** `http://localhost:3000/api/webhooks`

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/psp` | Notification PSP | Signature |
| `POST` | `/psp-notification` | Notification PSP (alt) | Signature |
| `GET` | `/` | Liste webhooks | API Key |
| `POST` | `/:id/retry` | Réessayer webhook | API Key |
| `GET` | `/stats/summary` | Stats webhooks | API Key |
| `GET` | `/backoffice/list` | Liste (backoffice) | JWT |
| `POST` | `/backoffice/retry-failed` | Réessayer échecs | Admin |

---

## 🔧 TESTS ET VALIDATION

### **Route de santé**
```http
GET http://localhost:3000/health
```

### **Test auth**
```http
GET http://localhost:3000/api/auth/test
```

### **Test merchant (avec JWT)**
```http
GET http://localhost:3000/api/merchants/test
Authorization: Bearer {{jwt_token}}
```

### **Test admin (avec JWT Admin)**
```http
GET http://localhost:3000/api/admin/test
Authorization: Bearer {{admin_jwt_token}}
```

---

## 🗄️ BASE DE DONNÉES

### **Commandes utiles:**
```bash
# Accéder au conteneur MySQL
docker exec -it payment_mysql mysql -u root -p

# Voir les tables
USE payment_platform;
SHOW TABLES;

# Voir les utilisateurs de test
SELECT id, email, role, is_verified FROM users;

# Voir les marchands
SELECT id, name, status, api_key FROM merchants;
```

---

## 🔗 WORKFLOW COMPLET

### **1. Inscription → Connexion**
```bash
# 1. Inscription
POST /api/auth/register

# 2. Validation email (optionnel en dev)
POST /api/auth/verify-email

# 3. Connexion
POST /api/auth/login
# → Récupérer le JWT token
```

### **2. Demande Marchand**
```bash
# 1. Créer demande
POST /api/merchants/create-request
Authorization: Bearer {{jwt_token}}

# 2. Admin approuve
POST /api/admin/merchant-requests/{{id}}/approve
Authorization: Bearer {{admin_jwt}}

# 3. Récupérer credentials
GET /api/merchants/{{merchant_id}}/credentials
Authorization: Bearer {{jwt_token}}
```

### **3. Transaction Complète**
```bash
# 1. Créer transaction (API marchand)
POST /api/transactions
Authorization: Bearer {{api_key}}

# 2. Traiter paiement (page publique)
POST /api/transactions/{{id}}/process

# 3. PSP notifie (automatique)
POST /api/webhooks/psp

# 4. Marchand reçoit webhook (automatique)
```

---

## 📋 COLLECTION POSTMAN

Importer cette collection pour tester toutes les routes :

```json
{
  "info": {
    "name": "Payment Platform API",
    "description": "Collection complète des routes backend"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "jwt_token",
      "value": ""
    },
    {
      "key": "admin_jwt_token", 
      "value": ""
    },
    {
      "key": "api_key",
      "value": ""
    }
  ]
}
```

**✅ TOUS LES ENDPOINTS DOCUMENTÉS ET TESTÉS**
**🚀 PROJET BACKEND COMPLET ET FONCTIONNEL**
