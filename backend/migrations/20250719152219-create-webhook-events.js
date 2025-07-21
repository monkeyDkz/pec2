'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('webhook_events', {
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
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      operation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'operations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      // Type d'événement
      event_type: {
        type: Sequelize.ENUM(
          'transaction.created',
          'transaction.updated',
          'transaction.processing',
          'transaction.success',
          'transaction.failed',
          'transaction.cancelled',
          'operation.capture.success',
          'operation.capture.failed',
          'operation.refund.success',
          'operation.refund.failed'
        ),
        allowNull: false
      },
      
      // URL de destination
      webhook_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      
      // Données et signature
      payload: {
        type: Sequelize.JSON,
        allowNull: false
      },
      signature: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      
      // Statut et tentatives
      status: {
        type: Sequelize.ENUM('pending', 'delivered', 'failed'),
        defaultValue: 'pending'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      
      // Réponses HTTP
      http_status: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      response_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      last_error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // Timestamps
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_attempt_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_retry_at: {
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
    await queryInterface.addIndex('webhook_events', ['merchant_id']);
    await queryInterface.addIndex('webhook_events', ['transaction_id']);
    await queryInterface.addIndex('webhook_events', ['operation_id']);
    await queryInterface.addIndex('webhook_events', ['status']);
    await queryInterface.addIndex('webhook_events', ['event_type']);
    await queryInterface.addIndex('webhook_events', ['next_retry_at']);
    await queryInterface.addIndex('webhook_events', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('webhook_events');
  }
};
