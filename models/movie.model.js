import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genres: { type: [String], required: true },
  runtime: { type: Number, required: true },
  cast: { type: [String], required: true },
  num_mflix_comments: { type: Number, required: true },
  poster: { type: String, required: true },
  rated: { type: String, required: false },
  fullplot: { type: String, required: false },
  countries: { type: [String], required: false },
  released: { type: Date, required: false },
  directors: { type: [String], required: false },
  writers: { type: [String], required: false },
  plot: { type: String, required: false },
//   awards: {
//     wins: { type: Number, required: false },
//     nominations: { type: Number, required: false },
//     text: { type: String, required: true },
//   },
  lastupdated: { type: Date, required: false },
  year: { type: Number, required: true },
  imdb: {
    rating: { type: Number, required: false },
    votes: { type: Number, required: false },
    id: { type: Number, required: false },
  },
  type: { type: String, required: false },
  tomatoes: {
    viewer: {
      rating: { type: Number, required: false },
      numReviews: { type: Number, required: false },
      meter: { type: Number, required: false },
    },
  },
}, {timestamps : true});

export const Movie = mongoose.model('Movie', movieSchema);


// const movieSchema = new mongoose.Schema({
//     plot: { type: String, required: true },
//     genres: { type: [String], required: true },
//     runtime: { type: Number, required: true },
//     rated: { type: String, required: true },
//     cast: { type: [String], required: true },
//     num_mflix_comments: { type: Number, required: true },
//     poster: { type: String, required: true },
//     title: { type: String, required: true },
//     fullplot: { type: String, required: true },
//     countries: { type: [String], required: true },
//     released: { type: Date, required: true },
//     directors: { type: [String], required: true },
//     writers: { type: [String], required: true },
//     awards: {
//       wins: { type: Number, required: true },
//       nominations: { type: Number, required: true },
//       text: { type: String, required: true },
//     },
//     lastupdated: { type: Date, required: true },
//     year: { type: Number, required: true },
//     imdb: {
//       rating: { type: Number, required: true },
//       votes: { type: Number, required: true },
//       id: { type: Number, required: true },
//     },
//     type: { type: String, required: true },
//     tomatoes: {
//       viewer: {
//         rating: { type: Number, required: true },
//         numReviews: { type: Number, required: true },
//         meter: { type: Number, required: true },
//       },
//     },
//     lastUpdated: { type: Date, required: true },
//   }, {timestamps : true});
  