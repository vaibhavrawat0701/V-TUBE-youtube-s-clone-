import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // getting all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  //Check whether videoId is a valid MongoDB ObjectID
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const comment = await Comment.find({
    video: videoId,
  })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  const totalComments = await Comment.countDocuments({
    video: videoId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        totalComments,
        page: Number(page),
        limit: Number(limit),
      },
      "Comments fetched successfully"
    )
  );
});

// adding comments

const addComment = asyncHandler(async (req, res) => {
  const { videoID } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "comment content is required");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added successfully"));
});
