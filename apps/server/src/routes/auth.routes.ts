

import { Router } from "express";
import { signupHandler, loginHandler, RefreshToken, logout, verifyEmailHandler,  forgotPasswordHandler, resetPasswordHandler, resendVerificationCodeHandler } from "../controllers/Auth.controller";
import { authMiddleware } from "../middlewares/Auth.middleware";
import { loginLimiter, passwordResetLimiter, registerLimiter, resendLimiter } from "../middlewares/rateLimits";

const router = Router();

router.post('/register', registerLimiter, signupHandler);
router.post('/login', loginLimiter, loginHandler); 
router.post('/refresh', RefreshToken);

// Email verification
router.post("/verify-email", verifyEmailHandler);
router.post("/resend-verification", resendLimiter, resendVerificationCodeHandler);

// Password reset
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", passwordResetLimiter, resetPasswordHandler);

router.post("/logout", authMiddleware, logout);

export default router;