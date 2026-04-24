import { Router } from 'express';
import { getStores, getStoreById, createStore } from '../controllers/storeController';
import { createStoreValidation } from '../middleware/validate';
import { verifyToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// listing stores - any authenticated user can view
router.get('/', verifyToken, getStores);

// single store detail - admin
router.get('/:id', verifyToken, authorizeRoles('admin'), getStoreById);

// create store - admin only
router.post('/', verifyToken, authorizeRoles('admin'), createStoreValidation, createStore);

export default router;
