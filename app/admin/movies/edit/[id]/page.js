"use client";

import { useEffect, useState, use } from "react";
import AdminLayout from "@/components/AdminLayout";
import MovieForm from "@/components/MovieForm";
import { getMovieById, updateMovie } from "@/server/actions/movieActions";
import { useFormik } from "formik";
import { MovieValidationSchema } from "@/server/lib/movieValidation";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EditMoviePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
        onSubmit: async (values) => {
            const res = await updateMovie(id, values);
            if (res.success) {
                toast.success(res.message);
                router.push("/admin/movies");
            } else {
                toast.error(res.message);
            }
        },
    });

    useEffect(() => {
        const fetchMovie = async () => {
            const res = await getMovieById(id);
            if (res.success) {
                // Ensure no null values are passed to formik
                const sanitizedMovie = { ...res.movie };
                Object.keys(sanitizedMovie).forEach(key => {
                    if (sanitizedMovie[key] === null) {
                        sanitizedMovie[key] = "";
                    }
                });

                if (!sanitizedMovie.display_language && sanitizedMovie.language) {
                    sanitizedMovie.display_language = sanitizedMovie.language;
                }

                formik.setValues({
                    ...formik.initialValues,
                    ...sanitizedMovie,
                });
            } else {
                toast.error(res.message);
                router.push("/admin/movies");
            }
            setLoading(false);
        };
        fetchMovie();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <MovieForm
                    formik={formik}
                    title={`Edit Movie: ${formik.values.title}`}
                    submitText="Update Movie"
                />
            </div>
        </AdminLayout>
    );
}
