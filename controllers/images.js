require('dotenv').config();
const cloudinary = require("cloudinary");
const User = require("../models/userModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

module.exports = {
  UploadImage(req, res) {
    cloudinary.uploader.upload(req.body.image, async result => {
      // console.log(result);

      await User.update(
        {
          _id: req.user._id,
        },
        {
          $push: {
            images: {
              imgId: result.public_id,
              imgVersion: result.version,
            },
          },
        }
      )
        .then(() =>
          res.status(200).json({ message: "Image upload successfully" })
        )
        .catch((err) =>
          res.status(500).json({ message: "Error Uploading Image" })
        );
    });
  },

  async SetDefaultImage(req, res) {
    const { imgId, imgVersion } = req.params;

    await User.update(
      {
        _id: req.user._id,
      },
      {
        picId: imgId,
        picVersion: imgVersion
      }
    )
      .then(() =>
        res.status(200).json({ message: "Default image set" })
      )
      .catch((err) =>
        res.status(500).json({ message: "Error Occured" })
      );
  }
};
