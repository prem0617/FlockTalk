import MessageModel from "../models/message.model.js";
import { getReciverSocketId, io } from "../lib/socket.io.js";
import UserModel from "../models/user.model.js";

export const getAllMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res.status(401).json({ message: "User is not authenticated" });
    const { id: secondUserId } = req.params;

    const allMessage = await MessageModel.find({
      $or: [
        { sender: userId, receiver: secondUserId },
        { sender: secondUserId, receiver: userId },
      ],
    });

    return res.json(allMessage);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in getting all messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;
    if (!userId)
      return res.status(401).json({ message: "User is not authenticated" });
    const { id: secondUserId } = req.params;

    const message = new MessageModel({
      sender: userId,
      receiver: secondUserId,
      content: text,
    });

    await message.save();

    const receiverSocketID = getReciverSocketId(secondUserId);
    console.log(receiverSocketID);
    if (receiverSocketID) io.to(receiverSocketID).emit("message", message);

    return res.json({ message: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in creating message" });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res.status(401).json({ message: "User is not authenticated" });

    const messages = await MessageModel.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    console.log(messages);

    const chatUserIds = new Set();
    messages.forEach((message) => {
      if (message.sender.toString() === userId.toString()) {
        chatUserIds.add(message.receiver.toString());
      } else {
        chatUserIds.add(message.sender.toString());
      }
    });

    const uniqueUserIds = Array.from(chatUserIds);

    console.log(uniqueUserIds);

    const chatUsers = await UserModel.find({
      _id: { $in: uniqueUserIds },
    }).select("username profilePicture _id");

    return res.json(chatUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching chat users" });
  }
};
