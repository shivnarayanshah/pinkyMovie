"use server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const getHeaders = () => ({
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
});

/**
 * Normalize TMDB movie details to match our database schema
 */
function normalizeTMDBMovie(tmdbMovie) {
    return {
        movie_id: tmdbMovie.id.toString(),
        title: tmdbMovie.title,
        original_title: tmdbMovie.original_title,
        overview: tmdbMovie.overview,
        tagline: tmdbMovie.tagline || "",
        country: tmdbMovie.production_countries?.[0]?.name || "Unknown",
        genres: tmdbMovie.genres?.map((g) => g.name) || [],
        original_language: tmdbMovie.original_language,
        language: "English", // Default, can be refined
        popularity: tmdbMovie.popularity || 0,
        rating: tmdbMovie.vote_average || 0,
        runtime: tmdbMovie.runtime,
        release_date: tmdbMovie.release_date,
        revenue: tmdbMovie.revenue || 0,
        imdb_id: tmdbMovie.imdb_id,
        poster_url: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : "",
        backdrop_url: tmdbMovie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.backdrop_path}` : "",
        status: tmdbMovie.status,
        views: 0,
        downloadLinks: [],
    };
}

export async function searchTMDBMovies(query) {
    if (!query) return { success: false, message: "Query is required" };

    try {
        const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
        const res = await fetch(url, { headers: getHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.status_message || "TMDB Error");

        return {
            success: true,
            results: data.results.map((m) => ({
                id: m.id,
                title: m.title,
                release_date: m.release_date,
                rating: m.vote_average,
                poster_url: m.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : null,
            })),
        };
    } catch (error) {
        console.error("TMDB Search Error:", error);
        return { success: false, message: error.message };
    }
}

export async function getTMDBMovieDetails(tmdbId) {
    if (!tmdbId) return { success: false, message: "TMDB ID is required" };

    try {
        const url = `${TMDB_BASE_URL}/movie/${tmdbId}?language=en-US`;
        const res = await fetch(url, { headers: getHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.status_message || "TMDB Error");

        return {
            success: true,
            movie: normalizeTMDBMovie(data),
        };
    } catch (error) {
        console.error("TMDB Details Error:", error);
        return { success: false, message: error.message };
    }
}
