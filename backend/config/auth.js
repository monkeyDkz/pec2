require('dotenv').config();

// Configuration pour l'authentification
const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // URLs pour les emails de vérification
  verificationUrl: process.env.VERIFICATION_URL || 'http://localhost:8080/verify-email',
  dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:8080/dashboard',
  
  // Timeouts et limitations
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, // 15 minutes
};

// Validation de la configuration
function validateAuthConfig() {
  const requiredFields = ['jwtSecret'];
  
  for (const field of requiredFields) {
    if (!authConfig[field]) {
      throw new Error(`❌ Configuration manquante: ${field}`);
    }
  }
  
  if (authConfig.jwtSecret.includes('change_this_in_production') && process.env.NODE_ENV === 'production') {
    throw new Error('❌ JWT Secret must be changed in production!');
  }
  
  console.log('✅ Configuration d\'authentification validée');
  return true;
}

module.exports = {
  authConfig,
  validateAuthConfig
};
