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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const formik = useFormik({
        // ... (initialValues stay the same)
        initialValues: {
            movie_id: "",
            title: "",
            original_title: "",
            overview: "",
            tagline: "",
            country: "",
            genres: [],
            original_language: "",
            display_language: "Hindi",
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

    const handleSearch = async (e, page = 1) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;
        setLoading(true);
        const res = await searchTMDBMovies(searchQuery, page);
        if (res.success) {
            setSearchResults(res.results);
            setCurrentPage(res.currentPage);
            setTotalPages(res.totalPages);
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
                        <form onSubmit={(e) => handleSearch(e, 1)} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Search movie..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer">Search</button>
                        </form>

                        <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto mb-4">
                            {searchResults.length === 0 && !loading && (
                                <p className="text-gray-400 text-center py-10 text-sm italic">Search movies to populate form</p>
                            )}
                            {searchResults.map((m) => {
                                const isSelected = formik.values.movie_id === m.id.toString();
                                return (
                                    <div
                                        key={m.id}
                                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border transform active:scale-95 ${isSelected
                                            ? "bg-blue-100 border-blue-400 shadow-sm"
                                            : "hover:bg-blue-50 border-transparent hover:border-blue-100 active:bg-blue-200"
                                            }`}
                                        onClick={() => handleSelectMovie(m.id)}
                                    >
                                        <div className="w-16 h-24 shrink-0 bg-gray-100 rounded overflow-hidden shadow-sm">
                                            <img src={m.poster_url || "/placeholder-poster.png"} alt={m.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 leading-tight truncate">{m.title}</p>
                                            <p className="text-xs text-gray-500">{m.release_date?.split("-")[0] || "N/A"} • ⭐ {m.rating.toFixed(1)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleSearch(null, currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <span className="text-xs font-bold text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handleSearch(null, currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        )}
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
