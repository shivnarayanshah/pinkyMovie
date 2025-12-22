import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        hashedKey: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usage: {
            type: Number,
            default: 0,
        },
        lastUsedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);
export default ApiKey;
