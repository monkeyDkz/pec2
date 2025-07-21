'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('operations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'merchants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      // Type et montant
      type: {
        type: Sequelize.ENUM('capture', 'refund'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'EUR'
      },
      
      // Statut et traitement
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'success', 'failed', 'cancelled'),
        defaultValue: 'pending'
      },
      
      // Références PSP
      psp_reference: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      psp_transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      
      // Réponses et erreurs
      psp_response: {
        type: Sequelize.JSON,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      error_code: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      
      // Informations de remboursement
      refund_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      parent_operation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'operations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      // Métadonnées
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      
      // Timestamps de traitement
      submitted_to_psp_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Ajout des index
    await queryInterface.addIndex('operations', ['transaction_id']);
    await queryInterface.addIndex('operations', ['merchant_id']);
    await queryInterface.addIndex('operations', ['type']);
    await queryInterface.addIndex('operations', ['status']);
    await queryInterface.addIndex('operations', ['psp_reference']);
    await queryInterface.addIndex('operations', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('operations');
  }
};
