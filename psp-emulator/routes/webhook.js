const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * Route pour recevoir des confirmations de webhook du backend
 * POST /api/webhook/confirm
 */
router.post('/confirm', webhookController.confirmWebhook);

/**
 * Route pour lister les webhooks envoyés (debug)
 * GET /api/webhook/history
 */
router.get('/history', webhookController.getWebhookHistory);

module.exports = router;
