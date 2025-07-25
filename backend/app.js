const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🔄 Chargement des modules de base...');

require('dotenv').config();
console.log('✅ Variables d\'environnement chargées');

console.log('🔄 Tentative de connexion à la base de données...');
const { sequelize } = require('./config/database');
console.log('✅ Module database chargé');

const corsMiddleware = require('./middlewares/cors');

console.log('🔄 Chargement des routes...');
const authRoutes = require('./routes/auth');
const merchantRoutes = require('./routes/merchants');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transactions');
const operationRoutes = require('./routes/operations');
const webhookRoutes = require('./routes/webhooks');
console.log('✅ Routes chargées (auth, merchants, admin, transactions, operations, webhooks)');

const app = express();
const PORT = process.env.APP_PORT || 3000;

console.log(`🔄 Configuration du serveur sur le port ${PORT}...`);

// Middlewares
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/webhooks', webhookRoutes);

// Route racine

// Route racine API
app.get('/', (req, res) => {
    res.json({
        message: 'Payment Platform API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            merchants: '/api/merchants',
            admin: '/api/admin'
        }
    });
});

// Servir le frontend pour toute route non-API (SPA)
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist/index.html');
app.get(/^\/(?!api|health|favicon\.ico|robots\.txt).*/, (req, res, next) => {
    if (fs.existsSync(frontendDist)) {
        res.sendFile(frontendDist);
    } else {
        next();
    }
});

// Route test
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend API is running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Payment Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            health: '/health'
        }
    });
});

// Gestion erreurs 404
app.use('*', (req, res) => {
    console.log(`❌ Route non trouvée: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        path: req.originalUrl,
        method: req.method
    });
});

// Gestion erreurs globales
app.use((error, req, res, next) => {
    console.error('❌ Erreur globale:', error);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
});

// Démarrage serveur
async function startServer() {
    try {
        console.log('🔄 Démarrage du serveur...');
        
        // Test connexion DB (ne pas arrêter si échec)
        try {
            await sequelize.authenticate();
            console.log('✅ Connexion Sequelize établie avec succès');
        } catch (error) {
            console.log('⚠️  Base de données non disponible (mode développement)');
            console.log('💡 Démarrage du serveur sans DB pour tests API...');
        }
        
        app.listen(PORT, () => {
            console.log('🚀 ================================');
            console.log(`🚀 Backend démarré sur le port ${PORT}`);
            console.log(`🔗 Health: http://localhost:${PORT}/health`);
            console.log(`🔗 API Auth: http://localhost:${PORT}/api/auth`);
            console.log(`📋 Tests: Utilisez test-auth.http`);
            console.log('🚀 ================================');
        });
        
    } catch (error) {
        console.error('❌ Erreur démarrage serveur:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;