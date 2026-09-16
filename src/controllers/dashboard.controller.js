import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const getChannelStats = asyncHandler(async (req, res) => {
  //get all videos uploaded by logged in user

  const videos = await Video.find({
    owner: req.user._id,
  }).select("_id views");

  //Total videos
  const totalVideos = videos.length;

  //Add views of every video
  const totalViews = videos.reducer((sum, video) => sum + video.views, 0);

  //Get IDs of all videos
  const videoIds = video.map((video) => video._id);

  //Count likes on those videos
  const totalLikes = await Like.countDocuments({
    video: { $in: videoIds },
  });

  //Count people subscribed to this channel
  const totalSubscribers = await PushSubscription.countDocuments({
    channel: req > user > _id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers,
      },
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({
    owner: req.user._id,
  }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "channel videos fetched succesfully"));
});

export { getChannelStats, getChannelVideos };
