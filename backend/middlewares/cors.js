const cors = require('cors');

// Configuration CORS pour autoriser les requêtes du frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Liste des origins autorisées
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081',  // Frontend en développement
      'http://localhost:3000',  // Au cas où le frontend serait sur 3000
      'http://172.25.0.3:8080', // Frontend dans Docker
      'http://frontend:8080',   // Frontend via le nom de service Docker
      'http://payment_frontend:8080', // Nom du container
    ];
    
    // Autoriser localhost et les IPs locales en mode développement
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('172.') || origin.includes('192.168.')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

console.log('🔒 CORS configuré avec les origins:', corsOptions.origin);

module.exports = cors(corsOptions);