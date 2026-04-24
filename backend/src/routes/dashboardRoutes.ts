import { Router } from 'express';
import { adminDashboard, ownerDashboard } from '../controllers/dashboardController';
import { verifyToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/admin', verifyToken, authorizeRoles('admin'), adminDashboard);
router.get('/owner', verifyToken, authorizeRoles('owner'), ownerDashboard);

export default router;
