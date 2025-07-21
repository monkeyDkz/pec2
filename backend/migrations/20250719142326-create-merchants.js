'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('merchants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      business_type: {
        type: Sequelize.ENUM('e-commerce', 'saas', 'marketplace', 'service', 'other'),
        defaultValue: 'other',
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      company_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      company_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      company_email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      siret: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      api_key: {
        type: Sequelize.STRING(64),
        allowNull: true,
        unique: true
      },
      api_secret: {
        type: Sequelize.STRING(128),
        allowNull: true
      },
      webhook_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      validated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      validated_at: {
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
    await queryInterface.addIndex('merchants', ['status']);
    await queryInterface.addIndex('merchants', ['created_by']);
    await queryInterface.addIndex('merchants', ['api_key']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('merchants');
  }
};
