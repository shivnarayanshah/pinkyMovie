import mongoose from "mongoose";

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    console.error("CRITICAL: MONGO_URI is not defined in .env");
    throw new Error("MONGO_URI is missing");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // Attempt connection with optimized settings for Atlas
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "PinkyMovies",
      // These are usually handled by defaults in v6+ but explicit is safer for some Atlas configs
      retryWrites: true,
      w: "majority",
    });

    console.log("MongoDB connected to database:", connection.connection.name);
    return connection;
  } catch (error) {
    if (error.message.includes("authentication failed")) {
      console.error("FATAL: MongoDB Authentication Failed. Please check your username and password in .env");
    } else {
      console.error("MongoDB connection error:", error.message);
    }
    throw error;
  }
};

export default connectDatabase;
