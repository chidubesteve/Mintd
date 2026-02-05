

import { Router } from "express";
import { signupHandler, loginHandler, RefreshToken, logout } from "../controllers/Auth.controller";
import { authMiddleware } from "../middlewares/Auth.middleware";

const router = Router();

router.post('/signup', signupHandler);
router.post('/login', loginHandler); 
router.post('/refresh', RefreshToken);


router.post("/logout", authMiddleware, logout);

export default router;