

import { Router } from "express";
import { signupHandler, loginHandler, RefreshToken, logout, verifyEmailHandler, resendVerificationLinkHandler, forgotPasswordHandler, resetPasswordHandler } from "../controllers/Auth.controller";
import { authMiddleware } from "../middlewares/Auth.middleware";

const router = Router();

router.post('/signup', signupHandler);
router.post('/login', loginHandler); 
router.post('/refresh', RefreshToken);

// Email verification
router.post("/verify-email", verifyEmailHandler);
router.post("/resend-verification", resendVerificationLinkHandler);

// Password reset
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

router.post("/logout", authMiddleware, logout);

export default router;