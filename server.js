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

const PORT = 3000;

async function startServer() {
  try {
    // ✅ Wait for DB connection
    await connectDB();

    console.log("DB connected successfully");

    // ✅ Start server AFTER DB is ready
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect DB:", error);
    process.exit(1);
  }
}

startServer();