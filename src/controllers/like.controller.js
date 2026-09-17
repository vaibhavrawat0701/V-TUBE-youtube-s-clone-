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

//  COMMENT LIKE

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Comment unliked successfully")
      );
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Comment liked successfully"));
});

// TWEET LIKE

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
      );
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "username fullName avatar",
      },
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
