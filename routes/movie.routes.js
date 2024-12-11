import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMovieList } from "../controllers/movie.controller.js";

const router = Router();
router.use(verifyJWT); // apply verifyJWT middleware to all routes in this file


router.route("/list").get(getMovieList);


export default router;