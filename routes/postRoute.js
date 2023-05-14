import express from "express";
import {
  comment,
  createPost,
  getPost,
  getSinglePost,
  likePost,
  removePost,
  timelinePost,
  updatePost,
} from "../controllers/postController.js";
import multer from "multer";
import auth from "../middleware/auth.js";
const router = express.Router();

const storage = multer.diskStorage({});

const upload = multer({ storage: storage });

router.post("/create-post", upload.single("image"),auth, createPost);
router.get("/get-post/:id",auth, getPost);
router.get("/get-single-post/:id",auth, getSinglePost);
router.get("/get-timeline/:id",auth, timelinePost);
router.put("/update-post/:id", upload.single("image"),auth, updatePost);
router.put("/like-post/:id",auth, likePost);
router.put("/comment-post/:id",auth, comment);
router.delete("/delete-post/:id",auth, removePost);

export default router;
