// middleware/rateLimits.ts
import rateLimit from 'express-rate-limit';

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        message: 'Too many registrations from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const resendLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: { message: 'Too many requests, please try again shortly' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 1 minutes
    max: 5,
    message: { message: 'Too many password reset requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});