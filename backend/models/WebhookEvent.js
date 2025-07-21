'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class WebhookEvent extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Un webhook peut concerner une transaction
      WebhookEvent.belongsTo(models.Transaction, { 
        foreignKey: 'transaction_id', 
        as: 'transaction',
        required: false
      });
      
      // Un webhook peut concerner une opération
      WebhookEvent.belongsTo(models.Operation, { 
        foreignKey: 'operation_id', 
        as: 'operation',
        required: false
      });
      
      // Un webhook appartient à un marchand
      WebhookEvent.belongsTo(models.Merchant, { 
        foreignKey: 'merchant_id', 
        as: 'merchant' 
      });
    }

    /**
     * Générer la signature du webhook
     */
    generateSignature(secret, payload) {
      const crypto = require('crypto');
      return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }

    /**
     * Marquer comme livré avec succès
     */
    async markAsDelivered(responseData = {}) {
      await this.update({
        status: 'delivered',
        delivered_at: new Date(),
        response_data: responseData,
        next_retry_at: null
      });
    }

    /**
     * Marquer comme échoué et programmer la prochaine tentative
     */
    async markAsFailed(errorMessage, responseData = {}) {
      const newRetryCount = this.retry_count + 1;
      const maxRetries = 5;
      
      // Calcul du délai exponentiel: 2^retry_count minutes
      const nextRetryDelay = Math.pow(2, newRetryCount) * 60 * 1000; // en millisecondes
      const nextRetryAt = newRetryCount < maxRetries ? 
        new Date(Date.now() + nextRetryDelay) : null;

      await this.update({
        status: newRetryCount >= maxRetries ? 'failed' : 'pending',
        retry_count: newRetryCount,
        last_error: errorMessage,
        response_data: responseData,
        next_retry_at: nextRetryAt,
        last_attempt_at: new Date()
      });
    }

    /**
     * Vérifier si le webhook peut être retenté
     */
    canRetry() {
      return this.status === 'pending' && 
             this.retry_count < 5 && 
             (!this.next_retry_at || this.next_retry_at <= new Date());
    }
  }

  WebhookEvent.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    merchant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'id'
      }
    },
    operation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'operations',
        key: 'id'
      }
    },
    
    // Type d'événement
    event_type: {
      type: DataTypes.ENUM(
        'transaction.created',
        'transaction.updated',
        'transaction.processing',
        'transaction.success',
        'transaction.failed',
        'transaction.cancelled',
        'operation.capture.processing',
        'operation.capture.success',
        'operation.capture.failed',
        'operation.refund.processing',
        'operation.refund.success',
        'operation.refund.failed'
      ),
      allowNull: false
    },
    
    // URL de destination
    webhook_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    
    // Données et signature
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Données envoyées au webhook'
    },
    signature: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'Signature HMAC-SHA256 du payload'
    },
    
    // Statut et tentatives
    status: {
      type: DataTypes.ENUM('pending', 'delivered', 'failed'),
      defaultValue: 'pending'
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    
    // Réponses HTTP
    http_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    response_data: {
      type: DataTypes.JSON,
      allowNull: true
    },
    last_error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Timestamps
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_attempt_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    next_retry_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'WebhookEvent',
    tableName: 'webhook_events',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['merchant_id']
      },
      {
        fields: ['transaction_id']
      },
      {
        fields: ['operation_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['event_type']
      },
      {
        fields: ['next_retry_at']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return WebhookEvent;
};
