/**
 * Configuration des délais de traitement du PSP émulateur
 */

// Délais configurables selon l'environnement
const delays = {
  // Mode rapide pour les tests (par défaut)
  fast: {
    min: 500,   // 0.5 seconde minimum
    max: 2000   // 2 secondes maximum
  },
  
  // Mode réaliste pour la démo
  realistic: {
    min: 2000,  // 2 secondes minimum
    max: 8000   // 8 secondes maximum
  },
  
  // Mode lent pour tester la robustesse
  slow: {
    min: 5000,  // 5 secondes minimum
    max: 15000  // 15 secondes maximum
  }
};

/**
 * Obtenir un délai de traitement aléatoire
 */
function getProcessingDelay() {
  const mode = process.env.PSP_DELAY_MODE || 'fast';
  const config = delays[mode] || delays.fast;
  
  const delay = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
  
  console.log(`⏱️  PSP: Délai configuré en mode '${mode}': ${delay}ms`);
  return delay;
}

/**
 * Obtenir un délai fixe pour les tests
 */
function getFixedDelay(milliseconds = 1000) {
  return Math.max(100, Math.min(30000, milliseconds)); // Entre 100ms et 30s
}

/**
 * Obtenir la configuration actuelle
 */
function getCurrentConfig() {
  const mode = process.env.PSP_DELAY_MODE || 'fast';
  return {
    mode,
    config: delays[mode] || delays.fast,
    available_modes: Object.keys(delays)
  };
}

module.exports = {
  getProcessingDelay,
  getFixedDelay,
  getCurrentConfig,
  delays
};