import { Router } from "express";
import { login, refresh, register } from "../controller/auth.controller";
import { verifyToken } from "../middleware/jwt.middleware";
import { ENDPOINTS } from "../enums/options.enum";

const router = Router();

router.post(ENDPOINTS.REGISTER, register);
router.post(ENDPOINTS.LOGIN, login);
router.post(ENDPOINTS.REFRESH, verifyToken, refresh)

export default router;