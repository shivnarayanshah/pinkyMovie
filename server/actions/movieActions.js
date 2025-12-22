"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import connectDatabase from "../lib/connectDB.js";
import Movie from "../models/movieModel.js";
import { normalizeLanguage } from "../lib/languageHelper.js";
import { getUserFromToken } from "../lib/auth.js";
import { MovieValidationSchema } from "../lib/movieValidation.js";

async function verifyAdmin() {
    const user = await getUserFromToken();
    if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }
    return user;
}

/* -------------------------------------------------------------------------- */
/*                            HELPER: Fix movie object                         */
/* -------------------------------------------------------------------------- */

function normalizeMovie(doc) {
    if (!doc) return null;

    const m = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));

    if (m._id) m._id = m._id.toString();

    if (m.release_date instanceof Date) {
        m.release_date = m.release_date.toISOString().split("T")[0];
    }

    if (m.createdAt instanceof Date) {
        m.createdAt = m.createdAt.toISOString();
    }

    if (m.updatedAt instanceof Date) {
        m.updatedAt = m.updatedAt.toISOString();
    }

    return m;
}

/* -------------------------------------------------------------------------- */
/*                             SAVE MOVIE (NO CACHE)                           */
/* -------------------------------------------------------------------------- */

export async function saveMovie(rawMovieData) {
    await verifyAdmin();
    await connectDatabase();

    try {
        // 1. Pre-process and normalize data
        const movieData = {
            ...rawMovieData,
            // Handle display_language if passed as "language" from old form
            display_language: rawMovieData.display_language || rawMovieData.language || "Hindi",
            rating: Number(rawMovieData.rating) || 0,
            popularity: Number(rawMovieData.popularity) || 0,
            runtime: Number(rawMovieData.runtime) || 0,
            revenue: Number(rawMovieData.revenue) || 0,
            genres: Array.isArray(rawMovieData.genres)
                ? rawMovieData.genres
                : rawMovieData.genres?.split(",").map((g) => g.trim()).filter(Boolean) || [],
            downloadLinks: Array.isArray(rawMovieData.downloadLinks)
                ? rawMovieData.downloadLinks.filter(Boolean)
                : [],
        };

        // Explicitly remove old field to prevent conflict with MongoDB's reserved 'language' field
        delete movieData.language;

        // 2. Validate with Yup
        await MovieValidationSchema.validate(movieData, { abortEarly: false });

        // 3. Check for duplicates
        const exists = await Movie.findOne({ movie_id: movieData.movie_id });
        if (exists) {
            return { success: false, message: "Movie with this ID already exists" };
        }

        // 4. Create record
        console.log("DEBUG: Final Movie Data for DB:", JSON.stringify(movieData, null, 2));
        await Movie.create(movieData);

        revalidateTag("movies");
        if (movieData.movie_id) {
            revalidateTag(`movie-${movieData.movie_id}`);
        }

        return { success: true, message: "Movie saved successfully" };

    } catch (err) {
        console.error("Save Movie Error:", err);
        return {
            success: false,
            message: err.name === "ValidationError" ? "Validation failed: " + err.errors.join(", ") : "Failed to save movie",
            error: err.message
        };
    }
}

/* -------------------------------------------------------------------------- */
/*                           GET ALL MOVIES (CACHED)                           */
/* -------------------------------------------------------------------------- */

const cachedGetAllMovies = (params) => unstable_cache(
    async () => {
        const { page = 1, limit = 20, search = "" } = params;
        await connectDatabase();

        let query = {};

        if (search.trim() !== "") {
            query = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { original_title: { $regex: search, $options: "i" } },
                    { overview: { $regex: search, $options: "i" } },
                    { genres: { $in: [new RegExp(search, "i")] } },
                    { country: { $regex: search, $options: "i" } },
                ],
            };
        }

        const totalMovies = await Movie.countDocuments(query);
        const movies = await Movie.find(query)
            .sort({ release_date: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const normalized = movies.map((m) => normalizeMovie(m));

        return {
            success: true,
            movies: normalized,
            total: totalMovies,
            page,
            totalPages: Math.ceil(totalMovies / limit),
        };
    },
    ["all-movies", JSON.stringify(params)],
    {
        revalidate: 120,
        tags: ["movies"],
    }
)();

export async function getAllMovies(params) {
    return cachedGetAllMovies(params);
}

/* -------------------------------------------------------------------------- */
/*                          GET MOVIE BY ID (CACHED)                           */
/* -------------------------------------------------------------------------- */

