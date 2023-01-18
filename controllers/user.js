const User = require("../models/userModel");
const moment = require("moment");
const Joi = require("joi");
const bcrypt = require("bcrypt");

module.exports = {
  async GetAllUsers(req, res) {
    await User.find({})
      .populate("posts.postId")
      .populate("following.userFollowed")
      .populate("followers.follower")
      .populate("chatList.receiverId")
      .populate("chatList.msgId")
      .populate("notifications.senderId")
      .then((result) => {
        res.status(200).json({ message: "All Users", result });
      })
      .catch((err) => {
        res.status(500).json({ message: "Error occured" });
      });
  },
  async GetUser(req, res) {
    await User.findOne({ _id: req.params.id })
      .populate("posts.postId")
      .populate("following.userFollowed")
      .populate("followers.follower")
      .populate("chatList.receiverId")
      .populate("chatList.msgId")
      .populate("notifications.senderId")
      .then((result) => {
        res.status(200).json({ message: "User by id", result });
      })
      .catch((err) => {
        res.status(500).json({ message: "Error occured" });
      });
  },
  async GetUserByname(req, res) {
    await User.findOne({ username: req.params.username })
      .populate("posts.postId")
      .populate("following.userFollowed")
      .populate("followers.follower")
      .populate("chatList.receiverId")
      .populate("chatList.msgId")
      .populate("notifications.senderId")
      .then((result) => {
        res.status(200).json({ message: "User by username", result });
      })
      .catch((err) => {
        res.status(500).json({ message: "Error occured" });
      });
  },

  // ProfileView
  async ProfileView(req, res) {
    const dateValue = moment().format("YYYY-MM-DD");
    await User.update(
      {
        _id: req.body.id,
        "notifications.date": { $ne: [dateValue, ""] },
        "notifications.senderId": { $ne: req.user._id },
      },
      {
        $push: {
          notifications: {
            senderId: req.user._id,
            message: `${req.user.username} viewed your profile`,
            created: new Date(),
            date: dateValue,
            viewProfile: true,
          },
        },
      }
    )
      .then((result) => {
        res.status(200).json({ message: "Notification sent", result });
      })
      .catch((err) => {
        res.status(500).json({ message: "Error occured" });
      });
  },
  // ChangePassword
  async ChangePassword(req, res) {
    const schema = Joi.object().keys({
      cpassword: Joi.string().required(),

      newPassword: Joi.string().min(5).required(),
      confirmPassword: Joi.string().min(5).optional(),
    });

    let { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(500).json({ msg: error.details });
    }
    const user = await User.findOne({_id: req.user._id})
    return bcrypt.compare(value.cpassword, user.password).then( async (result) => {
        if(!result){
            return res.status(500).json({message: 'Current password is incorrect'})
        }
        const newpassword = await User.EncryptPassword(req.body.newPassword);
        await User.update({
            _id: req.user._id
        },
        {
            password: newpassword
        })
        .then(() => {
            res.status(200).json({ message: "password changed successfully" });
          })
          .catch((err) => {
            res.status(500).json({ message: "Error occured" });
          });
    })
    
  },
};
