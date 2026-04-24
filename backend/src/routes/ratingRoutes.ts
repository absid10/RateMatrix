import { Router } from 'express';
import { submitRating, getStoreRatings } from '../controllers/ratingController';
import { ratingValidation } from '../middleware/validate';
import { verifyToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// submit or update a rating - normal users only
router.post('/', verifyToken, authorizeRoles('user'), ratingValidation, submitRating);

// get list of users who rated a store - owner only
router.get('/store/:storeId', verifyToken, authorizeRoles('owner'), getStoreRatings);

export default router;
