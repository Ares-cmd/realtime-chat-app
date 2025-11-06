const express = require('express');
const userController = require('../controllers/user.controller');
const protect = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', userController.getUsers);
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.put('/profile', userController.updateProfile);

module.exports = router;

