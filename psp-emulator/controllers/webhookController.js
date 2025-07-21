/**
 * Contrôleur pour gérer les webhooks côté PSP
 */

// Stockage en mémoire pour la démo (en production, utiliser une base de données)
let webhookHistory = [];

/**
 * Confirmer la réception d'un webhook
 */
exports.confirmWebhook = async (req, res) => {
  try {
    const { webhook_id, status, received_at } = req.body;

    console.log(`📨 PSP: Webhook confirmation received - ID: ${webhook_id}, Status: ${status}`);

    // Enregistrer la confirmation
    const confirmation = {
      webhook_id,
      status,
      received_at: received_at || new Date().toISOString(),
      confirmed_at: new Date().toISOString()
    };

    // Trouver et mettre à jour l'historique du webhook
    const webhookIndex = webhookHistory.findIndex(w => w.webhook_id === webhook_id);
    if (webhookIndex !== -1) {
      webhookHistory[webhookIndex].confirmation = confirmation;
    }

    res.json({
      success: true,
      message: 'Webhook confirmation processed',
      confirmation
    });

  } catch (error) {
    console.error('❌ PSP: Error processing webhook confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing webhook confirmation'
    });
  }
};

/**
 * Obtenir l'historique des webhooks (pour debug)
 */
exports.getWebhookHistory = async (req, res) => {
  try {
    const { limit = 50, operation_id } = req.query;

    let history = webhookHistory;

    // Filtrer par operation_id si fourni
    if (operation_id) {
      history = history.filter(w => w.operation_id === operation_id);
    }

    // Limiter le nombre de résultats
    history = history
      .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      history,
      total: webhookHistory.length
    });

  } catch (error) {
    console.error('❌ PSP: Error fetching webhook history:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching webhook history'
    });
  }
};

/**
 * Fonction utilitaire pour enregistrer un webhook envoyé
 */
exports.recordWebhookSent = (webhookData) => {
  const webhook = {
    webhook_id: `WH_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...webhookData,
    sent_at: new Date().toISOString()
  };

  webhookHistory.push(webhook);

  // Garder seulement les 1000 derniers webhooks en mémoire
  if (webhookHistory.length > 1000) {
    webhookHistory = webhookHistory.slice(-1000);
  }

  return webhook.webhook_id;
};
