import { Router } from "express";

import {
  updateVideoProgress,
  getVideoProgress,
} from "../controllers/videoProgress.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoProgress).patch(updateVideoProgress);

export default router;
