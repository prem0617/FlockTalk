import cloudinary from "../lib/cloudinary.js";
import UserModel from "../models/user.model.js";
import PostModel from "../models/post.model.js";
import NotificationModel from "../models/notification.model.js";
import fs from "fs";
import { getReciverSocketId, io } from "../lib/socket.io.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    let imgPath = "";

    if (req.file) {
      imgPath = req.file.path;

      const uploadResponse = await cloudinary.uploader.upload(imgPath, {
        folder: "twitter-post",
        resource_type: "auto",
      });

      imgPath = uploadResponse.secure_url;

      console.log(imgPath);
      fs.unlinkSync(req.file.path);
    }

    const userId = req.user._id.toString();

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!imgPath && !text) {
      return res.status(400).json({ error: "Post must have img or text" });
    }

    const newPost = new PostModel({
      user: userId,
      text,
      image: imgPath,
    });

    await newPost.save();

    // if we send the newPost then there is no user in that post so delete button is not displayed
    const newPostToSend = await PostModel.findById(newPost._id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "commnets.user",
        select: "-password",
      });

    io.emit("newPost", newPostToSend); // 🔥 Send post update to all users

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in Create Post Route", error.message);
    return res.status(500).json({ error: "Error in Create Post Model" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletePost = await PostModel.findById(id);

    if (!deletePost) return res.status(404).json({ error: "Post not Found" });

    if (req.user._id.toString() !== deletePost.user.toString()) {
      return res.status(400).json({ error: "You can not delete this post" });
    }

    try {
      if (deletePost.image) {
        const publicId = deletePost.image.split("/").pop().split(".")[0]; // Extract public_id
        console.log(publicId);

        // Include folder name in deletion
        await cloudinary.uploader.destroy(`twitter-post/${publicId}`);
      }
    } catch (error) {
      console.log(error.message, "Error in deleting image from Cloudinary");
    }

    await PostModel.findByIdAndDelete(deletePost._id);

    io.emit("deletePost", id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(`Error in Delete post route: ${error.message}`);
    res.status(500).json({ error: "Error in Delete post route" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ error: "Post Not Found" });

    const isLiked = post.likes.includes(userId);

    // Atomic update using findOneAndUpdate and return updated document
    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: id },
      isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true } // Return the updated document
    ).select("likes"); // Select only the likes field

    // Update user's liked posts list
    await UserModel.updateOne(
      { _id: userId },
      isLiked ? { $pull: { likedPost: id } } : { $addToSet: { likedPost: id } }
    );

    // console.log(updatedPost);

    // console.log({ userId, postUser: post.user });

    // console.log(userId.toString() === post.user.toString());

    if (!isLiked && userId.toString() !== post.user.toString()) {
      const newNotifications = new NotificationModel({
        to: post.user,
        type: "LIKE",
        from: userId,
        post,
      });

      console.log(newNotifications);

      await newNotifications.save();

      const recevierId = post.user.toString();

      const notificationSendToFrontend = {
        createdAt: newNotifications.createdAt,
        read: newNotifications.read,
        to: newNotifications.to,
        type: newNotifications.type,
        from: req.user,
        _id: newNotifications._id,
      };

      const recevierSocketId = getReciverSocketId(recevierId);
      io.to(recevierSocketId).emit("notification", notificationSendToFrontend);
    }

    io.emit("likeUnlikePost", {
      likes: updatedPost.likes,
      id: updatedPost._id,
    }); // �� Send updated post to all users

    res.status(200).json(updatedPost.likes); // Return updated likes array
  } catch (error) {
    console.error("Error in likeUnlikePost:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    // id on which post user want to comment
    const { id } = req.params;
    const { text } = await req.body;

    if (!text) return res.status(400).json({ error: "Text Field is required" });

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ error: "Post Not Found" });

    // create a new comment in database

    const newComment = {
      user: req.user._id,
      text,
    };

    post.commnets.push(newComment);

    await post.save();

    io.emit("comment", { text: text, user: req.user });
    // ? send notification to User B when User A comment on User B post
    // console.log({ user: req.user._id, postUser: post.user });

    if (req.user._id.toString() !== post.user.toString()) {
      const newNotifications = new NotificationModel({
        from: req.user._id,
        to: post.user,
        type: "COMMENT",
      });

      await newNotifications.save();

      const recevierId = post.user.toString();

      const notificationSendToFrontend = {
        createdAt: newNotifications.createdAt,
        read: newNotifications.read,
        to: newNotifications.to,
        type: newNotifications.type,
        from: req.user,
        _id: newNotifications._id,
      };

      const recevierSocketId = getReciverSocketId(recevierId);
      io.to(recevierSocketId).emit("notification", notificationSendToFrontend);
    }

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    console.log("Error in Comment Router", error.message);
    res.status(500).json({ error: "Error in Comment Router" });
  }
};

// TODO : User can Delete the comment on Post

export const commentDeleteOnPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findOne({ "commnets._id": id });

    if (!post) {
      throw new Error("Comment not found");
    }

    const commentToDelete = post.commnets.find((c) => c._id.toString() === id);

    if (!commentToDelete) {
      throw new Error("Comment not found");
    }

    await PostModel.findOneAndUpdate(
      { "commnets._id": id },
      { $pull: { commnets: { _id: id } } }
    );

    io.emit("deleteComment", commentToDelete);

    return res.json(commentToDelete);
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  try {
    // *Find all post and sort them (new post on top)

    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "commnets.user",
        select: "-password",
      });

    // // if no post then return an empty array
    if (posts.length === 0) return res.status(200).json([]); // empty

    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in Get All Post Router", error.message);
    res.status(500).json({ error: "Error in Get All Post Router" });
  }
};

export const getLikedPost = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const likedPost = await PostModel.find({ _id: { $in: user.likedPost } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "commnets.user",
        select: "-password",
      });

    return res.status(200).json(likedPost);
  } catch (error) {
    console.log("Error in Get Liked Post", error.message);
    res.status(500).json({ error: "Error in Get Liked Post" });
  }
};

export const getFollowingPost = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const followingUser = user.following;

    const followingPost = await PostModel.find({
      user: { $in: followingUser },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "commnets.user",
        select: "-password",
      });

    return res.status(200).json(followingPost);
  } catch (error) {
    console.log("Error in Get Following Post", error.message);
    res.status(500).json({ error: "Error in Get Following Post" });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userPost = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "commnets.user",
        select: "-password",
      });

    res.status(200).json(userPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error in get User post" });
  }
};

export const bookMark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isBookmarked = post.bookmarks.includes(userId);

    console.log(isBookmarked);

    let bookmark;

    if (!isBookmarked) {
      bookmark = await PostModel.findByIdAndUpdate(
        id,
        { $push: { bookmarks: userId } },
        { new: true }
      );
    } else {
      bookmark = await PostModel.findByIdAndUpdate(
        id,
        { $pull: { bookmarks: userId } },
        { new: true }
      );
    }

    io.emit("bookmark", { id: bookmark.id, bookmark: bookmark.bookmarks });

    console.log({ id: bookmark.id, bookMark: bookmark.bookmarks });

    return res.status(201).json(bookmark);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getBookMarkPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmarkedPosts = await PostModel.find({ bookmarks: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "commnets.user",
        select: "-password",
      });

    return res.status(200).json(bookmarkedPosts);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw new Error("Failed to fetch bookmarks");
  }
};
