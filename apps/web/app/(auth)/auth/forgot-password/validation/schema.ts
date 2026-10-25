import { z } from 'zod';
import { emailSchema } from '../../validation/schema';

export const forgotPasswordFormSchema = z.object({ email: emailSchema });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
