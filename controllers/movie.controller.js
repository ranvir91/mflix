import { Movie } from "../models/movie.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getMovieList = asyncHandler(async(req, res) => {

    const pageOptions = {
        page: parseInt(req.query.page, 10) || 0,
        limit: parseInt(req.query.limit, 10) || 10
    }

    const movies = await Movie.find({})
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit);

    if (!movies?.length) {
        throw new ApiError(404, "Movies not found.")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        movies,
        "Movies list fetched successfully"
    ))
});


export { getMovieList }