import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.SECRET_KEY || "default_secret_keep_it_safe"
);

export async function signJWT(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(SECRET);
}

export async function verifyJWT(token) {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    return await verifyJWT(token);
}
