-- Migration: Add constraints to prevent duplicate reservations
-- Date: 2025-11-18
-- Description: Adds UNIQUE constraint to prevent multiple reservations for the same slot

-- 1. Add UNIQUE constraint to prevent duplicate reservations
-- This ensures that only one reservation can exist for a specific creneau, date, and filiere combination
CREATE UNIQUE INDEX IF NOT EXISTS unique_reservation_per_slot
ON reservations(creneau_id, date, filiere_id)
WHERE deleted_at IS NULL; -- If you implement soft deletes

-- Alternative without soft deletes:
-- CREATE UNIQUE INDEX IF NOT EXISTS unique_reservation_per_slot
-- ON reservations(creneau_id, date, filiere_id);

-- 2. Add check constraint to prevent reservations in the past
ALTER TABLE reservations
ADD CONSTRAINT check_reservation_not_in_past
CHECK (date >= CURRENT_DATE);

-- 3. Add trigger to validate reservation date before insert/update
CREATE OR REPLACE FUNCTION validate_reservation_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the reservation date is not in the past
  IF NEW.date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot create or update reservation for past dates (date: %)', NEW.date;
  END IF;

  -- Ensure created_at is set
  IF NEW.created_at IS NULL THEN
    NEW.created_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_reservation_date ON reservations;

-- Create the trigger
CREATE TRIGGER check_reservation_date
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION validate_reservation_date();

-- 4. Add updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;

-- Create the trigger
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_utilisateur_id ON reservations(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_reservations_filiere_id ON reservations(filiere_id);
CREATE INDEX IF NOT EXISTS idx_reservations_creneau_id ON reservations(creneau_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- 6. Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_reservations_date_filiere ON reservations(date, filiere_id);

-- Comment on constraints
COMMENT ON INDEX unique_reservation_per_slot IS 'Ensures only one reservation per time slot, date, and filiere';
COMMENT ON CONSTRAINT check_reservation_not_in_past ON reservations IS 'Prevents creating reservations for past dates';
