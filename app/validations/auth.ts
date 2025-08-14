import { z } from 'zod';

export const signInSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long')
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Name is too long'),
        email: z.string().min(1, 'Email is required').email('Invalid email'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password is too long'),
        confirmPassword: z.string().min(1, 'Confirm your password')
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: "Passwords don't match"
    });

export type SignUpInput = z.infer<typeof signUpSchema>;
