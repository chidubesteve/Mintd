import { Router } from 'express';
import {
    signupHandler,
    loginHandler,
    RefreshToken,
    logout,
    verifyEmailHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
    resendVerificationCodeHandler,
} from '../controllers/Auth.controller';
import { authMiddleware } from '../middlewares/Auth.middleware';
import {
    loginLimiter,
    passwordResetLimiter,
    registerLimiter,
    resendLimiter,
} from '../middlewares/rateLimits';

const router = Router();

router.post('/register', registerLimiter, signupHandler);
router.post('/login', loginLimiter, loginHandler);
router.post('/refresh', RefreshToken);

// Email verification
router.post('/verify-email', verifyEmailHandler);
router.post(
    '/resend-verification',
    resendLimiter,
    resendVerificationCodeHandler,
);

// Password reset
router.post('/forgot-password', passwordResetLimiter, forgotPasswordHandler);
router.post('/reset-password', passwordResetLimiter, resetPasswordHandler);

// Logout can use the refresh cookie even when the access token has expired.
router.post('/logout', logout);

router.get('/session', authMiddleware, (_req, res) => {
    res.set('Cache-Control', 'no-store').status(204).end();
});

export default router;
