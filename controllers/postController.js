import PostModel from "../models/post.js";
import UserModel from "../models/user.js";
import cloudinaryModul from "../utils/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    if (req.file) {
      const uploadRes = await cloudinaryModul.uploader.upload(req.file.path, {
        upload_preset: "social_media",
      });

      if (uploadRes) {
        await PostModel.create({
          userId: req.body.userId,
          post: req.body.post,
          image: uploadRes.secure_url,
          cloudinary_id: uploadRes.public_id,
        });

        res.status(200).json({ message: "Post create successfull" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later" });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const post = await PostModel.find({ userId: id }).populate("comments.commentBy").sort({createdAt:-1})
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later" });
  }
};

export const getSinglePost = async (req, res) => {
  const { id } = req.params;
  try {
    const singleUser = await PostModel.findById({ _id: id });
    res.status(200).json(singleUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    if (req.file !== undefined) {
      const user = await PostModel.findById({ _id: id });

      const result = await cloudinaryModul.uploader.destroy(user.cloudinary_id);
      console.log(result);
      //update image
      const uploadRes = await cloudinaryModul.uploader.upload(req.file.path, {
        upload_preset: "social_media",
      });

      if (uploadRes) {
        await PostModel.findOneAndUpdate(
          { _id: id },
          {
            post: req.body.post,
            image: uploadRes.secure_url,
          }
        );
      }
    } else {
      await PostModel.findOneAndUpdate({ _id: id }, { post: req.body.post });
    }

    res.status(200).json({ message: "Post Update Successfull" });
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later" });
  }
};

export const timelinePost = async (req, res) => {
  const { id } = req.params;
  try {
    const currentUser = await UserModel.findById({ _id: id })
    const currentUSerPost = await PostModel.find({ userId: currentUser._id }).populate("comments.commentBy")
    const friendPost = await Promise.all(
      currentUser.followings.map((friendId) =>
        PostModel.find({ userId: friendId })
      )
    )

    res.status(200).json(currentUSerPost.concat(...friendPost));
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const removePost = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await PostModel.findById({ _id: id });
    const result = await cloudinaryModul.uploader.destroy(user.cloudinary_id);
    console.log(result);
    await PostModel.findOneAndDelete({ _id: id });
    res.status(200).json({ message: "Post Delete Successfull" });
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log("id", id, "userId", userId);
  try {
    const post = await PostModel.findById({ _id: id });
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json({ message: "Like has been successfull" });
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json({ message: "unLike has been successfull" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error.Try againg later" });
  }
};

export const comment = async (req, res) => {
  const { id } = req.params;
  const comment = {
    comment: req.body.comment,
    commentBy: req.body.userId,
    createdAt: Date.now(),
  };
  try {
    const postComment = await PostModel.findOneAndUpdate(
      { _id: id },
      { $push: { comments: comment } },
      { new: true }
    );

    res.status(200).json(postComment);
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};
