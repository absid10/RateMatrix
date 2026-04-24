import { Router } from 'express';
import { getUsers, getUserById, createUser } from '../controllers/userController';
import { createUserValidation } from '../middleware/validate';
import { verifyToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// all user routes require admin access
router.use(verifyToken, authorizeRoles('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, createUser);

export default router;
