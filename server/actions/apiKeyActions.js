"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDatabase from "../lib/connectDB.js";
import ApiKey from "../models/apiKeyModel.js";
import { getUserFromToken } from "../lib/auth.js";
import { revalidateTag } from "next/cache";

async function verifyAdmin() {
    const user = await getUserFromToken();
    if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }
    return user;
}

export async function generateApiKey(label) {
    await verifyAdmin();
    await connectDatabase();

    const rawKey = `mv_${crypto.randomBytes(24).toString("hex")}`;
    const hashedKey = await bcrypt.hash(rawKey, 10);

    const newApiKey = await ApiKey.create({
        key: rawKey, // Store the full raw key for display and copying
        hashedKey,
        label,
    });

    revalidateTag("api-keys");

    return {
        success: true,
        message: "API Key generated successfully. Please copy it now, it won't be shown again.",
        apiKey: rawKey,
        id: newApiKey._id.toString(),
    };
}

export async function listApiKeys() {
    await verifyAdmin();
    await connectDatabase();

    const keys = await ApiKey.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(keys));
}

export async function toggleApiKeyStatus(id) {
    await verifyAdmin();
    await connectDatabase();

    const apiKey = await ApiKey.findById(id);
    if (!apiKey) throw new Error("API Key not found");

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    revalidateTag("api-keys");
    return { success: true, message: `API Key ${apiKey.isActive ? "activated" : "deactivated"} successfully` };
}

export async function deleteApiKey(id) {
    await verifyAdmin();
    await connectDatabase();

    await ApiKey.findByIdAndDelete(id);
    revalidateTag("api-keys");
    return { success: true, message: "API Key deleted successfully" };
}
