import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// run validation and return errors if any
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}

// --- validation chains ---

export const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters.'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;']/)
    .withMessage('Password must contain at least one special character.'),
  handleValidationErrors,
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors,
];

export const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters.'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;']/)
    .withMessage('Password must contain at least one special character.'),
  body('role')
    .isIn(['admin', 'user', 'owner'])
    .withMessage('Role must be admin, user, or owner.'),
  handleValidationErrors,
];

export const createStoreValidation = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters.'),
  body('owner_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a valid integer.'),
  handleValidationErrors,
];

export const ratingValidation = [
  body('store_id')
    .isInt({ min: 1 })
    .withMessage('Store ID is required.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5.'),
  handleValidationErrors,
];

export const passwordUpdateValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be 8-16 characters long.')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;']/)
    .withMessage('New password must contain at least one special character.')
    .custom((newPassword, { req }) => {
      if (newPassword === req.body.currentPassword) {
        throw new Error('New password must be different from current password.');
      }
      return true;
    }),
  handleValidationErrors,
];
