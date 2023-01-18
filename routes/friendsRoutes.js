const express = require('express');
const router = express.Router();

const FriendController = require('../controllers/friends');
const AuthHelper = require('../helpers/authHelper');

router.post('/follow-user', AuthHelper.VerifyToken, FriendController.FollowUser);
router.post('/unfollow-user', AuthHelper.VerifyToken, FriendController.UnFollowUser);
router.post('/mark/:id', AuthHelper.VerifyToken, FriendController.MarkNotification);
router.post('/mark-all', AuthHelper.VerifyToken, FriendController.MarkAllNotifications);

module.exports = router;