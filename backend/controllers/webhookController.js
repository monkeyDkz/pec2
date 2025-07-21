const { WebhookEvent, Transaction, Operation, Merchant, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const axios = require('axios');
const paymentService = require('../services/paymentService');

/**
 * Recevoir les notifications du PSP
 */
exports.handlePSPWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-psp-signature'] || req.headers['X-PSP-Signature'];
    const webhookId = req.headers['x-psp-webhook-id'] || req.headers['X-PSP-Webhook-Id'];
    const body = req.body;

    console.log(`📨 Backend: Received PSP webhook ${webhookId} for operation ${body.operation_id}`);

    // Vérifier la signature du PSP
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PSP_SECRET || 'psp-secret-key-2024')
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log(`❌ Backend: Invalid PSP signature. Expected: ${expectedSignature}, Got: ${signature}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Utiliser le service de paiement pour traiter la notification
    try {
      const operation = await paymentService.processPSPNotification(body);

      // Envoyer webhook au marchand si nécessaire
      const transaction = operation.transaction;
      if (transaction.webhook_url) {
        if (body.status === 'success') {
          if (operation.type === 'capture') {
            await sendMerchantWebhook(transaction, 'transaction.success', operation);
          } else if (operation.type === 'refund') {
            await sendMerchantWebhook(transaction, 'operation.refund.success', operation);
          }
        } else if (body.status === 'failed') {
          if (operation.type === 'capture') {
            await sendMerchantWebhook(transaction, 'transaction.failed', operation);
          } else if (operation.type === 'refund') {
            await sendMerchantWebhook(transaction, 'operation.refund.failed', operation);
          }
        }
      }

      console.log(`✅ Backend: PSP webhook processed successfully for operation ${operation.id}`);

      res.json({
        success: true,
        message: 'Webhook processed successfully',
        operation_id: operation.id
      });

    } catch (processingError) {
      console.error('❌ Backend: Error processing PSP notification:', processingError.message);
      
      res.status(400).json({
        success: false,
        error: processingError.message
      });
    }

  } catch (error) {
    console.error('❌ Backend: Error handling PSP webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Réessayer l'envoi des webhooks en échec
 */
exports.retryFailedWebhooks = async (req, res) => {
  try {
    // Récupérer les webhooks à réessayer
    const webhooksToRetry = await WebhookEvent.findAll({
      where: {
        status: 'pending',
        retry_count: { [Op.lt]: 5 },
        [Op.or]: [
          { next_retry_at: { [Op.lte]: new Date() } },
          { next_retry_at: null }
        ]
      },
      include: [
        {
          model: Merchant,
          as: 'merchant'
        }
      ],
      limit: 50 // Traiter par lot
    });

    const results = {
      processed: 0,
      successful: 0,
      failed: 0
    };

    for (const webhook of webhooksToRetry) {
      results.processed++;
      
      try {
        const success = await sendWebhookToMerchant(webhook);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`Error retrying webhook ${webhook.id}:`, error);
        results.failed++;
      }
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error retrying webhooks:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Obtenir les webhooks d'un marchand
 */
exports.getWebhooks = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;
    const { 
      page = 1, 
      limit = 20, 
      status,
      event_type,
      from_date,
      to_date
    } = req.query;

    const where = { merchant_id: merchantId };
    
    // Filtres
    if (status) where.status = status;
    if (event_type) where.event_type = event_type;
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    const offset = (page - 1) * limit;

    const { rows: webhooks, count } = await WebhookEvent.findAndCountAll({
      where,
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'order_id'],
          required: false
        },
        {
          model: Operation,
          as: 'operation',
          attributes: ['id', 'type', 'amount'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        webhooks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting webhooks:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Réessayer un webhook spécifique
 */
exports.retryWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchant?.id;

    const webhook = await WebhookEvent.findOne({
      where: { 
        id,
        merchant_id: merchantId,
        status: ['pending', 'failed'],
        retry_count: { [Op.lt]: 5 }
      }
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        error: 'Webhook not found or cannot be retried'
      });
    }

    const success = await sendWebhookToMerchant(webhook);

    res.json({
      success: true,
      data: {
        webhook_id: webhook.id,
        retry_successful: success,
        retry_count: webhook.retry_count + 1
      }
    });

  } catch (error) {
    console.error('Error retrying webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Obtenir les statistiques des webhooks
 */
exports.getWebhookStats = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;
    const { from_date, to_date } = req.query;

    const where = { merchant_id: merchantId };
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    const [statusStats, eventStats] = await Promise.all([
      WebhookEvent.findAll({
        where,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),
      WebhookEvent.findAll({
        where,
        attributes: [
          'event_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['event_type'],
        raw: true
      })
    ]);

    res.json({
      success: true,
      data: {
        by_status: statusStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.count)
        })),
        by_event_type: eventStats.map(stat => ({
          event_type: stat.event_type,
          count: parseInt(stat.count)
        }))
      }
    });

  } catch (error) {
    console.error('Error getting webhook stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Fonction utilitaire pour envoyer un webhook au marchand
 */
async function sendMerchantWebhook(transaction, eventType, operation = null) {
  try {
    const payload = {
      event_type: eventType,
      transaction_id: transaction.id,
      merchant_id: transaction.merchant_id,
      order_id: transaction.order_id,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      timestamp: new Date().toISOString()
    };

    if (operation) {
      payload.operation_id = operation.id;
      payload.operation_type = operation.type;
      payload.operation_status = operation.status;
      payload.operation_amount = operation.amount;
    }

    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET || 'default-secret')
      .update(JSON.stringify(payload))
      .digest('hex');

    // Créer l'événement webhook
    const webhook = await WebhookEvent.create({
      merchant_id: transaction.merchant_id,
      transaction_id: transaction.id,
      operation_id: operation?.id,
      event_type: eventType,
      webhook_url: transaction.webhook_url,
      payload,
      signature
    });

    // Envoyer immédiatement
    await sendWebhookToMerchant(webhook);

  } catch (error) {
    console.error('Error sending merchant webhook:', error);
  }
}

/**
 * Fonction utilitaire pour envoyer physiquement un webhook
 */
async function sendWebhookToMerchant(webhook) {
  try {
    const response = await axios.post(webhook.webhook_url, webhook.payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': webhook.signature,
        'X-Webhook-Event': webhook.event_type,
        'User-Agent': 'PaymentPlatform-Webhook/1.0'
      }
    });

    // Marquer comme livré
    await webhook.markAsDelivered({
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    return true;

  } catch (error) {
    console.error(`Webhook ${webhook.id} failed:`, error.message);
    
    // Marquer comme échoué et programmer la prochaine tentative
    await webhook.markAsFailed(
      error.message,
      {
        status: error.response?.status,
        data: error.response?.data
      }
    );

    return false;
  }
}
