import express from "express";
import multer from "multer";
import {
  VarefiedEmailLink,
  allUser,
  changePassword,
  deleteAccount,
  follow,
  forgetPassword,
  forgetPasswordEmail,
  getFriend,
  getUser,
  login,
  reguster,
  resetPassword,
  unFollow,
  updateCoverPhoto,
  updateUser,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

const storage = multer.diskStorage({});
const upload = multer({ storage: storage });

router.post("/regusters", reguster);
router.put("/email-varefai/:token", VarefiedEmailLink);
router.post("/login", login);
router.post("/forget-password", forgetPasswordEmail);
router.put("/forget/:token", forgetPassword);
router.get("/get-user/:id",auth, getUser);
router.get("/all-user",auth, allUser);
router.get("/get-friend/:id",auth, getFriend);
router.put(
  "/update-coverphoto/:id",
  upload.single("coverImage"),
  auth,
  updateCoverPhoto
);
router.put("/update-user/:id", upload.single("profile"),auth, updateUser);
router.put("/:id/follow",auth, follow);
router.put("/:id/unfollow",auth, unFollow);
router.post("/reset-password",auth, resetPassword);
router.post("/change-password",auth, changePassword);
router.delete("/delete-account/:userId",auth, deleteAccount);

export default router;
