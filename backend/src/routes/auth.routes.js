import express from 'express';
import {
    login,
    registerStaff,
    registerCustomer,
    refreshToken,
    logout,
    getCurrentUser,
    getAllUsers,
    changePassword,
    updateProfile,
    updateLocation,
    requestPasswordReset,
    verifyEmail,
    resendVerificationEmail,
    resetPassword,
    toggleUserStatus
} from '../controllers/auth.controller.js';
import {
    verifyToken,
    verifyRefreshToken,
    requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/request-forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/register-customer', registerCustomer);

// Protected routes
router.post('/register-staff', verifyToken, requireRole('admin'), registerStaff);
router.post('/refresh', verifyRefreshToken, refreshToken);
router.get('/me', verifyToken, getCurrentUser);
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.post('/change-password', verifyToken, changePassword);
router.put('/update-profile', verifyToken, updateProfile);
router.patch('/update-location', verifyToken, requireRole('customer'), updateLocation);
router.patch('/toggle-status/:id', verifyToken, requireRole('admin'), toggleUserStatus);

export default router;
