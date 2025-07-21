# ENDPOINTS BACKEND MANQUANTS CRITIQUES

## 🏪 DASHBOARD MARCHAND (URGENT)
```javascript
GET    /api/merchants/dashboard          // Stats personnalisées marchand
GET    /api/merchants/transactions       // Liste transactions du marchand
POST   /api/merchants/transactions/:id/refund  // Remboursement côté marchand
GET    /api/merchants/credentials        // Voir credentials actuels
POST   /api/merchants/credentials/regenerate   // Régénérer APP_ID/APP_SECRET
```

## 📊 ADMINISTRATION AVANCÉE
```javascript
GET    /api/admin/dashboard/kpis         // KPIs et graphiques
GET    /api/admin/transactions/search    // Recherche avancée
POST   /api/admin/impersonate/:merchantId // Impersonation marchand
GET    /api/admin/merchants/:id/stats    // Stats d'un marchand spécifique
```

## 🔄 TEMPS RÉEL (WebSockets)
```javascript
WS     /ws/transactions                  // WebSocket transactions
WS     /ws/merchant/:id                  // WebSocket spécifique marchand
WS     /ws/admin                         // WebSocket administration
```

## 💸 REMBOURSEMENTS AVANCÉS
```javascript
GET    /api/transactions/:id/refunds     // Liste remboursements d'une transaction
POST   /api/transactions/:id/partial-refund  // Remboursement partiel
GET    /api/merchants/refunds            // Historique remboursements marchand
```

## 📈 ANALYTICS ET REPORTING
```javascript
GET    /api/merchants/analytics          // Analytics marchand
GET    /api/admin/reports                // Rapports administrateur
GET    /api/merchants/conversion-rate    // Taux de conversion
```
