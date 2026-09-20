import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId").get(getVideoComments).post(verifyJWT, addComment);

router
  .route("/c/:commentId")
  .patch(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);

router.route("/:videoId").get(getVideoComments).post(addComment);
export default router;
