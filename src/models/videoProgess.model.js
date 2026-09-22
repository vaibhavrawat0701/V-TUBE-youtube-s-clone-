import mongoose, { Schema } from "mongoose";

const videoProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    progress: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// A user should have only one progress record for each video
videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });

export const VideoProgress = mongoose.model(
  "VideoProgress",
  videoProgressSchema
);
