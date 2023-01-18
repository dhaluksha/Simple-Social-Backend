const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user');
const AuthHelper = require('../helpers/authHelper');

router.get('/users', AuthHelper.VerifyToken, UserController.GetAllUsers);
router.get('/user/:id', AuthHelper.VerifyToken, UserController.GetUser);
router.get('/username/:username', AuthHelper.VerifyToken, UserController.GetUserByname);

router.post('/user/view-profile', AuthHelper.VerifyToken, UserController.ProfileView);
router.post('/change-password', AuthHelper.VerifyToken, UserController.ChangePassword);

module.exports = router;