import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    movie_id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    original_title: { type: String },
    overview: { type: String },
    tagline: { type: String },
    country: { type: String },
    genres: [{ type: String }],
    original_language: { type: String },
    display_language: { type: String, default: 'Unknown', trim: true },
    popularity: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    runtime: { type: Number },
    release_date: { type: String },
    revenue: { type: Number, default: 0 },
    imdb_id: { type: String },
    poster_url: { type: String, required: true },
    backdrop_url: { type: String },
    status: { type: String },
    views: { type: Number, default: 0 },
    downloadLinks: { type: [String], default: [] }
  },
  {
    timestamps: true,
    collection: "movies"
  }
);

// Text search index - Explicitly set language_override to "none" to prevent conflicts with our "language" field
MovieSchema.index(
  { title: "text", original_title: "text", overview: "text" },
  { language_override: "none" }
);

// Sorting indexes
MovieSchema.index({ release_date: -1 });
MovieSchema.index({ rating: -1 });
MovieSchema.index({ popularity: -1 });

// Genre search index
MovieSchema.index({ genres: 1 });

const Movie = mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
export default Movie;
