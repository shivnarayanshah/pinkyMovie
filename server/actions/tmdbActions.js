"use server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const getHeaders = () => ({
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
});

/**
 * Normalize TMDB movie details to match our database schema
 * Includes robust null/undefined checks to prevent runtime errors
 */
function normalizeTMDBMovie(tmdbMovie) {
    // Ensure tmdbMovie exists
    if (!tmdbMovie) {
        console.error("normalizeTMDBMovie: Received null or undefined movie data");
        return null;
    }

    return {
        movie_id: tmdbMovie.id?.toString() || "",
        title: tmdbMovie.title || "",
        original_title: tmdbMovie.original_title || "",
        overview: tmdbMovie.overview || "",
        tagline: tmdbMovie.tagline || "",
        country: tmdbMovie.production_countries?.[0]?.name || "",
        genres: Array.isArray(tmdbMovie.genres) ? tmdbMovie.genres.map((g) => g?.name || "").filter(Boolean) : [],
        original_language: tmdbMovie.original_language || "",
        display_language: "Hindi", // Default matching user request
        popularity: typeof tmdbMovie.popularity === 'number' ? tmdbMovie.popularity : 0,
        rating: typeof tmdbMovie.vote_average === 'number' ? tmdbMovie.vote_average : 0,
        runtime: typeof tmdbMovie.runtime === 'number' ? tmdbMovie.runtime : 0,
        release_date: tmdbMovie.release_date || "",
        revenue: typeof tmdbMovie.revenue === 'number' ? tmdbMovie.revenue : 0,
        imdb_id: tmdbMovie.imdb_id || "",
        poster_url: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : "",
        backdrop_url: tmdbMovie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.backdrop_path}` : "",
        status: tmdbMovie.status || "",
        views: 0,
        downloadLinks: [],
    };
}

export async function searchTMDBMovies(query, page = 1) {
    if (!query) return { success: false, message: "Query is required" };

    try {
        const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`;
        const res = await fetch(url, { headers: getHeaders() });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.status_message || `TMDB API Error: ${res.status}`);
        }

        const data = await res.json();

        // Validate response structure
        if (!data.results || !Array.isArray(data.results)) {
            throw new Error("Invalid response structure from TMDB");
        }

        return {
            success: true,
            results: data.results.map((m) => ({
                id: m?.id || 0,
                title: m?.title || "Untitled",
                release_date: m?.release_date || "",
                rating: typeof m?.vote_average === 'number' ? m.vote_average : 0,
                poster_url: m?.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : null,
            })).filter(m => m.id !== 0), // Filter out invalid entries
            totalPages: data.total_pages || 1,
            currentPage: data.page || page,
        };
    } catch (error) {
        console.error("TMDB Search Error:", error);
        return {
            success: false,
            message: error.message || "Failed to search movies. Please try again.",
            results: [],
            totalPages: 0,
            currentPage: 1
        };
    }
}

export async function getTMDBMovieDetails(tmdbId) {
    if (!tmdbId) return { success: false, message: "TMDB ID is required" };

    try {
        const url = `${TMDB_BASE_URL}/movie/${tmdbId}?language=en-US`;
        const res = await fetch(url, { headers: getHeaders() });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.status_message || `TMDB API Error: ${res.status}`);
        }

        const data = await res.json();

        // Validate that we got movie data
        if (!data || !data.id) {
            throw new Error("Invalid movie data received from TMDB");
        }

        const normalizedMovie = normalizeTMDBMovie(data);

        if (!normalizedMovie) {
            throw new Error("Failed to normalize movie data");
        }

        return {
            success: true,
            movie: normalizedMovie,
        };
    } catch (error) {
        console.error("TMDB Details Error:", error);
        return {
            success: false,
            message: error.message || "Failed to fetch movie details. Please try again."
        };
    }
}
