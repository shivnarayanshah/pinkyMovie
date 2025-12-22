import { NextResponse } from "next/server";
import connectDatabase from "@/server/lib/connectDB";
import Movie from "@/server/models/movieModel";
import ApiKey from "@/server/models/apiKeyModel";
import bcrypt from "bcryptjs";

export async function GET(request, { params: paramsPromise }) {
    const params = await paramsPromise;
    const { id } = params;
    const apiKeyRaw = request.headers.get("x-api-key");

    try {
        await connectDatabase();

        // 1. Validate API Key
        if (!apiKeyRaw) {
            return NextResponse.json({ success: false, message: "API Key missing" }, { status: 401 });
        }

        const apiKeys = await ApiKey.find({ isActive: true }).lean();
        let validKey = null;

        for (const k of apiKeys) {
            const match = await bcrypt.compare(apiKeyRaw, k.hashedKey);
            if (match) {
                validKey = k;
                break;
            }
        }

        if (!validKey) {
            return NextResponse.json({ success: false, message: "Invalid API Key" }, { status: 403 });
        }

        // 2. Fetch Movie and Update Views
        const movie = await Movie.findOneAndUpdate(
            { movie_id: id },
            { $inc: { views: 1 } },
            { new: true }
        ).lean();

        if (!movie) {
            return NextResponse.json({ success: false, message: "Movie not found" }, { status: 404 });
        }

        // 3. Update API Key usage (async)
        ApiKey.findByIdAndUpdate(validKey._id, {
            $inc: { usage: 1 },
            $set: { lastUsedAt: new Date() }
        }).catch(err => console.error("Update usage error:", err));

        return NextResponse.json({
            success: true,
            data: movie
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
