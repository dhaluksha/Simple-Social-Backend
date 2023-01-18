const Message = require("../models/messageModels");
const Conversation = require("../models/conversationModels");
const User = require("../models/userModel");
const Helper = require('../helpers/helpers');

module.exports = {
  // send message to together

  SendMessage(req, res) {
    // console.log(req.body);
    const { sender_Id, receiver_Id } = req.params;

    Conversation.find(
      {
        $or: [
          {
            participants: {
              $elemMatch: { senderId: sender_Id, receiverId: receiver_Id },
            },
          },
          {
            participants: {
              $elemMatch: { senderId: receiver_Id, receiverId: sender_Id },
            },
          },
        ],
      },
      async (err, result) => {
        if (result.length > 0) {
          const msg = await Message.findOne({conversationId: result[0]._id});
          Helper.updateChatList(req, msg);
          await Message.update(
            {
              conversationId: result[0]._id,
            },
            {
              $push: {
                message: {
                  senderId: req.user._id,
                  receiverId: req.params.receiver_Id,
                  sendername: req.user.username,
                  receivername: req.body.receiverName,
                  body: req.body.message,
                },
              },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Message send successfully" })
            )
            .catch((err) => res.status(500).json({ message: "Error occured" }));
        } else {
          const newConversation = new Conversation();
          newConversation.participants.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id,
          });

          const saveConversation = await newConversation.save();
          // console.log(saveConversation);

          const newMesage = new Message();
          newMesage.conversationId = saveConversation._id;
          newMesage.sender = req.user.username;
          newMesage.receiver = req.body.receiverName;
          newMesage.message.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id,
            sendername: req.user.username,
            receivername: req.body.receiverName,
            body: req.body.message,
          });

          // user 1
          await User.update(
            {
              _id: req.user._id,
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.params.receiver_Id,
                      msgId: newMesage._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );
          // // user 2
          await User.update(
            {
              _id: req.params.receiver_Id,
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.user._id,
                      msgId: newMesage._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );

          await newMesage
            .save()
            .then(() => res.status(200).json({ message: "Message sent" }))
            .catch((err) => res.status(500).json({ message: "Error occured" }));
        }
      }
    );
  },

  // GetAllMessages
  async GetAllMessages(req, res) {
    const { sender_Id, receiver_Id } = req.params;
    const conversation = await Conversation.findOne({
      $or: [
        {
          $and: [
            { "participants.senderId": sender_Id },
            { "participants.receiverId": receiver_Id }
          ],
        },
        {
          $and: [
            { "participants.senderId": receiver_Id },
            { "participants.receiverId": sender_Id }
          ],
        },
      ],
    }).select('_id')

    if(conversation) {
      const messages = await Message.findOne({conversationId: conversation._id});
      res.status(200).json({message: 'Messages returned', messages})
    }
  },
  async MarkReceiverMessages(req, res) {
    const { sender, receiver } = req.params;
    const msg = await Message.aggregate([
      {$unwind: '$message'},
      {
      $match: {
        $and: [{'message.sendername': receiver, 'message.receivername': sender}]
      }
    }
    ])
    if(msg.length > 0) {
      try {
        msg.forEach(async (value) => {
          await Message.update({
            'message._id': value.message._id
          },
          {$set: {'message.$.isRead': true}}
          );
        })
        res.status(200).json({message: 'Messages marked as read'});
      } catch (err) {
        res.status(500).json({message: 'Error occured'})
      }
    }
  }
};
