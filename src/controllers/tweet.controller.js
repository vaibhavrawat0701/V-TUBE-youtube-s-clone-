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

//get user tweets

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  //  if user exists
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Find all tweets created by this user
  const tweets = await Tweet.find({
    owner: userId,
  })
    .populate("owner", "username fullName avatar")
    .sort({
      createdAt: -1,
    });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

//update tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  // Find tweet
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Only the owner can update their tweet
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this tweet");
  }

  // Update tweet
  tweet.content = content.trim();

  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});
//delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  // Find tweet
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Only owner can delete their tweet
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this tweet");
  }

  // Delete tweet
  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
