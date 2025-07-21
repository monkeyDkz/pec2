const crypto = require('crypto');
const axios = require('axios');
const webhookController = require('./webhookController');

// Configuration des délais de traitement
const config = require('../config/delay');

/**
 * Traiter un paiement (capture)
 */
exports.processPayment = async (req, res) => {
  try {
    const {
      operation_id,
      transaction_id,
      amount,
      currency,
      payment_method,
      customer,
      callback_url
    } = req.body;

    console.log(`🔄 PSP: Processing payment for operation ${operation_id}`);

    // Validation des données
    if (!operation_id || !transaction_id || !amount || !callback_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: operation_id, transaction_id, amount, callback_url'
      });
    }

    // Générer une référence PSP unique
    const psp_reference = `PSP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const psp_transaction_id = `TXN_${Date.now()}`;

    console.log(`🔄 PSP: Processing payment for operation ${operation_id} with PSP ref ${psp_reference}`);

    // Simuler le délai de traitement configuré
    const delay = config.getProcessingDelay();
    console.log(`⏳ PSP: Processing with ${delay}ms delay`);

    // Traitement asynchrone
    setTimeout(async () => {
      try {
        // Simulation de la logique de paiement
        const paymentResult = simulatePaymentProcessing(payment_method, amount);

        // Préparer la réponse de notification
        const notificationPayload = {
          operation_id,
          transaction_id,
          status: paymentResult.success ? 'success' : 'failed',
          psp_reference,
          psp_transaction_id: paymentResult.success ? psp_transaction_id : null,
          error_message: paymentResult.error_message,
          error_code: paymentResult.error_code,
          data: paymentResult.data
        };

        // Envoyer la notification au backend
        await sendNotificationToBackend(callback_url, notificationPayload);

        console.log(`✅ PSP: Payment ${paymentResult.success ? 'SUCCESS' : 'FAILED'} for operation ${operation_id}`);

      } catch (error) {
        console.error('❌ PSP: Error in async processing:', error);
        
        // Envoyer notification d'erreur système
        await sendNotificationToBackend(callback_url, {
          operation_id,
          transaction_id,
          status: 'failed',
          psp_reference,
          error_message: 'PSP system error',
          error_code: 'PSP_ERROR',
          data: {}
        });
      }
    }, delay);

    // Réponse immédiate (asynchrone)
    res.json({
      success: true,
      message: 'Payment request accepted, processing asynchronously',
      psp_reference,
      estimated_completion: new Date(Date.now() + delay).toISOString()
    });

  } catch (error) {
    console.error('❌ PSP: Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'PSP system error'
    });
  }
};

/**
 * Traiter un remboursement (refund)
 */
exports.processRefund = async (req, res) => {
  try {
    const {
      operation_id,
      transaction_id,
      capture_reference,
      refund_amount,
      currency,
      reason,
      callback_url
    } = req.body;

    console.log(`🔄 PSP: Processing refund for operation ${operation_id}`);

    // Validation des données
    if (!operation_id || !transaction_id || !refund_amount || !callback_url || !capture_reference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: operation_id, transaction_id, refund_amount, callback_url, capture_reference'
      });
    }

    // Générer une référence PSP unique pour le remboursement
    const psp_reference = `PSP_REFUND_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const psp_transaction_id = `REF_${Date.now()}`;

    console.log(`🔄 PSP: Processing refund for operation ${operation_id} with PSP ref ${psp_reference}`);

    // Simuler le délai de traitement
    const delay = config.getProcessingDelay();
    console.log(`⏳ PSP: Processing refund with ${delay}ms delay`);

    // Traitement asynchrone
    setTimeout(async () => {
      try {
        // Simulation de la logique de remboursement
        const refundResult = simulateRefundProcessing(capture_reference, refund_amount);

        // Préparer la réponse de notification
        const notificationPayload = {
          operation_id,
          transaction_id,
          status: refundResult.success ? 'success' : 'failed',
          psp_reference,
          psp_transaction_id: refundResult.success ? psp_transaction_id : null,
          error_message: refundResult.error_message,
          error_code: refundResult.error_code,
          data: refundResult.data
        };

        // Envoyer la notification au backend
        await sendNotificationToBackend(callback_url, notificationPayload);

        console.log(`✅ PSP: Refund ${refundResult.success ? 'SUCCESS' : 'FAILED'} for operation ${operation_id}`);

      } catch (error) {
        console.error('❌ PSP: Error in async refund processing:', error);
        
        // Envoyer notification d'erreur système
        await sendNotificationToBackend(callback_url, {
          operation_id,
          transaction_id,
          status: 'failed',
          psp_reference,
          error_message: 'PSP refund system error',
          error_code: 'PSP_REFUND_ERROR',
          data: {}
        });
      }
    }, delay);

    // Réponse immédiate (asynchrone)
    res.json({
      success: true,
      message: 'Refund request accepted, processing asynchronously',
      psp_reference,
      estimated_completion: new Date(Date.now() + delay).toISOString()
    });

  } catch (error) {
    console.error('❌ PSP: Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: 'PSP refund system error'
    });
  }
};

