import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// CREATE TWEET

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  //creating tweet
  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});
