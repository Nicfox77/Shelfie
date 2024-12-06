import { Router } from 'express';
import * as loginController from '../controllers/loginController.mjs';

const router = Router();

router.get('/login', loginController.showLoginForm);
router.post('/login', loginController.login);
router.get('/register', loginController.showRegisterForm);
router.post('/register', loginController.register);
router.get('/logout', loginController.logout);
router.get("/password-reset", loginController.showPasswordResetForm);
router.post("/password-reset", loginController.requestPasswordReset);

export default router;
