-- Migration: Standardize user schema to use French field names
-- Date: 2025-11-18
-- Description: Renames first_name/last_name to prenom/nom for consistency with application code

-- This migration addresses the mismatch between database fields (first_name, last_name)
-- and application types (prenom, nom)

-- 1. Add new columns with correct names
ALTER TABLE users
ADD COLUMN IF NOT EXISTS prenom TEXT,
ADD COLUMN IF NOT EXISTS nom TEXT;

-- 2. Copy existing data to new columns
UPDATE users
SET
  prenom = COALESCE(first_name, ''),
  nom = COALESCE(last_name, '')
WHERE prenom IS NULL OR nom IS NULL;

-- 3. Make new columns NOT NULL after data migration
ALTER TABLE users
ALTER COLUMN prenom SET NOT NULL,
ALTER COLUMN nom SET NOT NULL;

-- 4. Drop old columns (optional - comment out if you want to keep them temporarily)
-- WARNING: Only run this after verifying the migration worked correctly
-- ALTER TABLE users
-- DROP COLUMN IF EXISTS first_name,
-- DROP COLUMN IF EXISTS last_name;

-- 5. Add comments for documentation
COMMENT ON COLUMN users.prenom IS 'Prénom de l''utilisateur (first name)';
COMMENT ON COLUMN users.nom IS 'Nom de famille de l''utilisateur (last name)';

-- 6. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_prenom ON users(prenom);
CREATE INDEX IF NOT EXISTS idx_users_nom ON users(nom);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 7. Update any existing triggers or functions that reference old column names
-- (Add specific updates here based on your database functions)

-- 8. Create a view for backward compatibility (optional)
-- This allows old code to still work while transitioning
CREATE OR REPLACE VIEW users_legacy AS
SELECT
  id,
  prenom AS first_name,
  nom AS last_name,
  email,
  role,
  created_at,
  updated_at
FROM users;

COMMENT ON VIEW users_legacy IS 'Vue de compatibilité pour l''ancien schéma (à supprimer après migration complète)';
