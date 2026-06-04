import { z } from "zod";

export const emailSchema = z.string().email("Please provide a valid email address.").max(255);

export const uuidSchema = z.string().uuid("Invalid ID format.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128);

export const roleSchema = z.enum(["doctor", "nurse", "admin"]);

export const fullNameSchema = z.string().min(1, "Full name is required.").max(200);

export const facilityNameSchema = z.string().min(1, "Facility name is required.").max(300);

export const facilityCodeSchema = z.string().max(50).optional().nullable();

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  role: z.enum(["doctor", "nurse"]),
});

export const facilityRegisterSchema = z.object({
  facilityName: facilityNameSchema,
  facilityCode: facilityCodeSchema,
  adminName: fullNameSchema,
  adminEmail: emailSchema,
  adminPassword: passwordSchema,
  adminConfirmPassword: passwordSchema,
}).refine((data) => data.adminPassword === data.adminConfirmPassword, {
  message: "Passwords do not match.",
  path: ["adminConfirmPassword"],
});

export const clinicianUpdateSchema = z.object({
  fullName: fullNameSchema.optional(),
  role: z.enum(["doctor", "nurse", "admin"]).optional(),
  password: passwordSchema.optional(),
});
