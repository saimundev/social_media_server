import joi from "joi";
import UserModel from "../models/user.js";
import genAuthToken from "../utils/genAuthToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import cloudinaryModul from "../utils/cloudinary.js";
import PostModel from "../models/post.js";

export const reguster = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);

  //INPUT VALIDATION
  const schema = joi.object({
    name: joi.string().min(3).max(30).required().trim(),
    email: joi.string().min(5).max(50).required().trim().email(),
    password: joi.string().min(5).max(30).required().trim(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    //CHEAK IS USER EXIST
    const isExist = await UserModel.findOne({ email: email });
    if (isExist) return res.status(400).json({ message: "User Already Exist" });

    //HASE PASSWORD
    const hasePassword = await bcrypt.hash(password, 10);

    //EMAIL VARIFIDE
    const sendToken = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const sendLink = `https://firend.netlify.app/email-varifacation?token=${sendToken}`;

    let transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: "Varifed your email",
      html: `
           <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                .link{
                    color: blue;
                    padding: 15px 30px;
                    border: none;
                    border-radious:16px;
                }
            </style>
        </head>
        <body>
            <h1>varified email address</h1>
            <a href=${sendLink} class="link">varefied Link here</a>
        </body>
        </html>`,
    };

    transport.sendMail(mailOption, async (error, data) => {
      if (error)
        return res
          .status(400)
          .json({ message: "Somethine went wrong, Try agian later" });

      if (data) {
        //CREATE USER
        const user = await UserModel.create({
          name,
          email,
          password: hasePassword,
        });

        //CREATE TOKEN
        const token = genAuthToken(user);

        res.status(200).json({ user, token });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error, try again later" });
  }
};

export const VarefiedEmailLink = async (req, res) => {
  const { token } = req.params;
  try {
    if (token) {
      const isValidToken = jwt.verify(token, process.env.JWT_SECRET);
      if (isValidToken) {
        const findEmail = await UserModel.findOne({
          email: isValidToken.email,
        });
        await UserModel.findOneAndUpdate(
          { _id: findEmail._id },
          { isVarefay: true }
        );

        res.status(200).json({ message: "Email varefication successfull" });
      } else {
        res.status(400).json({ message: "Link Expair" });
      }
    } else {
      res.status(400).json({ message: "Invalid Url" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error, try again later" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  //INPUT VALIDATION
  const schema = joi.object({
    email: joi.string().min(5).max(50).required().trim().email(),
    password: joi.string().min(5).max(30).required().trim(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    //CHEAK IS USER EXIST
    const isExist = await UserModel.findOne({ email: email });
    if (!isExist) return res.status(400).json({ message: "User Not Found" });

    //CHEAK MATCH PASSWORD
    const isPasswordMatch = await bcrypt.compare(password, isExist.password);
    if (!isPasswordMatch)
      return res.status(400).json({ message: "Password Not Match" });

    //CREATE TOKEN
    const token = genAuthToken(isExist);

    res.status(200).json({ user: isExist, token });
  } catch (error) {
    res.status(500).json({ message: "Server Error, try again later" });
  }
};

export const forgetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  try {
    const findUser = await UserModel.findOne({ email: email });
    console.log(findUser);
    if (findUser) {
      const userToken = jwt.sign(
        { email: findUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      const sendLink = `https://firend.netlify.app/email-varefay?token=${userToken}`;

      let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      const mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Varifed your email",
        html: `
             <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Document</title>
              <style>
                  .link{
                      color: blue;
                      padding: 15px 30px;
                      border: none;
                      border-radious:16px;
                  }
              </style>
          </head>
          <body>
              <h3>varified email address</h3>
              <a href=${sendLink} class="link">varefied Link here</a>
          </body>
          </html>`,
      };

      transport.sendMail(mailOption, (error, data) => {
        if (error)
          return res
            .status(400)
            .json({ message: "Somethine went wrong, Try agian later" });

        if (data) {
          res.status(200).json({ message: "Email Send Successfull" });
        }
      });
    } else {
      res.status(400).json({ message: "Email not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const forgetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log(token, password);
  try {
    if (token) {
      const varefayToken = jwt.verify(token, process.env.JWT_SECRET);
      if (varefayToken) {
        const findUser = await UserModel.findOne({ email: varefayToken.email });
        const hasePassword = await bcrypt.hash(password, 10);
        await UserModel.findOneAndUpdate(
          { _id: findUser._id },
          { password: hasePassword },
          { new: true }
        );

        res.status(200).json({ message: "Password Update successfull" });
      } else {
        res.status(400).json({ message: "Token is not valid" });
      }
    } else {
      res.status(400).json({ message: "invalid cadrinsial" });
    }
  } catch (error) {
    res.status(500).json({ message: "Your Token is Expair" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById({ _id: id });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const allUser = async (req, res) => {
  const search = req.query.search || "";
  console.log(search);
  try {
    const user = await UserModel.find({
      name: { $regex: search, $options: "i" },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later" });
  }
};

export const getFriend = async (req, res) => {
  const { id } = req.params;
  console.log("params", id);
  try {
    const user = await UserModel.findById({ _id: id });
    const friend = await Promise.all(
      user.followings.map((friendId) => UserModel.findById({ _id: friendId }))
    );

    let friendList = [];
    friend.map((fd) => {
      const { _id, name, profile } = fd;
      friendList.push({ _id, name, profile });
    });
    console.log("fd", friendList);
    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const updateCoverPhoto = async (req, res) => {
  const { id } = req.params;
  console.log(req.file);
  console.log("id", id);
  try {
    if (req.file !== undefined) {
      const response = await cloudinaryModul.uploader.upload(req.file.path, {
        upload_preset: "social_media",
      });
      if (response) {
        await UserModel.findOneAndUpdate(
          { _id: id },
          { cover: response.secure_url }
        );

        res.status(200).json({ message: "Cover Photo Update Successfull" });
      }
    } else {
      res.status(500).json({ message: "File is required" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const updateUser = async (req, res) => {
  const { name, address, status, city } = req.body;
  const { id } = req.params;
  try {
    let update;
    if (req.file !== undefined) {
      const response = await cloudinaryModul.uploader.upload(req.file.path, {
        upload_preset: "social_media",
      });
      if (response) {
        update = {
          profile: response.secure_url,
          name: name,
          address: address,
          status: status,
          city: city,
        };
      }
    } else {
      update = {
        name: name,
        address: address,
        status: status,
        city: city,
      };
    }

    await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    );

    res.status(200).json({ message: "User Update Successfull" });
  } catch (error) {
    res.status(500).json({ message: "Server error. try again later" });
  }
};

export const follow = async (req, res) => {
  console.log("follow", req.body);
  const { userId } = req.body;
  const { id } = req.params;

  if (userId !== id) {
    try {
      const user = await UserModel.findById({ _id: id });
      const currentUser = await UserModel.findById({ _id: userId });

      if (!user.followers.includes(userId)) {
        await user.updateOne({ $push: { followers: userId } });
        await currentUser.updateOne({ $push: { followings: id } });

        res.status(200).json({ message: "User follow successfull" });
      } else {
        res.status(403).json({ message: "You Already follow this user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error. Try again later" });
    }
  } else {
    res.status(403).json({ message: "You can't follow your self" });
  }
};

export const unFollow = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  if (userId !== id) {
    try {
      const user = await UserModel.findById({ _id: id });
      const currentUser = await UserModel.findById({ _id: userId });

      if (user.followers.includes(userId)) {
        await user.updateOne({ $pull: { followers: userId } });
        await currentUser.updateOne({ $pull: { followings: id } });

        res.status(200).json({ message: "User has been unfollow" });
      } else {
        res.status(403).json({ message: "You not folllow this user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error. Try again later" });
    }
  } else {
    res.status(403).json({ message: "You can't unFollow your self" });
  }
};

export const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const isEmailFound = await UserModel.findOne({ email: email });
    if (isEmailFound) {
      res.status(200).json({ message: "valid email" });
    } else {
      res.status(400).json({ message: "Email not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error. Try again later" });
  }
};

export const changePassword = async (req, res) => {
  const { password, newPassword, email } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });
    const matchPassword = await bcrypt.compare(password, user.password);
    if (matchPassword) {
      const hasePassword = await bcrypt.hash(newPassword, 10);
      const result = await UserModel.findOneAndUpdate(
        { _id: user._id },
        { password: hasePassword },
        { new: true }
      );
      console.log(result);

      res.status(200).json({ message: "Password Chagnle successfull" });
    } else {
      res.status(400).json({ message: "Password not match" });
    }
  } catch (error) {}
};

export const deleteAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const remove = await UserModel.findByIdAndDelete({ _id: userId });
    if (remove) {
      await PostModel.deleteMany({ userId: userId });
    } else {
      res.status(500).json({ message: "User Not found" });
    }

    res.status(200).json({ message: "account delete successfull" });
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later" });
  }
};
