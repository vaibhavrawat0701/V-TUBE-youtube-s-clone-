import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// GET ALL VIDEOS

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  // Object used for filtering videos
  const filter = {
    status: "published",
  };

  // Search by title or description
  if (query) {
    filter.$or = [
      {
        title: {
          $regex: query,
          $options: "i",
        },
      },
      {
        description: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  // Filter videos by a particular user
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user id");
    }

    filter.owner = userId;
  }

  // Sorting
  const sortOptions = {};

  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  // Find videos
  const videos = await Video.find(filter)
    .populate("owner", "username fullName avatar")
    .sort(sortOptions)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  // Total videos matching filter
  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        page: pageNumber,
        limit: limitNumber,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limitNumber),
      },
      "Videos fetched successfully"
    )
  );
});

// SAVE VIDEO AS DRAFT
const saveVideoAsDraft = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this video");
  }

  video.status = "draft";
  video.publishAt = null;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video saved as draft successfully"));
});
