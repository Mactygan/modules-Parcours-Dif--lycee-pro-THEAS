# Recommandations Row Level Security (RLS) pour Supabase

Ce document détaille les politiques de sécurité Row Level Security (RLS) à implémenter dans Supabase pour sécuriser l'application de gestion de modules de formation.

## Pourquoi RLS ?

Row Level Security permet de définir des règles de sécurité au niveau de la base de données plutôt que dans le code de l'application. Cela offre :
- **Sécurité multicouche** : Protection même si le code frontend est compromis
- **Performance** : Filtrage au niveau DB plutôt qu'applicatif
- **Maintenance** : Règles centralisées et auditables

---

## 1. Table `users` (Utilisateurs)

### Activer RLS
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Politiques

#### Lecture : Tous les utilisateurs authentifiés peuvent voir tous les utilisateurs
```sql
CREATE POLICY "Users can view all users"
ON users FOR SELECT
TO authenticated
USING (true);
```

#### Lecture : Utilisateurs publics (pour lookup lors du login)
```sql
CREATE POLICY "Allow auth to read users"
ON users FOR SELECT
TO anon
USING (true);
```

#### Création : Seul le système peut créer des utilisateurs lors de l'inscription
```sql
CREATE POLICY "Users can be created during signup"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

#### Modification : Les utilisateurs peuvent modifier leur propre profil OU les admins peuvent modifier tous les profils
```sql
CREATE POLICY "Users can update own profile or admins can update any"
ON users FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

#### Suppression : Seuls les admins peuvent supprimer des utilisateurs
```sql
CREATE POLICY "Only admins can delete users"
ON users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 2. Table `filieres` (Filières)

### Activer RLS
```sql
ALTER TABLE filieres ENABLE ROW LEVEL SECURITY;
```

### Politiques

#### Lecture : Tous les utilisateurs authentifiés peuvent voir toutes les filières
```sql
CREATE POLICY "All authenticated users can view filieres"
ON filieres FOR SELECT
TO authenticated
USING (true);
```

#### Création/Modification/Suppression : Seuls les admins
```sql
CREATE POLICY "Only admins can manage filieres"
ON filieres FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 3. Table `creneaux` (Créneaux horaires)

### Activer RLS
```sql
ALTER TABLE creneaux ENABLE ROW LEVEL SECURITY;
```

### Politiques

#### Lecture : Tous les utilisateurs authentifiés peuvent voir tous les créneaux
```sql
CREATE POLICY "All authenticated users can view creneaux"
ON creneaux FOR SELECT
TO authenticated
USING (true);
```

#### Création/Modification/Suppression : Seuls les admins
```sql
CREATE POLICY "Only admins can manage creneaux"
ON creneaux FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 4. Table `reservations` (Réservations)

### Activer RLS
```sql
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
```

### Politiques

#### Lecture : Tous les utilisateurs authentifiés peuvent voir toutes les réservations
```sql
CREATE POLICY "All authenticated users can view reservations"
ON reservations FOR SELECT
TO authenticated
USING (true);
```

#### Création : Les utilisateurs peuvent créer des réservations pour eux-mêmes
```sql
CREATE POLICY "Users can create their own reservations"
ON reservations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = utilisateur_id);
```

**IMPORTANT** : Ajouter une contrainte UNIQUE pour éviter les doublons de réservation
```sql
CREATE UNIQUE INDEX unique_reservation_per_slot
ON reservations(creneau_id, date, filiere_id);
```

#### Modification : Les utilisateurs peuvent modifier leurs propres réservations OU les admins peuvent modifier toutes les réservations
```sql
CREATE POLICY "Users can update own reservations or admins can update any"
ON reservations FOR UPDATE
TO authenticated
USING (
  auth.uid() = utilisateur_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

#### Suppression : Les utilisateurs peuvent supprimer leurs propres réservations OU les admins peuvent supprimer toutes les réservations
```sql
CREATE POLICY "Users can delete own reservations or admins can delete any"
ON reservations FOR DELETE
TO authenticated
USING (
  auth.uid() = utilisateur_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 5. Fonctions utiles

### Fonction pour vérifier le rôle admin
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Utilisation dans les politiques :
```sql
CREATE POLICY "Admin only action"
ON table_name FOR ALL
TO authenticated
USING (is_admin());
```

---

## 6. Triggers et validations

### Validation des créneaux : empêcher les réservations passées
```sql
CREATE OR REPLACE FUNCTION validate_reservation_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot create reservation for past dates';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_reservation_date
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION validate_reservation_date();
```

### Auto-remplissage de created_at et updated_at
```sql
-- Pour created_at
ALTER TABLE reservations
ALTER COLUMN created_at SET DEFAULT NOW();

-- Pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 7. Vérification des politiques

### Script de test pour vérifier que les politiques fonctionnent
```sql
-- Se connecter en tant qu'utilisateur enseignant
SET LOCAL "request.jwt.claims" = '{"sub": "user-id-enseignant", "role": "authenticated"}';

-- Tenter de voir toutes les réservations (devrait fonctionner)
SELECT * FROM reservations;

-- Tenter de supprimer une réservation d'un autre utilisateur (devrait échouer)
DELETE FROM reservations WHERE utilisateur_id != 'user-id-enseignant';

-- Tenter de créer une réservation pour un autre utilisateur (devrait échouer)
INSERT INTO reservations (utilisateur_id, ...) VALUES ('autre-user-id', ...);
```

---

## 8. Monitoring et audit

### Créer une table d'audit pour les actions critiques
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour audit des suppressions
CREATE OR REPLACE FUNCTION audit_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
  VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_reservations_delete
AFTER DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION audit_delete();
```

---

## 9. Checklist de déploiement

Avant de passer en production, vérifier :

- [ ] Toutes les tables ont RLS activé
- [ ] Chaque table a des politiques pour SELECT, INSERT, UPDATE, DELETE
- [ ] Les contraintes UNIQUE sont en place pour éviter les doublons
- [ ] Les triggers de validation sont actifs
- [ ] Les fonctions utilitaires sont créées
- [ ] Les politiques ont été testées avec différents rôles
- [ ] Un système d'audit est en place
- [ ] Les indexes sont créés sur les colonnes fréquemment interrogées

---

## 10. Commandes utiles

### Voir toutes les politiques d'une table
```sql
SELECT * FROM pg_policies WHERE tablename = 'reservations';
```

### Désactiver temporairement RLS (DANGER - DEV SEULEMENT)
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Tester en tant qu'utilisateur spécifique
```sql
-- Dans psql
SET ROLE postgres; -- revenir au superuser
```

---

## Ressources

- [Documentation officielle Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

## Contact et Support

Pour toute question sur l'implémentation de ces politiques, consulter :
- La documentation Supabase
- L'équipe de développement
- Les logs d'audit en cas de problème
