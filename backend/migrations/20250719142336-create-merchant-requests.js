'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('merchant_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('create_merchant', 'join_merchant'),
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: true, // Null pour create_merchant, rempli pour join_merchant
        references: {
          model: 'merchants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // Données pour la création de marchand
      requested_merchant_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      requested_website_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      requested_business_type: {
        type: Sequelize.ENUM('e-commerce', 'saas', 'marketplace', 'service', 'other'),
        allowNull: true
      },
      requested_company_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      requested_company_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requested_company_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      requested_company_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      requested_siret: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      requested_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Role demandé pour join_merchant
      requested_role: {
        type: Sequelize.ENUM('admin', 'manager', 'developer'),
        defaultValue: 'developer',
        allowNull: true
      },
      justification: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Index pour les performances
    await queryInterface.addIndex('merchant_requests', ['user_id']);
    await queryInterface.addIndex('merchant_requests', ['merchant_id']);
    await queryInterface.addIndex('merchant_requests', ['status']);
    await queryInterface.addIndex('merchant_requests', ['type']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('merchant_requests');
  }
};
