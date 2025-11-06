const express = require('express');
const messageController = require('../controllers/message.controller');
const protect = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/:chatId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.put('/:id', messageController.updateMessage);
router.delete('/:id', messageController.deleteMessage);
router.patch('/:id/read', messageController.markAsRead);

module.exports = router;

