const { Router } = require('express');

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { avatarUpload } = require('../middlewares/uploadMiddleware');

const router = Router();

// Auth routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', authMiddleware, userController.logoutUser);
router.post('/logoutAll', authMiddleware, userController.logoutAllUser);

// Confirmation routes
router.post('/password-reset', userController.askResetPassword);
router.patch('/password-reset/:token', userController.resetPassword);
router.get('/emailConfirmation/:token', userController.emailConfirmation);

// Profile routes
router.get('/', authMiddleware, userController.getUserProfil);
router.patch('/', authMiddleware, userController.editUserProfil);
router.patch('/email', authMiddleware, userController.editUserEmail);
router.patch('/password', authMiddleware, userController.editUserPassword);
router.delete('/', authMiddleware, userController.deleteUser);

// Avatar routes
router.get('/:id/avatar', userController.getAvatar);
router.get('/avatar', authMiddleware, userController.getUserAvatar);
router.post('/avatar', authMiddleware, avatarUpload, userController.postAvatar)
router.delete('/avatar', authMiddleware, userController.deleteAvatar);

module.exports = router;
