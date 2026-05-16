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

// Catch unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err);
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log("❌ Server failed to start:", error.message);
    process.exit(1);
  }
}

startServer();