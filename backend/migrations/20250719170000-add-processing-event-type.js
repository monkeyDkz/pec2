'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Ajouter la valeur 'transaction.processing' à l'ENUM existant
    await queryInterface.sequelize.query(`
      ALTER TABLE webhook_events 
      MODIFY COLUMN event_type ENUM(
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
      ) NOT NULL;
    `);
  },

  async down (queryInterface, Sequelize) {
    // Retirer la valeur 'transaction.processing' de l'ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE webhook_events 
      MODIFY COLUMN event_type ENUM(
        'transaction.created',
        'transaction.updated', 
        'transaction.success',
        'transaction.failed',
        'transaction.cancelled',
        'operation.capture.success',
        'operation.capture.failed',
        'operation.refund.success',
        'operation.refund.failed'
      ) NOT NULL;
    `);
  }
};
