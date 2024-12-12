import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMovieList, getMovie, createMovie, updateMovie, deleteMovie } from "../controllers/movie.controller.js";

const router = Router();
router.use(verifyJWT); // apply verifyJWT middleware to all routes in this file


router.route("/list").get(getMovieList);
router.route("/:id").get(getMovie);
router.route("/create").post(createMovie);

router.route("/update/:id").patch(updateMovie);
router.route("/delete/:id").delete(deleteMovie);


export default router;