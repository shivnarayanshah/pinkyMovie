"use server";

import connectDatabase from "../lib/connectDB.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { signJWT } from "../lib/auth.js";
import { cookies } from "next/headers";

export async function login(email, password) {
    await connectDatabase();

    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return { success: false, message: "Invalid credentials" };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        const token = await signJWT({
            id: user._id.toString(),
            role: user.role,
            email: user.email
        });

        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return {
            success: true,
            message: "Logged in successfully",
            user: { email: user.email, role: user.role }
        };

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: "Something went wrong" };
    }
}

export async function register(email, password) {
    await connectDatabase();

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { success: false, message: "User already exists" };
        }

        const userCount = await User.countDocuments();
        const role = userCount === 0 ? "admin" : "user";

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            role,
        });

        return {
            success: true,
            message: `User registered successfully as ${role}. Please login.`,
            user: { email: newUser.email, role: newUser.role }
        };

    } catch (error) {
        console.error("Registration Error:", error);
        return { success: false, message: "Failed to register user" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return { success: true, message: "Logged out successfully" };
}
