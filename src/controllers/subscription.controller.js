const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // 1. Check valid MongoDB id
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  // 2. Check subscription already exist
  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  // 3. If it exists then unsubscribe
  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
  }

  // 4. Otherwise then subscribe
  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
    );
});
