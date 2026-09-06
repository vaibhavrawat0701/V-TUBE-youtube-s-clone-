import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generatedAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validationBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //1)get user details from frontend
  //2)validation - not empty
  //3)check if user already exists : username, email
  //4)check for images, check for avatar
  //5)upload them to cloudinary, avatar
  //6)create user to object - create entry in db
  //7)remove password from response and refresh token fields from response
  //8)check for user creation
  //9)return response

  const { fullName, email, username, password } = req.body;
  console.log("email", email);

  // if (fullName === "") {
  //   throw new ApiError(400, "fullName is required");
  // }   //We can use this but now we have touse if case for each field(fullname,username,password), so we can use the  the method given below

  // 1,2
  if (
    [fullName, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //3
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  console.log("req.files", req.files);

  //4
  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  //5
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  //6
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  //7
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //8
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  //1)req body ->data
  //2) username or email
  //3) find the user
  //4) check password
  //5) generate access and refresh tokens
  //6) send cookies

  //1
  const { username, email, password } = req.body;
  //2
  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }
  //3
  const user = await User.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: email?.toLowerCase() },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //4

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  //5
  const { accessToken, refreshToken } =
    await generatedAccessTokenAndRefreshToken(user._id);
});

export { registerUser, loginUser };
