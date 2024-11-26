import { Router } from 'express';
import * as userController from '../controllers/userController.mjs';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated.mjs';

const router = Router();

router.get('/login', userController.showLoginForm);
router.post('/login', userController.handleLogin);
router.get('/register', userController.showRegisterForm);
router.post('/register', userController.handleRegister);
router.get('/logout', userController.logout);

router.get('/dashboard', ensureAuthenticated, userController.dashboard);

export default router;