/**
 * Simuler le traitement d'un paiement
 */
function simulatePaymentProcessing(paymentMethod, amount) {
  // Simulation de différents scénarios
  const scenarios = [
    { probability: 0.85, success: true }, // 85% de succès
    { probability: 0.10, success: false, error: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' },
    { probability: 0.03, success: false, error: 'CARD_DECLINED', message: 'Card declined by issuer' },
    { probability: 0.02, success: false, error: 'EXPIRED_CARD', message: 'Card expired' }
  ];

  // Cas spéciaux pour les tests
  if (paymentMethod && paymentMethod.card_number) {
    // Cartes de test spécifiques
    switch (paymentMethod.card_number) {
      case '4111111111111111':
        // Carte Visa de test - SUCCÈS garanti
        return {
          success: true,
          data: {
            card_last4: '1111',
            authorization_code: `AUTH${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            processor_response: 'APPROVED',
            network_transaction_id: `NET_${Date.now()}`
          }
        };
      case '4000000000000002':
        return {
          success: false,
          error_code: 'CARD_DECLINED',
          error_message: 'Card declined',
          data: { decline_reason: 'Generic decline' }
        };
      case '4000000000000119':
        return {
          success: false,
          error_code: 'INSUFFICIENT_FUNDS',
          error_message: 'Insufficient funds',
          data: { decline_reason: 'Insufficient funds' }
        };
      case '4000000000000127':
        return {
          success: false,
          error_code: 'EXPIRED_CARD',
          error_message: 'Card expired',
          data: { decline_reason: 'Expired card' }
        };
    }
  }

  // Simulation aléatoire
  const random = Math.random();
  let cumulative = 0;

  for (const scenario of scenarios) {
    cumulative += scenario.probability;
    if (random <= cumulative) {
      if (scenario.success) {
        return {
          success: true,
          data: {
            card_last4: paymentMethod?.card_number?.slice(-4) || '1111',
            authorization_code: `AUTH${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            processor_response: 'APPROVED',
            network_transaction_id: `NET_${Date.now()}`
          }
        };
      } else {
        return {
          success: false,
          error_code: scenario.error,
          error_message: scenario.message,
          data: {
            decline_reason: scenario.message,
            processor_response: 'DECLINED'
          }
        };
      }
    }
  }

  // Fallback (succès)
  return {
    success: true,
    data: {
      card_last4: '1111',
      authorization_code: 'AUTH123',
      processor_response: 'APPROVED'
    }
  };
}

/**
 * Simuler le traitement d'un remboursement
 */
function simulateRefundProcessing(captureReference, amount) {
  // Simulation de différents scénarios pour les remboursements
  const scenarios = [
    { probability: 0.95, success: true }, // 95% de succès pour les remboursements
    { probability: 0.03, success: false, error: 'REFUND_DECLINED', message: 'Refund declined by processor' },
    { probability: 0.02, success: false, error: 'ORIGINAL_TRANSACTION_NOT_FOUND', message: 'Original transaction not found' }
  ];

  const random = Math.random();
  let cumulative = 0;

  for (const scenario of scenarios) {
    cumulative += scenario.probability;
    if (random <= cumulative) {
      if (scenario.success) {
        return {
          success: true,
          data: {
            refund_reference: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            processor_response: 'REFUND_APPROVED',
            original_reference: captureReference,
            refund_amount: amount
          }
        };
      } else {
        return {
          success: false,
          error_code: scenario.error,
          error_message: scenario.message,
          data: {
            decline_reason: scenario.message,
            processor_response: 'REFUND_DECLINED',
            original_reference: captureReference
          }
        };
      }
    }
  }

  // Fallback (succès)
  return {
    success: true,
    data: {
      refund_reference: 'REF123',
      processor_response: 'REFUND_APPROVED'
    }
  };
}

/**
 * Envoyer une notification au backend
 */
async function sendNotificationToBackend(callbackUrl, payload) {
  try {
    const signature = crypto
      .createHmac('sha256', process.env.PSP_SECRET || 'psp-secret-key-2024')
      .update(JSON.stringify(payload))
      .digest('hex');

    console.log(`📤 PSP: Sending notification to ${callbackUrl}`);

    // Enregistrer le webhook avant envoi
    const webhookId = webhookController.recordWebhookSent({
      operation_id: payload.operation_id,
      transaction_id: payload.transaction_id,
      callback_url: callbackUrl,
      payload,
      signature
    });

    const response = await axios.post(callbackUrl, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-PSP-Signature': signature,
        'X-PSP-Webhook-Id': webhookId,
        'User-Agent': 'PSP-Emulator/1.0'
      }
    });

    console.log(`✅ PSP: Notification sent successfully (${response.status}) - Webhook ID: ${webhookId}`);

  } catch (error) {
    console.error(`❌ PSP: Failed to send notification to ${callbackUrl}:`, error.message);
    
    // Ici on pourrait implémenter un système de retry
    // Pour la démo, on log juste l'erreur
  }
}