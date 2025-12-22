import { NextResponse } from "next/server";
import connectDatabase from "@/server/lib/connectDB";
import Movie from "@/server/models/movieModel";
import ApiKey from "@/server/models/apiKeyModel";
import bcrypt from "bcryptjs";

// ✅ 1. ADD THIS OPTIONS HANDLER FOR CORS PREFLIGHT
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        },
    });
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const language = searchParams.get("language") || "";
    const apiKeyRaw = request.headers.get("x-api-key");

    try {
        await connectDatabase();

        if (!apiKeyRaw) {
            return NextResponse.json({ success: false, message: "API Key missing" }, { 
                status: 401,
                headers: { 'Access-Control-Allow-Origin': '*' } // ✅ Always add CORS
            });
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
            return NextResponse.json({ success: false, message: "Invalid API Key" }, { 
                status: 403,
                headers: { 'Access-Control-Allow-Origin': '*' } // ✅ Always add CORS
            });
        }

        let query = {};
        if (search) { query.$text = { $search: search }; }
        if (genre) { query.genres = { $in: [genre] }; }
        if (language) { query.language = language; }

        const total = await Movie.countDocuments(query);
        
        // Handling the "no data" case gracefully
        if (total === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                pagination: { total: 0, page, limit, totalPages: 0 }
            }, { headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const movies = await Movie.find(query)
            .sort({ release_date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        ApiKey.findByIdAndUpdate(validKey._id, {
            $inc: { usage: 1 },
            $set: { lastUsedAt: new Date() }
        }).catch(err => console.error("Update usage error:", err));

        // ✅ 2. ADD ACCESS-CONTROL-ALLOW-ORIGIN TO THE FINAL RESPONSE
        return NextResponse.json({
            success: true,
            data: movies,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*', // Allows your frontend to fetch
            }
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { 
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            }
        );
    }
}
