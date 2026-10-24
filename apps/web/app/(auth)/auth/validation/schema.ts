import { z } from 'zod';

export const emailSchema = z
    .string()
    .trim()
    .max(254, 'Email must be 254 characters or fewer')
    .email('Enter a valid email address');

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be 32 characters or fewer')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
    );
