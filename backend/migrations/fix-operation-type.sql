-- Migration pour corriger le type d'opération
-- Ajouter 'payment' comme type d'opération valide

ALTER TABLE operations 
MODIFY COLUMN type ENUM('payment', 'capture', 'refund') NOT NULL;
