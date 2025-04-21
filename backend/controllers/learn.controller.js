import UserModel from "../models/user.model.js";

export const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "User is not Authenticated" });

    const userId = user.id;

    const isUserFollowing = user.following.includes(id);

    if (isUserFollowing) {
      await UserModel.findByIdAndUpdate(userId, { $pull: { following: id } });

      await UserModel.findByIdAndUpdate(id, { $pull: { followers: userId } });
    } else {
      const updated = await UserModel.findByIdAndUpdate(userId, {
        $push: { following: id },
      });

      await UserModel.findByIdAndUpdate(id, { $push: { followers: userId } });
    }

    console.log(isUserFollowing);

    return res.json({ id, user, isUserFollowing });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};
