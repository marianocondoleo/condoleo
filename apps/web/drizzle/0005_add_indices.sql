-- 🟠 FIX 4: Agregar índices para performance
-- Indexar columnas frecuentemente buscadas/filtradas

-- Índices en tabla users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices en tabla solicitudes (búsquedas más frecuentes)
CREATE INDEX IF NOT EXISTS idx_solicitudes_user_id ON solicitudes(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_status ON solicitudes(status);
CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON solicitudes(created_at DESC);

-- Índice compuesto para dashboard admin (filtrar por usuario Y estado)
CREATE INDEX IF NOT EXISTS idx_solicitudes_user_status ON solicitudes(user_id, status);

-- Índices en tabla solicitud_files
CREATE INDEX IF NOT EXISTS idx_solicitud_files_solicitud_id ON solicitud_files(solicitud_id);

-- Índices en tabla addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Índices en tabla products para búsquedas
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Índices en tabla payment_config
CREATE INDEX IF NOT EXISTS idx_payment_config_method ON payment_config(method);
