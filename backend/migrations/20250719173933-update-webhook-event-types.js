'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Ajouter les nouveaux types d'événements à l'ENUM existant
    await queryInterface.changeColumn('webhook_events', 'event_type', {
      type: Sequelize.ENUM(
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
    });
  },

  async down (queryInterface, Sequelize) {
    // Revenir à l'ENUM original
    await queryInterface.changeColumn('webhook_events', 'event_type', {
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
    });
  }
};
