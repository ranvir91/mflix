import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinay, uploadOnCloudinay } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid); // get from db
        let accessToken = user.generateAccessToken();
        let refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        });

        accessToken = await accessToken.then(token => {
          return token;
        }).catch(error => {
          console.error('Error in getting accesstoken:', error);
        });

        refreshToken = await refreshToken.then(token => {
          return token;
        }).catch(error => {
          console.error('Error in getting refreshtoke form Promise:', error);
        });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh token");         
    }
}

const getUserList = asyncHandler(async(req, res) => {
    const pg = {
        page: parseInt(req.query.page, 10) || 1, // Get page number from query parameters
        limit: parseInt(req.query.limit, 10) || 10, // Get limit from query parameters
    }
    pg.offset = (pg.page - 1) * pg.limit // Calculate the offset

    const users = await User.find().skip(pg.offset).limit(pg.limit).exec();
    const totalItems = await User.countDocuments({});
    const totalPages = Math.ceil(totalItems / pg.limit);
    
    if (!users?.length) {
        throw new ApiError(404, "Users not found.")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {users, paginate : {totalItems, totalPages, currentPage:pg.page} },
        "User list fetched successfully"
    ))
});


const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message : "OK"
    // })

    // get user details from frontend
    // data validations
    // check if user already exists | idempotant resources
    // check for images / avatar
    // upload to cloudinary
    // crate user object, save to mongodb 
    // response to front end

    const {email, fullname, password} = req.body;

    // console.log(email, " = email");
    
    if(email==="") {
        throw new ApiError(400, "Error in register user, Email is required");        
    }
    if(fullname==="") {
        throw new ApiError(400, "Error in register user, Fullname is required");        
    }
    if(password==="") {
        throw new ApiError(400, "Error in register user, Password is required");        
    }

    const userExists = await User.findOne({
        $or : [{ email }]
    });

    if(userExists) {
        throw new ApiError(409, "User with email is already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverLocalPath = req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }


    const avatar = await uploadOnCloudinay(avatarLocalPath);

    // console.log(`response from cloudinary `, avatar);
    if(!avatar) {
        throw new ApiError(400, "Error in Avatar upload on cloudinary");
    }

    const user = await User.create({
      fullname,
      email,
      password,
      avatar : avatar.url
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500, "Error while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully.")
    );

});

// login users
const loginUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message : "Login"
    // })

    // get req data from body
    // username or email login on basis of any one
    // find the user
    // check if password correct
    // generate access and refresh token
    // send cookie to frontend

    const { email, password } = req.body;

    // console.log(req.body, ' body ');
    // console.log(email , username , 'inputs are ');

    if(!email) {
        throw new ApiError(400, "Email is required");        
    }

    const user = await User.findOne({
        $or : [ {email} ]
    });

    if(!user) {
        throw new ApiError(404, "User doesnot exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = { httpOnly : true, secure: true};

    res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200, {
            user : loggedInUser,
            accessToken : accessToken,
            refreshToken : refreshToken,
        },
        "User logged in successfully"
        )
    )

});

// logout a user
const logoutUser = asyncHandler(async(req, res) => {
    // console.log(`dddd dd`);
    
    if(!req.user._id) return null;

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged Out"))
});

// change password of user account
const changePassword = asyncHandler(async (req, res) => {
    /*
    get password, confirm password and new password from frontend
    check if the current password is valid
    if current password is valid then update password in db
    */
    const { newPassword, password, cpassword } = req.body;
    console.log(newPassword, password, cpassword);

    if(!(password===cpassword)) {
        throw new ApiError(400, "Password and confirm password does not match");        
    }
    // const loggedInUser = req.user; // we can get current user from middleware
    const user = await User.findById(req.user?._id);

    let isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect) {
        throw new ApiError(400, "Given old password is invalid");        
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    res.status(200).json(
        new ApiResponse(200, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
});

// update user account details
const updateAccountDetails = asyncHandler( async(req, res) => {
    const {email, fullname } = req.body;

    if(!email && !fullname) {
        throw new ApiError(400, "Required params can not be null or blank");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// update avatar image
const updateUserAvatar = asyncHandler( async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinay(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")        
    }
    // const user = await User.findByIdAndUpdate(
    //     req.user?._id,
    //     {
    //         $set:{
    //             avatar: avatar.url
    //         }
    //     },
    //     {new: true}
    // ).select("-password")

    const user = await User.findById(req.user._id);
    const oldAvatar  = user.avatar;
    // console.log(`old avatar ${oldAvatar}`);

    user.avatar = avatar.url;
    await user.save({validateBeforeSave: false})

    //delete old image from cloudinary
    const deletedObject = await deleteFromCloudinay(oldAvatar);
    // console.log('dddd ', deletedObject);

    return res.status(200).json(new ApiResponse(200, user, "Avatar image updated successfully"));
});



export {
    getUserList,
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
}
