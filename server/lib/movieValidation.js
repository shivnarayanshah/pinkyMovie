import * as Yup from "yup";

export const MovieValidationSchema = Yup.object().shape({
    movie_id: Yup.string().required("Movie ID is required"),
    title: Yup.string().required("Title is required"),
    original_title: Yup.string(),
    overview: Yup.string(),
    tagline: Yup.string(),
    country: Yup.string(),
    genres: Yup.array().of(Yup.string()).min(1, "At least one genre is required"),
    original_language: Yup.string(),
    language: Yup.string().default("English"),
    popularity: Yup.number().default(0),
    rating: Yup.number().min(0).max(10).default(0),
    runtime: Yup.number(),
    release_date: Yup.string(),
    revenue: Yup.number().default(0),
    imdb_id: Yup.string(),
    poster_url: Yup.string().url("Invalid URL").required("Poster URL is required"),
    backdrop_url: Yup.string().url("Invalid URL"),
    status: Yup.string(),
    downloadLinks: Yup.array().of(Yup.string().url("Invalid URL")),
});
