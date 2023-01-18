const express = require('express');
const router = express.Router();

const MessageController = require('../controllers/messages');
const AuthHelper = require('../helpers/authHelper');

router.get('/chat-messages/:sender_Id/:receiver_Id', AuthHelper.VerifyToken, MessageController.GetAllMessages);
router.get('/receiver-messages/:sender/:receiver', AuthHelper.VerifyToken, MessageController.MarkReceiverMessages);
router.post('/chat-messages/:sender_Id/:receiver_Id', AuthHelper.VerifyToken, MessageController.SendMessage);

module.exports = router;