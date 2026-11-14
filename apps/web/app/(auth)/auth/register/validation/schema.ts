import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../validation/schema';

export const registerFormSchema = z
    .object({
        firstName: z
            .string()
            .min(1, 'First name is required')
            .max(50, 'First name must be less than 50 characters'),
        lastName: z
            .string()
            .min(1, 'Last name is required')
            .max(50, 'Last name must be less than 50 characters'),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
