import mongoose, { Schema } from "mongoose";
import moongosePaginate from "mongoose-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
    },
    publishAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(moongosePaginate);
export const Video = mongoose.model("Video", videoSchema);
