import { z } from 'zod';

// Schéma pour le rôle utilisateur
export const RoleSchema = z.enum(['enseignant', 'admin'], {
  errorMap: () => ({ message: "Le rôle doit être 'enseignant' ou 'admin'" })
});

// Schéma pour le jour de la semaine
export const JourSemaineSchema = z.enum(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'], {
  errorMap: () => ({ message: "Le jour doit être un jour de semaine valide (Lundi à Vendredi)" })
});

// Schéma pour un utilisateur
export const UserSchema = z.object({
  id: z.string().uuid({ message: "L'ID doit être un UUID valide" }),
  prenom: z.string()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .trim(),
  nom: z.string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .trim(),
  email: z.string()
    .email("L'email doit être valide")
    .toLowerCase()
    .trim(),
  role: RoleSchema,
});

// Schéma pour créer un utilisateur (sans ID car généré par la DB)
export const CreateUserSchema = UserSchema.omit({ id: true }).extend({
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
    .optional(),
});

// Schéma pour mettre à jour un utilisateur
export const UpdateUserSchema = UserSchema.partial().omit({ id: true });

// Schéma pour une filière
export const FiliereSchema = z.object({
  id: z.string().uuid({ message: "L'ID doit être un UUID valide" }),
  nom: z.string()
    .min(1, "Le nom de la filière est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),
});

// Schéma pour créer une filière
export const CreateFiliereSchema = FiliereSchema.omit({ id: true });

// Schéma pour un créneau
export const CreneauSchema = z.object({
  id: z.string().uuid({ message: "L'ID doit être un UUID valide" }),
  jour_semaine: JourSemaineSchema,
  heure_debut: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  heure_fin: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
}).refine(
  (data) => {
    const [debutH, debutM] = data.heure_debut.split(':').map(Number);
    const [finH, finM] = data.heure_fin.split(':').map(Number);
    const debut = debutH * 60 + debutM;
    const fin = finH * 60 + finM;
    return fin > debut;
  },
  {
    message: "L'heure de fin doit être après l'heure de début",
    path: ['heure_fin'],
  }
);

// Schéma pour créer un créneau
export const CreateCreneauSchema = CreneauSchema.omit({ id: true });

// Schéma pour une réservation
export const ReservationSchema = z.object({
  id: z.string().uuid({ message: "L'ID doit être un UUID valide" }),
  utilisateur_id: z.string().uuid({ message: "L'ID utilisateur doit être un UUID valide" }),
  filiere_id: z.string().uuid({ message: "L'ID filière doit être un UUID valide" }),
  creneau_id: z.string().uuid({ message: "L'ID créneau doit être un UUID valide" }),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Le format de date doit être YYYY-MM-DD")
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      { message: "La date ne peut pas être dans le passé" }
    ),
  titre_module: z.string()
    .min(1, "Le titre du module est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères")
    .trim(),
  description: z.string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .trim(),
  axe_pedagogique: z.string()
    .max(200, "L'axe pédagogique ne peut pas dépasser 200 caractères")
    .trim()
    .optional(),
  salle: z.string()
    .max(50, "Le nom de la salle ne peut pas dépasser 50 caractères")
    .trim()
    .optional(),
});

// Schéma pour créer une réservation
export const CreateReservationSchema = ReservationSchema.omit({ id: true });

// Schéma pour mettre à jour une réservation (tous les champs optionnels sauf ID)
export const UpdateReservationSchema = ReservationSchema.partial().omit({
  id: true,
  utilisateur_id: true, // Ne peut pas changer l'utilisateur
  filiere_id: true, // Ne peut pas changer la filière
  creneau_id: true, // Ne peut pas changer le créneau
  date: true, // Ne peut pas changer la date
});

// Schéma pour le formulaire de login
export const LoginSchema = z.object({
  email: z.string()
    .email("L'email doit être valide")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, "Le mot de passe est requis"),
});

// Types TypeScript dérivés des schémas Zod
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type Filiere = z.infer<typeof FiliereSchema>;
export type CreateFiliere = z.infer<typeof CreateFiliereSchema>;

export type Creneau = z.infer<typeof CreneauSchema>;
export type CreateCreneau = z.infer<typeof CreateCreneauSchema>;

export type Reservation = z.infer<typeof ReservationSchema>;
export type CreateReservation = z.infer<typeof CreateReservationSchema>;
export type UpdateReservation = z.infer<typeof UpdateReservationSchema>;

export type LoginCredentials = z.infer<typeof LoginSchema>;

// Fonction utilitaire pour valider les données avec des messages d'erreur formatés
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T
} | {
  success: false;
  errors: { field: string; message: string }[]
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return { success: false, errors };
}

// Fonction pour obtenir des messages d'erreur lisibles
export function getErrorMessages(errors: z.ZodError): string[] {
  return errors.errors.map(err => {
    const field = err.path.join('.');
    return field ? `${field}: ${err.message}` : err.message;
  });
}
