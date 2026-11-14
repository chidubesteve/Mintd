import { z } from 'zod';
import { passwordSchema } from '../../validation/schema';

export const resetPasswordFormSchema = z
    .object({ password: passwordSchema, confirmPassword: z.string() })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
