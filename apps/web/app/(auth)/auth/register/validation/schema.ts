import z from "zod";

export const registerFormSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(
            /[^A-Za-z0-9]/, // regex to check for at least one special character - which is any character that is not a letter or number and has more coverage than just checking for specific special characters like !@#$%^&*() 
            'Password must contain at least one special character',
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",   
    path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;