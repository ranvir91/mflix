import { Movie } from "../models/movie.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// https://github.com/expressjs/express-paginate
// this paginate is custom not using express-paginate

// get all movies list
const getMovieList = asyncHandler(async(req, res) => {

    const pg = {
        page: parseInt(req.query.page, 10) || 1, // Get page number from query parameters
        limit: parseInt(req.query.limit, 10) || 10, // Get limit from query parameters
    }
    pg.offset = (pg.page - 1) * pg.limit // Calculate the offset

    const movies = await Movie.find().skip(pg.offset).limit(pg.limit).exec();
    const totalItems = await Movie.countDocuments({});
    const totalPages = Math.ceil(totalItems / pg.limit);

    if (!movies?.length) {
        throw new ApiError(404, "Movies not found.")
    }
    
    // return res.status(200).json({ totalItems, page, totalPages, movies });
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {movies, paginate : {totalItems, totalPages, currentPage:pg.page} },
        "Movies list fetched successfully"
    ))
});

// get single movies details
const getMovie = asyncHandler(async(req, res) => {

    const id = req.params.id; // console.log(req.query);
    const movies = await Movie.findById(id);

    if (!Object.keys(movies).length) {
        throw new ApiError(404, "Movies not found.")
    }
    
    // return res.status(200).json({ totalItems, page, totalPages, movies });
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        movies,
        "Movies details fetched successfully"
    ))
});

// get single movies details
const createMovie = asyncHandler(async(req, res) => {

    console.log(req.body);
    const {title, runtime, genres} = req.body;
    
    if(title==="") {
        throw new ApiError(400, "Error in creation, Title is required");        
    }
    if(runtime==="") {
        throw new ApiError(400, "Error in creation, Runtime is required");        
    }
    if(!genres.length) {
        throw new ApiError(400, "Error in creation, Genres is required");        
    }

    const movie = await Movie.create({
        title,
        runtime,
        genres
    });

    const createdMovie = await Movie.findById(movie._id).select();

    if(!createdMovie) {
        throw new ApiError(500, "Error while creating the movie");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "Movie created successfully.")
    );

});


export { getMovieList, getMovie, createMovie }