-- Création de la base de données
CREATE DATABASE IF NOT EXISTS payment_platform;
USE payment_platform;

-- Table des utilisateurs (admins et marchands)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'merchant') DEFAULT 'merchant',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(64),
    verification_expires DATETIME,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verification_token (verification_token)
);

-- Table des marchands
CREATE TABLE merchants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(500),
    commission_rate DECIMAL(5,4) DEFAULT 0.0250,
    monthly_volume DECIMAL(15,2) DEFAULT 0,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des transactions
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('card', 'paypal', 'bank_transfer') NOT NULL,
    customer_email VARCHAR(255),
    description TEXT,
    metadata JSON,
    processing_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

-- Table des taux de change
CREATE TABLE exchange_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_pair (from_currency, to_currency)
);

-- Insérer des données de test
INSERT INTO users (email, password, role, status) VALUES 
('admin@payment-platform.com', '$2b$12$dummy_hash_for_admin', 'admin', 'active'),
('merchant@test.com', '$2b$12$dummy_hash_for_merchant', 'merchant', 'pending');

INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES 
('EUR', 'USD', 1.0850),
('USD', 'EUR', 0.9217),
('EUR', 'GBP', 0.8621),
('GBP', 'EUR', 1.1599);

-- Index pour optimiser les performances
CREATE INDEX idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
