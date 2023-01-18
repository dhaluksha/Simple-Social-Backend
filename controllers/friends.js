const User = require("../models/userModel");

module.exports = {
  FollowUser(req, res) {
    const followUser = async () => {
      await User.update(
        {
          _id: req.user._id,
          "following.userFollowed": { $ne: req.body.userFollowed },
        },
        {
          $push: {
            following: {
              userFollowed: req.body.userFollowed,
            },
          },
        }
      );
      await User.update(
        {
          _id: req.body.userFollowed,
          "following.follower": { $ne: req.user._id },
        },
        {
          $push: {
            followers: {
              follower: req.user._id,
            },
            notifications: {
              senderId: req.user._id,
              message: `${req.user.username} is now following you.`,
              created: new Date(),
              viewProfile: false,
            },
          },
        }
      );
    };
    followUser()
      .then(() => {
        res.status(200).json({ message: "Following user now" });
      })
      .catch((err) => {
        res.status(500).json({ message: "Error occured" });
      });
  },

  //Unfollow user

  UnFollowUser(req, res) {
    const unfollowUser = async () => {
      await User.update(
        {
          _id: req.user._id,
        },
        {
          $pull: {
            following: {
              userFollowed: req.body.userFollowed,
            },
          },
        }
      );
      await User.update(
        {
          _id: req.body.userFollowed,
        },
        {
          $pull: {
            followers: {
              follower: req.user._id,
            },
          },
        }
      );
    };
    unfollowUser()
      .then(() => {
        res.status(200).json({ message: "UnFollowing user now" });
      })
      .catch((err) => {
        res.status(500).json({ message: "Error occured" });
      });
  },

  // fotification
  async MarkNotification(req, res) {
    if (!req.body.deleteValue) {
      await User.updateOne(
        {
          _id: req.user._id,
          "notifications._id": req.params.id,
        },
        {
          $set: { "notifications.$.read": true },
        }
      )
        .then(() => {
          res.status(200).json({ message: "Marked As Read" });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Error occured",
          });
        });
    } else {
      await User.update(
        {
          _id: req.user._id,
          "notifications._id": req.params.id,
        },
        {
          $pull: {
            notifications: { _id: req.params.id },
          },
        }
      )
        .then(() => {
          res.status(200).json({ message: "Deleted Successfully" });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Error occured",
          });
        });
    }
  },
  //MarkAllNotifications
  async MarkAllNotifications(req, res) {
    await User.update(
      {
        _id: req.user._id,
      },
      { $set: { "notifications.$[elem].read": true } }, // elem - elements
      { arrayFilters: [{ "elem.read": false }], multi: true }
    )
      .then(() => {
        res.status(200).json({ message: "Marked All Successfully" });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Error occured",
        });
      });
  },
};
