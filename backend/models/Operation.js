'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Operation extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Une opération appartient à une transaction
      Operation.belongsTo(models.Transaction, { 
        foreignKey: 'transaction_id', 
        as: 'transaction' 
      });
      
      // Une opération appartient à un marchand
      Operation.belongsTo(models.Merchant, { 
        foreignKey: 'merchant_id', 
        as: 'merchant' 
      });
    }

    /**
     * Générer un ID de référence unique pour le PSP
     */
    generatePspReference() {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `PSP_${this.type.toUpperCase()}_${timestamp}_${random}`;
    }

    /**
     * Calculer les frais de transaction
     */
    calculateFees(feePercentage = 2.9, fixedFee = 0.30) {
      const amount = parseFloat(this.amount);
      const variableFee = amount * (feePercentage / 100);
      return parseFloat((variableFee + fixedFee).toFixed(2));
    }

    /**
     * Vérifier si l'opération peut être annulée
     */
    canBeCancelled() {
      return ['pending', 'processing'].includes(this.status);
    }

    /**
     * Marquer l'opération comme réussie
     */
    async markAsSuccess(pspResponse = {}) {
      await this.update({
        status: 'success',
        processed_at: new Date(),
        psp_response: pspResponse,
        psp_reference: this.psp_reference || this.generatePspReference()
      });
    }

    /**
     * Marquer l'opération comme échouée
     */
    async markAsFailed(errorMessage, pspResponse = {}) {
      await this.update({
        status: 'failed',
        processed_at: new Date(),
        error_message: errorMessage,
        psp_response: pspResponse
      });
    }
  }

  Operation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'id'
      }
    },
    merchant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    
    // Type et montant
    type: {
      type: DataTypes.ENUM('capture', 'refund'),
      allowNull: false,
      comment: 'capture = paiement, refund = remboursement'
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
      defaultValue: 'EUR'
    },
    
    // Statut et traitement
    status: {
      type: DataTypes.ENUM(
        'pending',     // En attente
        'processing',  // En cours de traitement au PSP
        'success',     // Réussie
        'failed',      // Échouée
        'cancelled'    // Annulée
      ),
      defaultValue: 'pending'
    },
    
    // Références PSP
    psp_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'Référence unique du PSP'
    },
    psp_transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID de transaction côté PSP'
    },
    
    // Réponses et erreurs
    psp_response: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Réponse complète du PSP'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    error_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    
    // Informations de remboursement
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Raison du remboursement'
    },
    parent_operation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'operations',
        key: 'id'
      },
      comment: 'Opération parent pour les remboursements'
    },
    
    // Métadonnées
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    
    // Timestamps de traitement
    submitted_to_psp_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Quand envoyé au PSP'
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Quand traité par le PSP'
    }
  }, {
    sequelize,
    modelName: 'Operation',
    tableName: 'operations',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['transaction_id']
      },
      {
        fields: ['merchant_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['psp_reference']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Operation;
};
