# 📚 Documentation Complète - Plateforme de Paiement

## 🌟 Vue d'ensemble

Cette documentation couvre tous les workflows complets de la plateforme de paiement, de l'inscription à la gestion des transactions.

## 📁 Structure de la Documentation

### 1. 🔐 Authentification et Gestion des Utilisateurs
- [`01-auth-workflow.md`](./01-auth-workflow.md) - Inscription, connexion, validation par email
- [`02-merchant-workflow.md`](./02-merchant-workflow.md) - Création et validation de marchands

### 2. 💳 Workflows de Paiement
- [`03-payment-workflow.md`](./03-payment-workflow.md) - Transaction complète (succès, échec, remboursement)
- [`04-psp-integration.md`](./04-psp-integration.md) - Intégration avec le PSP émulateur

### 3. 👨‍💼 Administration
- [`05-admin-workflow.md`](./05-admin-workflow.md) - Validation des marchands, gestion système

### 4. 🧪 Tests et Validation
- [`06-testing-guide.md`](./06-testing-guide.md) - Tests complets A à Z
- [`07-api-reference.md`](./07-api-reference.md) - Référence complète des APIs

## 🚀 Configuration Initiale

### Variables d'Environnement
```bash
# URLs des services
BACKEND_URL="http://localhost:3000"
PSP_URL="http://localhost:3002"
FRONTEND_URL="http://localhost:8080"

# Credentials de test
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"

# Merchant de test TechShop
MERCHANT_API_KEY="tech_shop_api_key_123456789abcdef"
MERCHANT_API_SECRET="tech_shop_secret_987654321fedcba"
```

### Démarrage des Services
```bash
cd /Users/zahidikays/Desktop/4AWD/S2/pec_2/pec/payment-platform
docker-compose up -d
```

## 🔄 Workflows Principaux

1. **🔐 Authentification** : Inscription → Validation Email → Connexion
2. **🏪 Marchand** : Demande → Validation Admin → Activation
3. **💳 Paiement** : Transaction → Traitement PSP → Webhook → Confirmation
4. **💰 Remboursement** : Demande → Validation → Traitement PSP → Notification

## 📊 Statuts et États

### Statuts Utilisateur
- `pending` : En attente de validation email
- `active` : Compte validé et actif
- `suspended` : Compte suspendu

### Statuts Marchand
- `pending` : En attente de validation admin
- `active` : Marchand validé et actif
- `suspended` : Marchand suspendu

### Statuts Transaction
- `pending` : Transaction créée, en attente de paiement
- `processing` : Paiement en cours de traitement
- `completed` : Transaction réussie
- `failed` : Transaction échouée
- `cancelled` : Transaction annulée

### Statuts Opération
- `pending` : Opération créée
- `processing` : En cours de traitement PSP
- `completed` : Opération réussie
- `failed` : Opération échouée

## 🛠️ Outils de Test

- [`test-workflow.sh`](../test-workflow.sh) - Test complet automatisé
- Scripts individuels dans chaque documentation
- Interface web de test à `http://localhost:8081`

---

**📞 Support** : Pour toute question, consultez les logs Docker ou les fichiers de documentation spécifiques.
