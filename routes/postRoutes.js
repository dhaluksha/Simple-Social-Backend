const express = require('express');
const router = express.Router();

const PostController = require('../controllers/post');
const AuthHelper = require('../helpers/authHelper');

router.get('/posts', AuthHelper.VerifyToken, PostController.GetAllPosts);
router.get('/post/:id', AuthHelper.VerifyToken, PostController.GetPost);

router.post('/post/add-post', AuthHelper.VerifyToken, PostController.AddPost);
router.post('/post/add-like', AuthHelper.VerifyToken, PostController.AddLike);
router.post('/post/add-comment', AuthHelper.VerifyToken, PostController.AddComment);

router.put('/post/edit-post', AuthHelper.VerifyToken, PostController.EditPost)
router.delete('/post/delete-post/:id', AuthHelper.VerifyToken, PostController.DeletePost)

module.exports = router;