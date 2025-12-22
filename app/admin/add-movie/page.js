"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { searchTMDBMovies, getTMDBMovieDetails } from "@/server/actions/tmdbActions";
import { saveMovie } from "@/server/actions/movieActions";
import { useFormik } from "formik";
import { MovieValidationSchema } from "@/server/lib/movieValidation";
import toast from "react-hot-toast";

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
                ...res.movie,
                downloadLinks: [], // Reset download links for new entry
            });
            toast.success("Movie details fetched from TMDB");
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4">TMDB Search</h3>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search movie..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl">Search</button>
                        </form>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {searchResults.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-blue-100"
                                    onClick={() => handleSelectMovie(m.id)}
                                >
                                    <img src={m.poster_url} alt={m.title} className="w-12 h-18 rounded shadow-sm" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{m.title}</p>
                                        <p className="text-xs text-gray-500">{m.release_date?.split("-")[0] || "N/A"} • ⭐ {m.rating.toFixed(1)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="lg:col-span-2">
                    <form onSubmit={formik.handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Movie Details</h3>
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md active:scale-95"
                            >
                                Save Movie
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Title</label>
                                <input {...formik.getFieldProps("title")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>}
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Movie ID (Unique)</label>
                                <input {...formik.getFieldProps("movie_id")} className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block font-medium text-gray-700 mb-1">Overview</label>
                                <textarea {...formik.getFieldProps("overview")} rows="4" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Poster URL</label>
                                <input {...formik.getFieldProps("poster_url")} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Genres (Comma separated)</label>
                                <input
                                    value={formik.values.genres.join(", ")}
                                    onChange={(e) => formik.setFieldValue("genres", e.target.value.split(",").map(g => g.trim()))}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Add more fields as per schema if needed, keeping it concise for now */}
                        <p className="text-xs text-gray-400 italic">Pre-filled with TMDB data where possible. All fields follow MovieSchema.</p>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
