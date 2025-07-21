const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'payment_platform',
  process.env.DB_USER || 'root', 
  process.env.DB_PASSWORD || 'payment_root_password_2024',
  {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test de connexion
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion Sequelize établie avec succès');
        return true;
    } catch (error) {
        console.error('❌ Impossible de se connecter à la base de données:', error.message);
        throw error;
    }
}

module.exports = { 
    sequelize, 
    testConnection 
};