import z from 'zod';
import { emailSchema, passwordSchema } from '../../validation/schema';

export const loginFormSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
