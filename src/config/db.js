// This file is responsible for connecting to the MongoDB database using Mongoose. It exports a function that can be called to establish the connection when the server starts.
// It uses the MONGO_URI environment variable to get the connection string for the database. If the connection is successful, it logs a success message; if it fails, it logs an error message and exits the process.
// The connectDB function is called in the server.js file before starting the server to ensure that the database connection is established before handling any requests.
// The code uses the Mongoose library to connect to the MongoDB database. It handles both successful and failed connection attempts, providing feedback in the console.
// src/config/db.js
const moongoose = require('mongoose');// Import the Mongoose library to connect to MongoDB

async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.log("❌ MONGO_URI is not defined in environment variables");
        throw new Error("MONGO_URI is missing");
    }

    // Mask password for security but show start/end of URI
    const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
    console.log(`📡 Using URI: ${maskedUri.substring(0, 20)}...${maskedUri.substring(maskedUri.length - 10)}`);

    try {
        console.log("⏳ Connecting to MongoDB...");
        await moongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // Fail faster (5s) so we can see the error
        });
        console.log('✅ Server is connected to the database');
    } catch (err) {
        console.log("❌ Database connection error details:");
        console.log(err); // Log the full error object
        throw err;
    }
}

module.exports = connectDB;// Export the connectDB function so it can be used in other parts of the application, such as server.js