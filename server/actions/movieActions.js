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

export async function saveMovie(movieData) {
    await verifyAdmin();
    await connectDatabase();

    try {
        // Normalize language field
        const language = normalizeLanguage(
            movieData.language,
            movieData.otherLanguage
        );

        const newMovieData = {
            ...movieData,
            language,
            rating: Number(movieData.rating) || 0,
            popularity: Number(movieData.popularity) || 0,
            runtime: Number(movieData.runtime) || 0,
            revenue: Number(movieData.revenue) || 0,
            genres: Array.isArray(movieData.genres)
                ? movieData.genres
                : movieData.genres.split(",").map((g) => g.trim()),
        };

        const exists = await Movie.findOne({ movie_id: newMovieData.movie_id });
        if (exists) {
            return { success: false, message: "Movie already exists" };
        }

        await Movie.create(newMovieData);

        // invalidate cache for listing & detail
        revalidateTag("movies");
        revalidateTag(`movie-${newMovieData.movie_id}`);

        return { success: true, message: "Movie saved successfully" };

    } catch (err) {
        console.error("Save Movie Error:", err);
        return { success: false, message: "Failed to save movie", error: err.message };
    }
}

/* -------------------------------------------------------------------------- */
/*                           GET ALL MOVIES (CACHED)                           */
/* -------------------------------------------------------------------------- */

const cachedGetAllMovies = unstable_cache(
    async ({ page = 1, limit = 20, search = "" }) => {
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
    ["all-movies-cache"],
    {
        revalidate: 120, // cache for 2 minutes
        tags: ["movies"],
    }
);

export async function getAllMovies(params) {
    return cachedGetAllMovies(params);
}

/* -------------------------------------------------------------------------- */
/*                          GET MOVIE BY ID (CACHED)                           */
/* -------------------------------------------------------------------------- */

const cachedGetMovieById = unstable_cache(
    async (movie_id) => {
        await connectDatabase();
        const movie = await Movie.findOne({ movie_id }).lean();
        if (!movie) return { success: false, message: "Movie not found" };

        return { success: true, movie: normalizeMovie(movie) };
    },
    (movie_id) => [`movie-${movie_id}`],
    {
        revalidate: 300, // cache for 5 minutes
        tags: (movie_id) => [`movie-${movie_id}`],
    }
);

export async function getMovieById(movie_id) {
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

export async function updateMovie(movie_id, updateData) {
    await verifyAdmin();
    await connectDatabase();

    try {
        // Normalize language field
        const language = normalizeLanguage(
            updateData.language,
            updateData.otherLanguage
        );

        const updatedData = {
            ...updateData,
            language,
            rating: Number(updateData.rating) || 0,
            popularity: Number(updateData.popularity) || 0,
            runtime: Number(updateData.runtime) || 0,
            revenue: Number(updateData.revenue) || 0,

            genres:
                typeof updateData.genres === "string"
                    ? updateData.genres
                        .split(",")
                        .map((g) => g.trim())
                        .filter((g) => g !== "")
                    : Array.isArray(updateData.genres)
                        ? updateData.genres
                        : [],

            downloadLinks: Array.isArray(updateData.downloadLinks)
                ? updateData.downloadLinks.filter((link) => link?.trim() !== "")
                : [],
        };

        const movie = await Movie.findOneAndUpdate(
            { movie_id },
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!movie) return { success: false, message: "Movie not found" };

        // invalidate cached detail + listing
        revalidateTag("movies");
        revalidateTag(`movie-${movie_id}`);

        return { success: true, message: "Movie updated successfully" };

    } catch (err) {
        console.error("Update Movie Error:", err);
        return { success: false, message: "Failed to update movie", error: err.message };
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
        revalidateTag(`movie-${movie_id}`);

        return { success: true, message: "Movie deleted successfully" };

    } catch (err) {
        console.error("Delete Movie Error:", err);
        return { success: false, message: "Failed to delete movie", error: err.message };
    }
}
