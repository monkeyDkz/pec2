module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('merchants', 'success_url', {
      type: Sequelize.STRING(500),
      allowNull: true
    })
    await queryInterface.addColumn('merchants', 'cancel_url', {
      type: Sequelize.STRING(500),
      allowNull: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('merchants', 'success_url')
    await queryInterface.removeColumn('merchants', 'cancel_url')
  }
};