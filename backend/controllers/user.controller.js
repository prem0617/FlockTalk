import bcrypt from "bcryptjs";

import fs from "fs";

import UserModel from "../models/user.model.js";
import NotificationModel from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReciverSocketId, io } from "../lib/socket.io.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    // get user from DB
    const user = await UserModel.findOne({ username });

    // check if user exists or not
    if (!user) return res.status(404).json({ error: "User not found" });

    // send user profile to client
    res.json(user);
  } catch (error) {
    //handle error
    console.log("Error in getUserProfile : ", error.message);
    res.status(500).json({ error: "Error in Getting User Profile" });
  }
};

export const getSuggested = async (req, res) => {
  try {
    // ! DONE THIS TODO
    // ? TODO : Remove the user who are already in following list and also remove user it self from the list

    const userId = req.user._id;

    const usersFollowedByMe = await UserModel.findById(userId).select(
      "following"
    );

    // * sample : choose randomly user from DB which are not inclued in match
    const users = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
    ]);

    // *Checks in random array if the user is already in following list or not
    // //if not then add in filtered list
    // //if yes then not add in filtered list
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    // // get only first 5 users from filtered users if there are more than 5
    const suggestedUsers = filteredUsers;

    // *hide the password of users
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {}
};

// ! USER A : ME
// ! USER B : SOMEONE

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    // useModify means the user to whome current user want to follow or unfollow (USER B)
    const userModify = await UserModel.findById(id);

    // current user [get from protected routes] (USER A)
    const currentUser = await UserModel.findById(req.user._id);

    // check if user try to follow it self or not
    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "User cannot Follow/Unfollow it self" });

    // check if user id exists or not
    if (!userModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    // check for USER A if already following the USER B or not
    // return true if current user is following userModify
    // return false if current user is not following
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // logic for unfollowing user

      // here USER A (i am) is try to unfollow the USER B (some other user)

      // update the followers list of USER B
      // remove USER A id into USER B followers list
      await UserModel.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });

      // update the following list of USER A
      // remove USER B id into USER A following list
      await UserModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });

      // After unfollowing, update suggested users
      await updateSuggestedUsers(req.user._id);

      res
        .status(200)
        .json({ message: "User unfollowed successfully", follow: false });
    } else {
      // logic for following user

      // here USER A (i am) is try to follow the USER B (some other user)

      // update the followers list of USER B
      // add USER A id into USER B followers list
      await UserModel.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });

      // update the following list of USER A
      // add USER B id into USER A following list
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });

      // send notification to USER B (some other user)
      const newNotification = new NotificationModel({
        from: req.user._id,
        to: id, // user modifyID
        type: "FOLLOW",
      });

      await newNotification.save();

      // After following, update suggested users
      await updateSuggestedUsers(req.user._id);

      res
        .status(200)
        .json({ message: "User followed successfully", follow: true });
    }
  } catch (error) {
    // handle error
    console.log("Error in Follow Unfollow Route", error.message);
    res.status(500).json({ error: "Error in Follow Unfollow Route" });
  }
};

// Helper function to update suggested users and emit socket event
async function updateSuggestedUsers(userId) {
  try {
    // Get the current user's following list
    const usersFollowedByMe = await UserModel.findById(userId).select(
      "following"
    );

    // console.log(usersFollowedByMe);

    const users = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // Exclude the current user
        },
      },
    ]);

    // Filter out users that are already being followed
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    // Hide passwords
    const suggestedUsers = filteredUsers.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Emit the updated suggested users list via socket
    const receiverSocketID = getReciverSocketId(userId);
    console.log(receiverSocketID);
    if (receiverSocketID)
      io.to(receiverSocketID).emit("suggestedUsers", suggestedUsers);

    return suggestedUsers;
  } catch (error) {
    console.log("Error updating suggested users:", error.message);
    return [];
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword, bio, link, fullname } =
      await req.body;

    const userId = req.user._id;

    let user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // // check user provided both current and new password
    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Provide both Current and New Password" });
    }

    // // if user is provided current and new password
    if (currentPassword && newPassword) {
      // * check the current password is correct or not
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid current password" });
      }

      if (newPassword.length < 6)
        return res.status(401).json({ error: "Password too short" });

      // //if match then hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    let profileImg = "";
    let coverImg = "";

    if (req.files) {
      profileImg = req.files?.profile;
      coverImg = req.files?.cover;
      console.log(coverImg);
      const coverImagePath = coverImg[0].path;
      console.log(coverImagePath);

      if (profileImg) {
        const profilePath = profileImg[0].path;

        // remove image if already uploaded
        if (user.profileImg) {
          const public_id = user.profileImg.split("/").pop().split(".")[0];
          cloudinary.uploader.destroy(`twitter-post/${public_id}`);
        }

        const uploadedProfileResponce = await cloudinary.uploader.upload(
          profilePath,
          {
            folder: "twitter-post",
            resource_type: "auto",
          }
        );

        // console.log(uploadedProfileResponce);
        profileImg = uploadedProfileResponce.secure_url;
        fs.unlinkSync(req.files?.profile[0].path);
      }

      coverImg = req.files?.cover;
      if (coverImg) {
        console.log(coverImg, "coverImage");
        const coverImagePath = coverImg[0].path;
        console.log(coverImagePath);
        if (user.coverImg) {
          const publicId = user.coverImg.split("/").pop().split(".")[0];
          cloudinary.uploader.destroy(`twitter-post/${publicId}`);
        }

        const uploadedCoverResponce = await cloudinary.uploader.upload(
          coverImagePath,
          {
            folder: "twitter-post",
            resource_type: "auto",
          }
        );
        coverImg = uploadedCoverResponce.secure_url;
        fs.unlinkSync(req.files?.cover[0].path);
      }
    }

    // // if user provided a field to change then it updated otherwise same as before
    user.fullname = fullname || user.fullname;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    // // making password null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log(`Error in Update User Profile Route ${error.message}`);
    console.log(error);
    res.status(500).json({
      error: "Error in Update User Profile Route",
      errormessage: error,
    });
  }
};

// export const followingUsers = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     if (!userId) return res.status(404).json({ error: "User not found" });
//     const followingUsersId = await UserModel.findById(userId).select(
//       "following"
//     );

//     let followingUser = [];

//     for (const user of followingUsersId.following) {
//       const userDetail = await UserModel.findById(user).select(
//         "username _id profileImg fullname email"
//       );
//       followingUser.push(userDetail);
//     }

//     return res.status(200).json(followingUser);
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).json({ error: "Error in getting users" });
//   }
// };

export const getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getFollowingUsers = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);

    const user = await UserModel.findById(id).populate(
      "following",
      "fullname profileImg username _id email"
    );

    const following = user.following;

    // console.log(following);

    return res.json(following);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export const getFollowersUsers = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("hello");

    console.log(id);

    const user = await UserModel.findById(id).populate(
      "followers",
      "fullname profileImg username _id email"
    );

    const followers = user.followers;

    // console.log(following);

    return res.json(followers);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
