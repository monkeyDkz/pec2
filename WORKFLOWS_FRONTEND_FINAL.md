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
  "first_name": "Test",
  "last_name": "User"
}
```

#### 🔹 **Vérification Email (après inscription)**
```http
POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "token": "{{verification_token_from_email}}"
}
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

#### 🔹 **Mes marchands (vérifier si utilisateur a des marchands)**
```http
GET http://localhost:3000/api/merchants
Authorization: Bearer {{jwt_token}}
```

#### 🔹 **Marchands disponibles pour rejoindre**
```http
GET http://localhost:3000/api/merchants/available?page=1&limit=20
Authorization: Bearer {{jwt_token}}
```

#### 🔹 **Mes demandes en cours**
```http
GET http://localhost:3000/api/merchants/my-requests
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
  "description": "Vente de produits artisanaux",
  "companyAddress": "123 Rue du Commerce, Paris",
  "companyEmail": "contact@ma-boutique.com",
  "companyPhone": "+33123456789",
  "siret": "12345678901234",
  "justification": "Je souhaite créer ma boutique en ligne"
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

#### 🔹 **Dashboard marchand (si membre)**
```http
GET http://localhost:3000/api/merchants/dashboard
Authorization: Bearer {{jwt_token}}
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

#### 🔹 **Rejeter demande**
```http
POST http://localhost:3000/api/admin/merchant-requests/{{request_id}}/reject
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "adminNotes": "Documents insuffisants"
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

## 🔗 WORKFLOW COMPLET UTILISATEUR

### **📝 ÉTAPE 1 : INSCRIPTION → VÉRIFICATION → CONNEXION**
```bash
# 1. Inscription
POST /api/auth/register
{
  "email": "nouveauuser@example.com",
  "password": "MonPass123!",
  "first_name": "Nouveau",
  "last_name": "Utilisateur"
}
# → Utilisateur reçoit email de vérification

# 2. Vérification email (OBLIGATOIRE)
POST /api/auth/verify-email
{
  "token": "token_from_email"
}
# → Compte validé + JWT token retourné

# 3. Connexion (ou utiliser JWT de la vérification)
POST /api/auth/login
{
  "email": "nouveauuser@example.com",
  "password": "MonPass123!"
}
# → JWT token pour futures requêtes
```

### **🏠 ÉTAPE 2 : DASHBOARD UTILISATEUR (PREMIER CHOIX)**

#### **Vérifier l'état de l'utilisateur :**
```bash
# Vérifier si l'utilisateur a déjà des marchands
GET /api/merchants
Authorization: Bearer {{jwt_token}}

# Si réponse vide → Afficher choix initial
# Si marchands présents → Rediriger vers dashboard marchand
```

#### **Si AUCUN marchand → Afficher 2 options :**

**Option A : Voir les marchands disponibles pour rejoindre**
```bash
GET /api/merchants/available
Authorization: Bearer {{jwt_token}}
# → Liste des marchands existants à rejoindre
```

**Option B : Créer un nouveau marchand**
```bash
# Afficher formulaire de création
# (Voir ÉTAPE 3 ou 4)
```

**Vérifier les demandes en cours :**
```bash
GET /api/merchants/my-requests
Authorization: Bearer {{jwt_token}}
# → Voir si l'utilisateur a des demandes pending
```

### **🤝 ÉTAPE 3 : REJOINDRE UN MARCHAND EXISTANT**
```bash
# 1. Lister les marchands disponibles
GET /api/merchants/available?page=1&limit=20
Authorization: Bearer {{jwt_token}}

# 2. Faire la demande pour rejoindre
POST /api/merchants/join-request
Authorization: Bearer {{jwt_token}}
{
  "merchantId": "uuid-du-marchand-choisi",
  "requestedRole": "developer", // ou "manager", "support"
  "justification": "Je souhaite rejoindre votre équipe car..."
}

# 3. Attendre validation admin (voir ÉTAPE 5)
```

### **🆕 ÉTAPE 4 : CRÉER UN NOUVEAU MARCHAND**
```bash
# Faire la demande de création
POST /api/merchants/create-request
Authorization: Bearer {{jwt_token}}
{
  "merchantName": "Ma Nouvelle Boutique",
  "websiteUrl": "https://ma-boutique.com",
  "businessType": "e-commerce", // ou "restaurant", "service", "other"
  "companyName": "Ma Boutique SARL",
  "companyAddress": "123 Rue du Commerce, 75001 Paris",
  "companyEmail": "contact@ma-boutique.com",
  "companyPhone": "+33123456789",
  "siret": "12345678901234",
  "description": "Description de mon activité",
  "justification": "Pourquoi je veux créer ce marchand"
}

