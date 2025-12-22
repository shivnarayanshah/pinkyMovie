"use server";

import { unstable_cache } from "next/cache";
import connectDatabase from "../lib/connectDB.js";
import Movie from "../models/movieModel.js";
import { getUserFromToken } from "../lib/auth.js";

async function verifyAdmin() {
    const user = await getUserFromToken();
    if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }
    return user;
}

// Internal data fetching function wrapped in unstable_cache
const fetchCachedAnalytics = unstable_cache(
    async () => {
        await connectDatabase();

        const [
            totalMovies,
            recentMovies,
            genreStats,
            languageStats,
            topRated,
            topViewed
        ] = await Promise.all([
            Movie.countDocuments(),
            Movie.find().sort({ createdAt: -1 }).limit(5).lean(),
            Movie.aggregate([
                { $unwind: "$genres" },
                { $group: { _id: "$genres", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Movie.aggregate([
                { $group: { _id: "$display_language", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Movie.find().sort({ rating: -1 }).limit(5).lean(),
            Movie.find().sort({ views: -1 }).limit(10).lean()
        ]);

        return {
            totalMovies,
            recentMovies: JSON.parse(JSON.stringify(recentMovies)),
            genreStats,
            languageStats,
            topRated: JSON.parse(JSON.stringify(topRated)),
            topViewed: JSON.parse(JSON.stringify(topViewed)),
        };
    },
    ["dashboard-analytics"],
    { revalidate: 3600, tags: ["movies"] } // Cache for 1 hour, revalidate on movie changes
);

// Publicly exported server action
export async function getDashboardAnalytics() {
    await verifyAdmin(); // Perform auth check OUTSIDE the cache
    return await fetchCachedAnalytics();
}
