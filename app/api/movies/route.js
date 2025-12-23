import { NextResponse } from "next/server";
import connectDatabase from "@/server/lib/connectDB";
import Movie from "@/server/models/movieModel";
import ApiKey from "@/server/models/apiKeyModel";
import bcrypt from "bcryptjs";

/* ---------------- CORS CONFIG ---------------- */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Access-Control-Max-Age": "86400",
};

/* ---------------- OPTIONS (PRE-FLIGHT) ---------------- */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/* ---------------- GET MOVIES ---------------- */
export async function GET(request) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const language = searchParams.get("language") || "";

    const apiKeyRaw = request.headers.get("x-api-key");

    /* -------- API KEY VALIDATION -------- */
    if (!apiKeyRaw) {
      return NextResponse.json(
        { success: false, message: "API Key missing" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const apiKeys = await ApiKey.find({ isActive: true }).lean();
    let validKey = null;

    for (const key of apiKeys) {
      const isMatch = await bcrypt.compare(apiKeyRaw, key.hashedKey);
      if (isMatch) {
        validKey = key;
        break;
      }
    }

    if (!validKey) {
      return NextResponse.json(
        { success: false, message: "Invalid API Key" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    /* -------- QUERY BUILD -------- */
    const query = {};
    if (search) query.$text = { $search: search };
    if (genre) query.genres = { $in: [genre] };
    if (language) query.language = language;

    const total = await Movie.countDocuments(query);

    if (total === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        },
        { headers: CORS_HEADERS }
      );
    }

    const movies = await Movie.find(query)
      .sort({ release_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    /* -------- TRACK API USAGE (NON-BLOCKING) -------- */
    ApiKey.findByIdAndUpdate(validKey._id, {
      $inc: { usage: 1 },
      $set: { lastUsedAt: new Date() },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        data: movies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Movies API Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