# Attendre validation admin (voir ÉTAPE 5)
```

### **👑 ÉTAPE 5 : VALIDATION ADMIN**
```bash
# Admin voit toutes les demandes
GET /api/admin/merchant-requests?status=pending
Authorization: Bearer {{admin_jwt_token}}

# Admin approuve une demande
POST /api/admin/merchant-requests/{{request_id}}/approve
Authorization: Bearer {{admin_jwt_token}}
{
  "adminNotes": "Demande approuvée après vérification"
}

# OU Admin rejette une demande
POST /api/admin/merchant-requests/{{request_id}}/reject
Authorization: Bearer {{admin_jwt_token}}
{
  "adminNotes": "Documents insuffisants"
}
```

### **🏪 ÉTAPE 6 : DASHBOARD MARCHAND (MEMBRE VALIDÉ)**
```bash
# Une fois approuvé, l'utilisateur peut accéder au dashboard marchand
GET /api/merchants/dashboard
Authorization: Bearer {{jwt_token}}

# Voir ses marchands
GET /api/merchants
Authorization: Bearer {{jwt_token}}

# Voir détails d'un marchand spécifique
GET /api/merchants/{{merchant_id}}/details
Authorization: Bearer {{jwt_token}}

# Récupérer les clés API
GET /api/merchants/{{merchant_id}}/credentials
Authorization: Bearer {{jwt_token}}
```

---

## 🎯 LOGIQUE FRONTEND À IMPLÉMENTER

### **Après connexion/vérification :**
1. **Vérifier** `GET /api/merchants` 
   - Si **vide** → Afficher page choix (rejoindre OU créer)
   - Si **non vide** → Rediriger vers dashboard marchand

2. **Page de choix :**
   - Bouton "Rejoindre un marchand existant"
   - Bouton "Créer un nouveau marchand"
   - Afficher les demandes en cours si existantes

3. **Gestion des demandes :**
   - Vérifier régulièrement le statut des demandes
   - Notifier quand une demande est approuvée/rejetée

4. **Navigation conditionnelle :**
   - Utilisateur sans marchand → Page choix
   - Utilisateur avec marchand(s) → Dashboard marchand  
   - Admin → Dashboard admin

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

## 📱 FLUX UTILISATEUR COMPLET

```
📧 INSCRIPTION → 📬 EMAIL → ✅ VÉRIFICATION → 🔑 CONNEXION
                                                    ↓
                                         🏠 DASHBOARD UTILISATEUR
                                                    ↓
                                            [Vérifier marchands]
                                                    ↓
                         ┌─────────────────────────┬─────────────────────────┐
                         ↓ (Si AUCUN marchand)    ↓ (Si marchands existants)
                🤝 CHOIX : REJOINDRE OU CRÉER    🏪 DASHBOARD MARCHAND
                         ↓                         ↓
        ┌────────────────┴────────────────┐       💳 GESTION PAIEMENTS
        ↓                                 ↓       📊 TRANSACTIONS
🤝 REJOINDRE MARCHAND            🆕 CRÉER MARCHAND  🔑 CLÉS API
        ↓                                 ↓
📝 FORMULAIRE DEMANDE            📋 FORMULAIRE CRÉATION
        ↓                                 ↓
⏳ ATTENTE VALIDATION            ⏳ ATTENTE VALIDATION
        ↓                                 ↓
👑 ADMIN VALIDE/REJETTE          👑 ADMIN VALIDE/REJETTE
        ↓                                 ↓
✅ ACCÈS MARCHAND                ✅ NOUVEAU MARCHAND CRÉÉ
        ↓                                 ↓
🏪 DASHBOARD MARCHAND            🏪 DASHBOARD MARCHAND
```

---

**✅ BACKEND COMPLET - TOUTES LES ROUTES DOCUMENTÉES**  
**🚀 WORKFLOW UTILISATEUR ENTIÈREMENT DÉFINI**  
**📱 PRÊT POUR DÉVELOPPEMENT FRONTEND STEP BY STEP**
