require('dotenv').config();
const Joi = require("joi");
const cloudinary = require("cloudinary");
const moment = require("moment");
const request = require("request");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const Post = require("../models/postModels");
const User = require("../models/userModel");

module.exports = {
  // Add Post
  AddPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required(),
      // image: Joi.string().optional()
    });
    const body = {
      post: req.body.post,
    };
    let { error } = schema.validate(body);
    if (error && error.details) {
      return res.status(500).json({ msg: error.details });
    }
    const bodyPost = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date(),
    };
    if (req.body.post && !req.body.image) {
      Post.create(bodyPost)
        .then(async (post) => {
          await User.update(
            {
              _id: req.user._id,
            },
            {
              $push: {
                posts: {
                  postId: post._id,
                  post: req.body.post,
                  created: new Date(),
                },
              },
            }
          );
          res.status(200).json({ message: "Post Created", post });
        })
        .catch((err) => {
          res.status(500).json({ message: "Error occured" });
        });
    }

    if (req.body.post && req.body.image) {
      cloudinary.uploader.upload(req.body.image, async (result) => {
        // console.log(result);
        const reqBody = {
          user: req.user._id,
          username: req.user.username,
          post: req.body.post,
          imgId: result.public_id,
          imgVersion: result.version,
          created: new Date(),
        };
        Post.create(reqBody)
          .then(async (post) => {
            await User.update(
              {
                _id: req.user._id,
              },
              {
                $push: {
                  posts: {
                    postId: post._id,
                    post: req.body.post,
                    created: new Date(),
                  },
                },
              }
            );
            res.status(200).json({ message: "Post Created", post });
          })
          .catch((err) => {
            res.status(500).json({ message: "Error occured" });
          });
      });
    }
  },

  // get all posts
  async GetAllPosts(req, res) {
    try {
      const today = moment().startOf("day");
      const tomorrow = moment(today).add(1, "days");

      const posts = await Post.find({
        // created: { $gte: today.toDate(), $lt: tomorrow.toDate() },
      })
        .populate("user")
        .sort({ created: -1 });

      const top = await Post.find({
        totalLikes: { $gte: 2 },
        created: { $gte: today.toDate(), $lt: tomorrow.toDate() }, // lt - less than
      }) // gte - gtreter than equal
        .populate("user")
        .sort({ created: -1 });

      const user = await User.findOne({ _id: req.user._id });
      if (!user.city && !user.country) {
        request(
          "http://geolocation-db.com/json/",
          { json: true },
          async (err, res, body) => {
            // console.log(body);
            await User.update(
              {
                _id: req.user._id,
              },
              {
                city: body.city,
                country: body.country_name,
              }
            );
          }
        );
      }

      return res.status(200).json({ message: "All posts", posts, top });
    } catch (err) {
      return res.status(500).json({ message: "Error Occured", posts });
    }
  },

  // Add Like
  async AddLike(req, res) {
    const postId = req.body._id;
    await Post.update(
      {
        _id: postId,
        "likes.username": { $ne: req.user.username },
      },
      {
        $push: {
          likes: {
            username: req.user.username,
          },
        },
        $inc: { totalLikes: 1 },
      }
    )
      .then(() => {
        res.status(200).json({ message: "You liked the post" });
      })
      .catch((err) => {
        res.status(500).json({ message: "error occurred" });
      });
  },
  // Add Comment
  async AddComment(req, res) {
    const postId = req.body.postId;
    await Post.update(
      {
        _id: postId,
      },
      {
        $push: {
          comments: {
            userId: req.user._id,
            username: req.user.username,
            comment: req.body.comment,
            createdAt: new Date(),
          },
        },
      }
    )
      .then(() => {
        res.status(200).json({ message: "Comment added to post" });
      })
      .catch((err) => {
        res.status(500).json({ message: "error occurred!" });
      });
  },

  // Get Post
  async GetPost(req, res) {
    await Post.findOne({ _id: req.params.id })
      .populate("user")
      .populate("comments.userId")
      .then((post) => {
        res.status(200).json({ message: "Post Found", post });
      })
      .catch((err) =>
        res.status(404).json({ message: "Post Not Found", post })
      );
  },

  // EditPost
  EditPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required(),
      id: Joi.string().optional(),
    });
    let { error } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(500).json({ msg: error.details });
    }
    const body = {
      post: req.body.post,
      created: new Date(),
    };

    Post.findOneAndUpdate({ _id: req.body.id }, body, { new: true })
      .then((post) => {
        res.status(200).json({ message: "Post updated successfully", post });
      })
      .catch((err) => {
        return res.status(403).json({ message: "Not Updated", err });
      });
  },
  // DeletePost
  async DeletePost(req, res){
    try {
      const {id} = req.params;
      const result = await Post.findByIdAndRemove(id);
      console.log(result);
      if(!result) {
        return res.status(404).json({message: 'Could not delete post'})
      } else {
        await User.updateOne({
          _id: req.user._id,
        }, {
          $pull: {
            posts: {
              postId: result._id,
            }
          }
        });
        return res.status(200).json({message: 'Post deleted successfully', result})
      }
    } catch (error) {
      return res.status(403).json({ message: error });
    }
  }
};
