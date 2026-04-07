-- Remover mercadopago del enum payment_method
-- Cambiar tipo de enum de "mercadopago", "transferencia" a solo "transferencia"

-- Drop la columna mpPaymentId de payments table
ALTER TABLE payments DROP COLUMN mp_payment_id;

-- Crear nuevo tipo de enum
CREATE TYPE payment_method_new AS ENUM('transferencia');

-- Cambiar la columna method para usar el nuevo enum
ALTER TABLE payment_config 
ALTER COLUMN method TYPE payment_method_new USING method::text::payment_method_new;

-- Remover el enum viejo
DROP TYPE payment_method;

-- Renombrar el nuevo tipo al original
ALTER TYPE payment_method_new RENAME TO payment_method;
