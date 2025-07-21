console.log('🔄 [DEBUG] Script de démarrage...');

try {
    console.log('🔄 [DEBUG] Test require express...');
    const express = require('express');
    console.log('✅ [DEBUG] Express OK');

    console.log('🔄 [DEBUG] Test require cors...');
    const cors = require('cors');
    console.log('✅ [DEBUG] CORS OK');

    console.log('🔄 [DEBUG] Test require helmet...');
    const helmet = require('helmet');
    console.log('✅ [DEBUG] Helmet OK');

    console.log('🔄 [DEBUG] Test require dotenv...');
    require('dotenv').config();
    console.log('✅ [DEBUG] Dotenv OK');

    console.log('🔄 [DEBUG] Test config database...');
    const { sequelize } = require('./config/database');
    console.log('✅ [DEBUG] Database config OK');

    console.log('🔄 [DEBUG] Test routes auth...');
    const authRoutes = require('./routes/auth');
    console.log('✅ [DEBUG] Auth routes OK');

    console.log('🔄 [DEBUG] Création app Express...');
    const app = express();
    console.log('✅ [DEBUG] App Express créée');

    console.log('🔄 [DEBUG] Test port ENV...');
    const PORT = process.env.APP_PORT || 3000;
    console.log(`✅ [DEBUG] Port: ${PORT}`);

    console.log('🔄 [DEBUG] Configuration middlewares...');
    app.use(helmet());
    app.use(cors({
        origin: ['http://localhost:8080', 'http://frontend:8080'],
        credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    console.log('✅ [DEBUG] Middlewares configurés');

    console.log('🔄 [DEBUG] Configuration routes...');
    app.use('/api/auth', authRoutes);
    
    app.get('/debug', (req, res) => {
        res.json({ status: 'OK', message: 'Debug endpoint' });
    });
    console.log('✅ [DEBUG] Routes configurées');

    console.log('🔄 [DEBUG] Démarrage serveur...');
    const server = app.listen(PORT, () => {
        console.log('🚀 [DEBUG] Serveur démarré avec succès!');
        console.log(`🔗 [DEBUG] http://localhost:${PORT}/debug`);
        
        // Garder le processus en vie
        setInterval(() => {
            console.log(`⏰ [DEBUG] Serveur actif - ${new Date().toLocaleTimeString()}`);
        }, 10000);
    });

    server.on('error', (error) => {
        console.error('❌ [DEBUG] Erreur serveur:', error);
    });

} catch (error) {
    console.error('❌ [DEBUG] Erreur globale:', error);
    console.error('❌ [DEBUG] Stack:', error.stack);
    process.exit(1);
}

process.on('uncaughtException', (error) => {
    console.error('❌ [DEBUG] Exception non gérée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ [DEBUG] Promesse rejetée:', reason);
    process.exit(1);
});
