import { Router } from "express";
import { changePassword, getCurrentUser, loginUser, logoutUser, registerUser, updateAccountDetails, updateUserAvatar, getUserList } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
// import { uploadOnCloudinay } from "../utils/cloudinary.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields(
        [
            {
                name : 'avatar',
                maxCount : 1
            }
        ]
    ),
    registerUser );


router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/list").get(verifyJWT, getUserList);

// secure routes / where login is required
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/update-profile").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);


export default router; 