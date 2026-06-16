import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(8, "Au moins 8 caractères"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    lastName: z.string().min(2, "Nom requis"),
    firstName: z.string().min(2, "Prénom requis"),
    phone: z.string().min(8, "Téléphone requis"),
    country: z.string().min(2, "Pays requis"),
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
    acceptTerms: z.boolean().refine((v) => v, { message: "Vous devez accepter les conditions d'utilisation" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const resetSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});
export type ResetInput = z.infer<typeof resetSchema>;

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional().or(z.literal("")),
  bio: z.string().max(280).optional().or(z.literal("")),
  preferredLocale: z.enum(["fr", "en"]),
});
export type ProfileInput = z.infer<typeof profileSchema>;
