import mongoose from "mongoose";
import { VideoProgress } from "../models/videoProgress.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  update / create video progress

const updateVideoProgress = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Get progress from request body
  const { progress } = req.body;

  // Check videoId
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Check if video exists
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check progress
  if (progress === undefined || progress < 0) {
    throw new ApiError(400, "Valid progress is required");
  }

  // Determine whether video is completed
  const completed = progress >= video.duration;

  // Find existing progress OR create one
  const videoProgress = await VideoProgress.findOneAndUpdate(
    {
      user: req.user._id,
      video: videoId,
    },

    {
      $set: {
        progress,
        completed,
      },
    },

    {
      new: true,
      upsert: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoProgress, "Video progress updated successfully")
    );
});

// get video progress

const getVideoProgress = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const videoProgress = await VideoProgress.findOne({
    user: req.user._id,
    video: videoId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoProgress, "Video progress fetched successfully")
    );
});

export { updateVideoProgress, getVideoProgress };
