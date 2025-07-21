const axios = require('axios');
const { Transaction, Operation } = require('../models');

/**
 * Service de gestion des paiements et communication avec le PSP
 */
class PaymentService {
  
  constructor() {
    this.pspUrl = process.env.PSP_URL || 'http://psp-emulator:3002';
    this.callbackUrl = process.env.BACKEND_URL || 'http://backend:3000';
    console.log(`💡 PaymentService initialized with PSP_URL: ${this.pspUrl}`);
  }

  /**
   * Envoyer un paiement au PSP pour traitement
   */
  async sendPaymentToPSP(operation, transaction, paymentData) {
    try {
      console.log(`📤 Backend: Sending payment to PSP for operation ${operation.id}`);

      const pspPayload = {
        operation_id: operation.id,
        transaction_id: transaction.id,
        amount: operation.amount,
        currency: operation.currency,
        payment_method: paymentData.payment_method,
        customer: paymentData.customer,
        callback_url: `${this.callbackUrl}/api/webhooks/psp-notification`
      };

      // Mettre à jour le statut de l'opération
      await operation.update({
        status: 'processing',
        psp_request_data: pspPayload,
        psp_request_sent_at: new Date()
      });

      // Envoyer au PSP
      const response = await axios.post(
        `${this.pspUrl}/api/payment/process`,
        pspPayload,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Payment-Platform-Backend/1.0'
          }
        }
      );

      if (response.data.success) {
        // Enregistrer la référence PSP
        await operation.update({
          psp_reference: response.data.psp_reference,
          psp_response_data: response.data,
          estimated_completion: response.data.estimated_completion
        });

        console.log(`✅ Backend: Payment sent to PSP successfully - Reference: ${response.data.psp_reference}`);
        
        return {
          success: true,
          psp_reference: response.data.psp_reference,
          estimated_completion: response.data.estimated_completion
        };
      } else {
        throw new Error(response.data.error || 'PSP rejected the payment request');
      }

    } catch (error) {
      console.error('❌ Backend: Error sending payment to PSP:', error.message);
      
      // Mettre à jour le statut en erreur
      await operation.update({
        status: 'failed',
        error_message: error.message,
        psp_error_data: {
          error: error.message,
          timestamp: new Date()
        }
      });

      throw error;
    }
  }

  /**
   * Envoyer un remboursement au PSP
   */
  async sendRefundToPSP(operation, transaction, captureOperation) {
    try {
      console.log(`📤 Backend: Sending refund to PSP for operation ${operation.id}`);

      const pspPayload = {
        operation_id: operation.id,
        transaction_id: transaction.id,
        capture_reference: captureOperation.psp_reference,
        refund_amount: operation.amount,
        currency: operation.currency,
        reason: operation.metadata?.refund_reason || 'Merchant refund',
        callback_url: `${this.callbackUrl}/api/webhooks/psp-notification`
      };

      // Mettre à jour le statut de l'opération
      await operation.update({
        status: 'processing',
        psp_request_data: pspPayload,
        psp_request_sent_at: new Date()
      });

      // Envoyer au PSP
      const response = await axios.post(
        `${this.pspUrl}/api/payment/refund`,
        pspPayload,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Payment-Platform-Backend/1.0'
          }
        }
      );

      if (response.data.success) {
        // Enregistrer la référence PSP
        await operation.update({
          psp_reference: response.data.psp_reference,
          psp_response_data: response.data,
          estimated_completion: response.data.estimated_completion
        });

        console.log(`✅ Backend: Refund sent to PSP successfully - Reference: ${response.data.psp_reference}`);
        
        return {
          success: true,
          psp_reference: response.data.psp_reference,
          estimated_completion: response.data.estimated_completion
        };
      } else {
        throw new Error(response.data.error || 'PSP rejected the refund request');
      }

    } catch (error) {
      console.error('❌ Backend: Error sending refund to PSP:', error.message);
      
      // Mettre à jour le statut en erreur
      await operation.update({
        status: 'failed',
        error_message: error.message,
        psp_error_data: {
          error: error.message,
          timestamp: new Date()
        }
      });

      throw error;
    }
  }

  /**
   * Traiter une notification du PSP
   */
  async processPSPNotification(notificationData) {
    try {
      const { operation_id, status, psp_reference, psp_transaction_id, error_message, error_code, data } = notificationData;

      console.log(`📨 Backend: Processing PSP notification for operation ${operation_id} - Status: ${status}`);

      // Trouver l'opération
      const operation = await Operation.findByPk(operation_id, {
        include: [{ model: Transaction, as: 'transaction' }]
      });

      if (!operation) {
        throw new Error(`Operation ${operation_id} not found`);
      }

      // Mettre à jour selon le statut
      if (status === 'success') {
        await operation.update({
          status: 'success',
          psp_transaction_id,
          psp_response_data: data,
          processed_at: new Date()
        });

        // Mettre à jour la transaction si c'est un paiement
        if (operation.type === 'capture') {
          await operation.transaction.update({
            status: 'success',
            paid_at: new Date()
          });
        }

        console.log(`✅ Backend: Operation ${operation_id} completed successfully`);

      } else if (status === 'failed') {
        await operation.update({
          status: 'failed',
          error_message,
          error_code,
          psp_response_data: data,
          processed_at: new Date()
        });

        // Mettre à jour la transaction si c'est un paiement
        if (operation.type === 'capture') {
          await operation.transaction.update({
            status: 'failed'
          });
        }

        console.log(`❌ Backend: Operation ${operation_id} failed - ${error_message}`);

      } else {
        console.warn(`⚠️ Backend: Unknown PSP status '${status}' for operation ${operation_id}`);
      }

      return operation;

    } catch (error) {
      console.error('❌ Backend: Error processing PSP notification:', error.message);
      throw error;
    }
  }

  /**
   * Vérifier le statut d'une opération auprès du PSP (polling)
   */
  async checkOperationStatus(operation) {
    try {
      // Pour la démo, on peut implémenter un endpoint de statut sur le PSP
      // Pour l'instant, on retourne le statut actuel de l'opération
      return {
        operation_id: operation.id,
        status: operation.status,
        psp_reference: operation.psp_reference,
        last_updated: operation.updatedAt
      };

    } catch (error) {
      console.error('❌ Backend: Error checking operation status:', error.message);
      throw error;
    }
  }
}

module.exports = new PaymentService();