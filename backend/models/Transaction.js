'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Une transaction appartient à un marchand
      Transaction.belongsTo(models.Merchant, { 
        foreignKey: 'merchant_id', 
        as: 'merchant' 
      });
      
      // Une transaction peut avoir plusieurs opérations (capture, refund)
      Transaction.hasMany(models.Operation, { 
        foreignKey: 'transaction_id', 
        as: 'operations' 
      });
    }

    /**
     * Calculer le montant total des remboursements
     */
    async getTotalRefunded() {
      const refunds = await this.getOperations({
        where: { type: 'refund', status: 'success' }
      });
      return refunds.reduce((total, refund) => total + parseFloat(refund.amount), 0);
    }

    /**
     * Calculer le montant disponible pour remboursement
     */
    async getRefundableAmount() {
      const totalRefunded = await this.getTotalRefunded();
      return parseFloat(this.amount) - totalRefunded;
    }

    /**
     * Vérifier si la transaction peut être remboursée
     */
    async canBeRefunded(amount) {
      if (this.status !== 'success') return false;
      const refundableAmount = await this.getRefundableAmount();
      return amount <= refundableAmount;
    }

    /**
     * Générer une signature pour sécuriser la transaction
     */
    generateSignature(secret) {
      const crypto = require('crypto');
      const data = `${this.id}${this.merchant_id}${this.amount}${this.currency}${this.order_id}`;
      return crypto.createHmac('sha256', secret).update(data).digest('hex');
    }

    /**
     * Générer l'URL de paiement
     */
    generatePaymentUrl(baseUrl) {
      return `${baseUrl}/payment/${this.id}?token=${this.payment_token}`;
    }

    // Sérialisation pour JSON (exclure les données sensibles)
    toJSON() {
      const values = { ...this.get() };
      delete values.payment_token;
      return values;
    }
  }

  Transaction.init({
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
    // Informations de commande
    order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'ID de commande côté marchand'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'EUR',
      validate: {
        isIn: [['EUR', 'USD', 'GBP', 'JPY']]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Informations client/facturation
    customer_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    customer_first_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    customer_last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    billing_address: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Adresse de facturation complète'
    },
    shipping_address: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Adresse de livraison'
    },
    
    // URLs de redirection
    success_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    cancel_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    webhook_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    
    // Statut et sécurité
    status: {
      type: DataTypes.ENUM(
        'pending',     // En attente de paiement
        'processing',  // En cours de traitement
        'success',     // Paiement réussi
        'failed',      // Paiement échoué
        'cancelled',   // Annulé par l'utilisateur
        'refunded',    // Remboursé totalement
        'partial_refund' // Remboursé partiellement
      ),
      defaultValue: 'pending'
    },
    payment_token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment: 'Token sécurisé pour l\'URL de paiement'
    },
    
    // Métadonnées
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Données supplémentaires du marchand'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    
    // Timestamps de workflow
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Expiration du lien de paiement'
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['merchant_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['payment_token']
      },
      {
        fields: ['order_id', 'merchant_id'],
        unique: true
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Transaction;
};
