import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Video likes

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // 1.valid video id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // 2.  user already liked this video
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  // 3. If already liked -> unlike
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Video unliked successfully")
      );
  }

  // 4. Otherwise create like
  await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Video liked successfully"));
});
