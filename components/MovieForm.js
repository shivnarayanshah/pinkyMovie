"use client";

import { FieldArray, FormikProvider } from "formik";
import toast from "react-hot-toast";

export default function MovieForm({ formik, title, submitText }) {
    return (
        <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {formik.isSubmitting ? "Saving..." : submitText}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Basic Info */}
                    <div className="space-y-4 md:col-span-2">
                        <h4 className="font-bold text-blue-600 uppercase tracking-wider text-xs">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Title</label>
                                <input {...formik.getFieldProps("title")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Movie Title" />
                                {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Original Title</label>
                                <input {...formik.getFieldProps("original_title")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Original Language Title" />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Movie ID (Unique)</label>
                                <input {...formik.getFieldProps("movie_id")} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 font-mono text-xs" placeholder="e.g. 550" />
                                {formik.touched.movie_id && formik.errors.movie_id && <p className="text-red-500 text-xs mt-1">{formik.errors.movie_id}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Tagline</label>
                                <input {...formik.getFieldProps("tagline")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Catchy phrase..." />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-semibold text-gray-700 mb-1">Overview</label>
                        <textarea {...formik.getFieldProps("overview")} rows="4" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Plot summary..." />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-4 md:col-span-2 mt-4">
                        <h4 className="font-bold text-blue-600 uppercase tracking-wider text-xs">Metadata & Stats</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Release Date</label>
                                <input type="date" {...formik.getFieldProps("release_date")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs" />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Runtime (min)</label>
                                <input type="number" {...formik.getFieldProps("runtime")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Rating (0-10)</label>
                                <input type="number" step="0.1" {...formik.getFieldProps("rating")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Popularity</label>
                                <input type="number" step="0.1" {...formik.getFieldProps("popularity")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Country</label>
                            <input {...formik.getFieldProps("country")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. USA" />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Original Language</label>
                            <input {...formik.getFieldProps("original_language")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. en" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Genres (Comma separated)</label>
                            <input
                                value={formik.values.genres.join(", ")}
                                onChange={(e) => formik.setFieldValue("genres", e.target.value.split(",").map(g => g.trim()).filter(g => g !== ""))}
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Action, Drama, Thriller"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">IMDB ID</label>
                            <input {...formik.getFieldProps("imdb_id")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="tt1234567" />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="space-y-4 md:col-span-2 mt-4">
                        <h4 className="font-bold text-blue-600 uppercase tracking-wider text-xs">Media Links</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Poster URL</label>
                                <input {...formik.getFieldProps("poster_url")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs" placeholder="https://..." />
                                {formik.touched.poster_url && formik.errors.poster_url && <p className="text-red-500 text-xs mt-1">{formik.errors.poster_url}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Backdrop URL</label>
                                <input {...formik.getFieldProps("backdrop_url")} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs" placeholder="https://..." />
                            </div>
                        </div>
                    </div>

                    {/* Download Links */}
                    <div className="md:col-span-2 mt-4">
                        <h4 className="font-bold text-blue-600 uppercase tracking-wider text-xs mb-4">Download Links</h4>
                        <FieldArray
                            name="downloadLinks"
                            render={arrayHelpers => (
                                <div className="space-y-3">
                                    {formik.values.downloadLinks.map((link, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                name={`downloadLinks.${index}`}
                                                value={link}
                                                onChange={formik.handleChange}
                                                placeholder="https://download-link.com"
                                                className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => arrayHelpers.remove(index)}
                                                className="bg-red-50 text-red-600 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => arrayHelpers.push("")}
                                        className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline"
                                    >
                                        + Add Download Link
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-end">
                    <p className="text-xs text-gray-400 italic">Ensure all URLs are valid and accessible.</p>
                </div>
            </form>
        </FormikProvider>
    );
}
