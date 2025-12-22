"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { searchTMDBMovies, getTMDBMovieDetails } from "@/server/actions/tmdbActions";
import { saveMovie } from "@/server/actions/movieActions";
import { useFormik } from "formik";
import { MovieValidationSchema } from "@/server/lib/movieValidation";
import toast from "react-hot-toast";

import MovieForm from "@/components/MovieForm";

export default function AddMoviePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            movie_id: "",
            title: "",
            original_title: "",
            overview: "",
            tagline: "",
            country: "",
            genres: [],
            original_language: "",
            language: "English",
            popularity: 0,
            rating: 0,
            runtime: 0,
            release_date: "",
            revenue: 0,
            imdb_id: "",
            poster_url: "",
            backdrop_url: "",
            status: "",
            downloadLinks: [],
        },
        validationSchema: MovieValidationSchema,
        onSubmit: async (values, { resetForm }) => {
            const res = await saveMovie(values);
            if (res.success) {
                toast.success(res.message);
                resetForm();
            } else {
                toast.error(res.message);
            }
        },
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        setLoading(true);
        const res = await searchTMDBMovies(searchQuery);
        if (res.success) {
            setSearchResults(res.results);
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleSelectMovie = async (tmdbId) => {
        setLoading(true);
        const res = await getTMDBMovieDetails(tmdbId);
        if (res.success) {
            formik.setValues({
                ...formik.initialValues, // Preserve defaults
                ...res.movie,
                downloadLinks: [], // Clear for new movie
            });
            toast.success("Movie details fetched from TMDB");
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Search Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
                        <h3 className="text-lg font-bold mb-4">TMDB Search</h3>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Search movie..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Search</button>
                        </form>

                        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {searchResults.length === 0 && !loading && (
                                <p className="text-gray-400 text-center py-10 text-sm italic">Search movies to populate form</p>
                            )}
                            {searchResults.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-blue-100"
                                    onClick={() => handleSelectMovie(m.id)}
                                >
                                    <img src={m.poster_url} alt={m.title} className="w-10 h-14 rounded shadow-sm object-cover" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 leading-tight truncate">{m.title}</p>
                                        <p className="text-xs text-gray-500">{m.release_date?.split("-")[0] || "N/A"} • ⭐ {m.rating.toFixed(1)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="lg:col-span-3">
                    <MovieForm
                        formik={formik}
                        title="Add New Movie"
                        submitText="Save Movie"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
