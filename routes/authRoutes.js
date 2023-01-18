const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth');

router.post('/register', AuthController.CreateUser);
router.post('/login', AuthController.LoginUser);

module.exports = router;