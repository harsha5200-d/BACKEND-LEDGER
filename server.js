// require('dotenv').config();
// const app = require(`./src/app`);
// const connectDB = require('./src/config/db');

// connectDB();

// app.listen(3000, () => {
//   console.log(`Server is running on port 3000`);
// }); 

// This file is the entry point of the application. It loads environment variables, connects to the database, and starts the server on port 3000.
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

console.log("🚀 Starting server initialization...");

async function startServer() {
  try {
    console.log("📡 Attempting to connect to database...");
    await connectDB();

    console.log("✅ DB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.log("❌ CRITICAL: Failed to start server:");
    console.log(error);
    process.exit(1);
  }
}

startServer();