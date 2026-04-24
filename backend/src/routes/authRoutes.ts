import { Router } from 'express';
import { signup, login, updatePassword } from '../controllers/authController';
import { signupValidation, loginValidation, passwordUpdateValidation } from '../middleware/validate';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.put('/password', verifyToken, passwordUpdateValidation, updatePassword);

export default router;
