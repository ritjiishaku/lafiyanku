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
  fullName: fullNameSchema,
  role: z.enum(["doctor", "nurse"]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  });

export const facilityRegisterStep1Schema = z.object({
  facilityName: facilityNameSchema,
  facilityCode: facilityCodeSchema,
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

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const demoRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required.").max(200),
  role: z.string().min(1, "Please select your role."),
  facilityName: z.string().min(1, "Facility name is required.").max(300),
  whatsappNumber: z.string().min(1, "WhatsApp number is required."),
  email: emailSchema,
}).refine((data) => isNigerianPhone(data.whatsappNumber.replace(/\s+/g, "")), {
  message: "Enter a valid Nigerian number (e.g. +2348031234567).",
  path: ["whatsappNumber"],
});

export function isNigerianPhone(value: string): boolean {
  return /^(\+234|0)\d{10}$/.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
