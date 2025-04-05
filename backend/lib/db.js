import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.js";

export const connectDB = async () => {
  try {
    const con = await mongoose.connect(ENV_VARS.MONGO_URI);
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (error) {
    console.log(`Error lining to DB :  ${error.message}`);
    process.exit(1);
  }
};