const cachedGetMovieById = (movie_id) => unstable_cache(
    async () => {
        await connectDatabase();
        if (!movie_id) return { success: false, message: "ID is required" };
        const movie = await Movie.findOne({ movie_id }).lean();
        if (!movie) return { success: false, message: "Movie not found" };

        return { success: true, movie: normalizeMovie(movie) };
    },
    [`movie-${movie_id}`],
    {
        revalidate: 300,
        tags: [`movie-${movie_id}`, "movies"],
    }
)();

export async function getMovieById(movie_id) {
    if (!movie_id) return { success: false, message: "Movie ID is required" };
    return cachedGetMovieById(movie_id);
}

/* -------------------------------------------------------------------------- */
/*                        SEARCH MOVIES BY NAME (CACHED)                       */
/* -------------------------------------------------------------------------- */

const cachedSearchMovies = unstable_cache(
    async (name) => {
        await connectDatabase();
        const movies = await Movie.find({ $text: { $search: name } })
            .limit(50)
            .lean();

        return {
            success: true,
            movies: movies.map((m) => normalizeMovie(m)),
        };
    },
    (name) => [`search-${name}`],
    {
        revalidate: 60, // 1 minute
        tags: ["movies"],
    }
);

export async function getMoviesByName(name) {
    return cachedSearchMovies(name);
}

/* -------------------------------------------------------------------------- */
/*                          UPDATE MOVIE (NO CACHE)                            */
/* -------------------------------------------------------------------------- */

export async function updateMovie(movie_id, rawUpdateData) {
    await verifyAdmin();
    await connectDatabase();

    try {
        // 1. Pre-process data
        const updatedData = {
            ...rawUpdateData,
            // Handle display_language rename and cleanup old field
            display_language: rawUpdateData.display_language || rawUpdateData.language || "Hindi",
            rating: Number(rawUpdateData.rating) || 0,
            popularity: Number(rawUpdateData.popularity) || 0,
            runtime: Number(rawUpdateData.runtime) || 0,
            revenue: Number(rawUpdateData.revenue) || 0,
            genres: Array.isArray(rawUpdateData.genres)
                ? rawUpdateData.genres
                : rawUpdateData.genres?.split(",").map((g) => g.trim()).filter(Boolean) || [],
            downloadLinks: Array.isArray(rawUpdateData.downloadLinks)
                ? rawUpdateData.downloadLinks.filter(Boolean)
                : [],
        };

        // Explicitly remove old field to prevent conflict during $set
        delete updatedData.language;

        // 2. Validate with Yup
        await MovieValidationSchema.validate(updatedData, { abortEarly: false });

        // 3. Perform update
        const movie = await Movie.findOneAndUpdate(
            { movie_id },
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!movie) return { success: false, message: "Movie not found" };

        // 4. Invalidate cache
        revalidateTag("movies");
        if (movie_id) {
            revalidateTag(`movie-${movie_id}`);
        }

        return { success: true, message: "Movie updated successfully" };

    } catch (err) {
        console.error("Update Movie Error:", err);
        return {
            success: false,
            message: err.name === "ValidationError" ? "Validation failed: " + err.errors.join(", ") : "Failed to update movie",
            error: err.message
        };
    }
}

/* -------------------------------------------------------------------------- */
/*                          DELETE MOVIE (NO CACHE)                            */
/* -------------------------------------------------------------------------- */

export async function deleteMovie(movie_id) {
    await verifyAdmin();
    await connectDatabase();

    try {
        const movie = await Movie.findOneAndDelete({ movie_id });
        if (!movie) return { success: false, message: "Movie not found" };

        revalidateTag("movies");
        if (movie_id) {
            revalidateTag(`movie-${movie_id}`);
        }

        return { success: true, message: "Movie deleted successfully" };

    } catch (err) {
        console.error("Delete Movie Error:", err);
        return { success: false, message: "Failed to delete movie", error: err.message };
    }
}

/* -------------------------------------------------------------------------- */
/*                          MAINTENANCE: FIX INDEXES                           */
/* -------------------------------------------------------------------------- */

export async function fixMovieIndexes() {
    await verifyAdmin();
    await connectDatabase();

    try {
        console.log("Dropping movie collection indexes...");
        await Movie.collection.dropIndexes();
        console.log("Indexes dropped. Mongoose will recreate them on next operation.");
        return { success: true, message: "Movie indexes dropped and will be recreated." };
    } catch (err) {
        console.error("Index fix error:", err);
        return { success: false, message: "Failed to fix indexes", error: err.message };
    }
}
