'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      
      // Informations de commande
      order_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'ID de commande côté marchand'
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // Informations client/facturation
      customer_email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      customer_first_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      customer_last_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      billing_address: {
        type: Sequelize.JSON,
        allowNull: true
      },
      shipping_address: {
        type: Sequelize.JSON,
        allowNull: true
      },
      
      // URLs de redirection
      success_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cancel_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      webhook_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // Statut et sécurité
      status: {
        type: Sequelize.ENUM(
          'pending',
          'processing',
          'success',
          'failed',
          'cancelled',
          'refunded',
          'partial_refund'
        ),
        defaultValue: 'pending'
      },
      payment_token: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true
      },
      
      // Métadonnées
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      
      // Timestamps de workflow
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
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
    await queryInterface.addIndex('transactions', ['merchant_id']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['payment_token']);
    await queryInterface.addIndex('transactions', ['order_id', 'merchant_id'], { unique: true });
    await queryInterface.addIndex('transactions', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};
