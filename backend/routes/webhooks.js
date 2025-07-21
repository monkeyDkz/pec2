const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { authenticateApiKey, authenticateToken } = require('../middlewares/auth');

// =============================================================================
// ROUTES PUBLIQUES (notifications PSP)
// =============================================================================

/**
 * @route   POST /api/webhooks/psp
 * @desc    Recevoir les notifications du PSP émulateur
 * @access  Public (avec signature PSP)
 */
router.post('/psp', webhookController.handlePSPWebhook);

/**
 * @route   POST /api/webhooks/psp-notification
 * @desc    Recevoir les notifications du PSP émulateur (endpoint alternatif)
 * @access  Public (avec signature PSP)
 */
router.post('/psp-notification', webhookController.handlePSPWebhook);

// =============================================================================
// ROUTES API MARCHAND (avec API key)
// =============================================================================

/**
 * @route   GET /api/webhooks
 * @desc    Lister les webhooks du marchand
 * @access  Marchand (API Key)
 * @params  ?page=1&limit=20&status=pending&event_type=...
 */
router.get('/', authenticateApiKey, webhookController.getWebhooks);

/**
 * @route   POST /api/webhooks/:id/retry
 * @desc    Réessayer un webhook spécifique
 * @access  Marchand (API Key)
 */
router.post('/:id/retry', authenticateApiKey, webhookController.retryWebhook);

/**
 * @route   GET /api/webhooks/stats/summary
 * @desc    Obtenir les statistiques des webhooks
 * @access  Marchand (API Key)
 * @params  ?from_date=...&to_date=...
 */
router.get('/stats/summary', authenticateApiKey, webhookController.getWebhookStats);

// =============================================================================
// ROUTES BACKOFFICE (avec authentification JWT)
// =============================================================================

/**
 * @route   GET /api/webhooks/backoffice/list
 * @desc    Lister tous les webhooks (admin/marchand connecté)
 * @access  Authentifié
 */
router.get('/backoffice/list', authenticateToken, (req, res) => {
  // Si l'utilisateur n'est pas admin, filtrer par ses marchands
  if (req.user.role !== 'admin') {
    // TODO: récupérer les marchands de l'utilisateur et filtrer
    req.merchant = { id: req.user.merchant_ids }; // À implémenter
  }
  webhookController.getWebhooks(req, res);
});

/**
 * @route   POST /api/webhooks/backoffice/retry-failed
 * @desc    Réessayer tous les webhooks en échec
 * @access  Admin
 */
router.post('/backoffice/retry-failed', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  webhookController.retryFailedWebhooks(req, res);
});

module.exports = router;
