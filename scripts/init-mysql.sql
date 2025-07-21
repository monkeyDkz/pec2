-- Script d'initialisation MySQL
-- Créer un utilisateur pour l'application avec les bonnes permissions

CREATE USER IF NOT EXISTS 'payment_user'@'%' IDENTIFIED BY 'payment_root_password_2024';
GRANT ALL PRIVILEGES ON payment_platform.* TO 'payment_user'@'%';
FLUSH PRIVILEGES;

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS payment_platform;
USE payment_platform;

-- Afficher les utilisateurs créés
SELECT User, Host FROM mysql.user WHERE User = 'payment_user';
