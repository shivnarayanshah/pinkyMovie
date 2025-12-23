"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getAllMovies, deleteMovie } from "@/server/actions/movieActions";
import toast from "react-hot-toast";
import Link from "next/link";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function AllMoviesPage() {
    const [movies, setMovies] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [movieToDelete, setMovieToDelete] = useState(null);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        const res = await getAllMovies({ page, search, limit: 10 });
        if (res.success) {
            setMovies(res.movies);
            setTotal(res.total);
        }
        setLoading(false);
    }, [page, search]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchMovies();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [fetchMovies]);

    const openDeleteModal = (movie) => {
        setMovieToDelete(movie);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!movieToDelete) return;

        setIsModalOpen(false);
        const res = await deleteMovie(movieToDelete.movie_id);

        if (res.success) {
            toast.success(res.message);
            fetchMovies();
        } else {
            toast.error(res.message);
        }
        setMovieToDelete(null);
    };

    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search by title, genre, or overview..."
                            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Movie</th>
                                <th className="px-6 py-4">Release Date</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-6 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : movies.length > 0 ? (
                                movies.map((m) => (
                                    <tr key={m.movie_id} className="hover:bg-gray-50 transition-colors  ">
                                        <td className="px-6 py-4 ">
                                            <div className="flex items-center">
                                                <div className="w-10 h-14 shrink-0 rounded overflow-hidden shadow-sm mr-4 bg-gray-100">
                                                    <img
                                                        src={m.poster_url || "/placeholder-poster.svg"}
                                                        className="w-full h-full object-cover"
                                                        alt={m.title || "Movie poster"}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/placeholder-poster.svg";
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{m.title || "Untitled"}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {m.original_language?.toUpperCase() || "N/A"} • {Array.isArray(m.genres) ? m.genres.slice(0, 2).join(", ") : "No Genre"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{m.release_date || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-yellow-600">⭐ {typeof m.rating === 'number' ? m.rating.toFixed(1) : "N/A"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${m.status?.toLowerCase() === 'released' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {m.status || "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                href={`/admin/movies/edit/${m.movie_id}`}
                                                className="text-blue-600 hover:text-blue-900 font-bold bg-blue-50 px-3 py-1 rounded-lg transition-all active:scale-95"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => openDeleteModal(m)}
                                                className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No movies found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Showing <span className="font-bold text-gray-900">{(page - 1) * 10 + 1}-{Math.min(page * 10, total)}</span> of <span className="font-bold text-gray-900">{total}</span> movies</p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page * 10 >= total}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                movieTitle={movieToDelete?.title}
            />
        </AdminLayout>
    );
}
