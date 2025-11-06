const express = require('express');
const chatController = require('../controllers/chat.controller');
const protect = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', chatController.getChats);
router.post('/', chatController.createChat);
router.get('/:id', chatController.getChatById);
router.delete('/:id', chatController.deleteChat);
router.post('/:id/members', chatController.addMembers);
router.delete('/:id/members/:userId', chatController.removeMember);

module.exports = router;

