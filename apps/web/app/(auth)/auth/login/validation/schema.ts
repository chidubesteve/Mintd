import { z } from 'zod';
import { emailSchema } from '../../validation/schema';

export const loginFormSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
