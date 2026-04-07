-- 🟠 FIX 10: Migrar payment_method de ENUM a TEXT
-- Esto permite agregar métodos de pago (Stripe, MercadoPago) en el futuro sin downtime

-- Paso 1: Crear nueva columna temporal como TEXT
ALTER TABLE payment_config ADD COLUMN method_text TEXT;

-- Paso 2: Copiar datos del enum a la columna temporal
UPDATE payment_config SET method_text = method::text;

-- Paso 3: Hacer la columna nueva NOT NULL y con default
ALTER TABLE payment_config ALTER COLUMN method_text SET NOT NULL;
ALTER TABLE payment_config ALTER COLUMN method_text SET DEFAULT 'transferencia';

-- Paso 4: Eliminar la columna enum antigua
ALTER TABLE payment_config DROP COLUMN method;

-- Paso 5: Renombrar la columna temporal al nombre original
ALTER TABLE payment_config RENAME COLUMN method_text TO method;

-- Paso 6: Eliminar el tipo enum si no se usa en otro lado
DROP TYPE IF EXISTS payment_method;
