// This file is responsible for connecting to the MongoDB database using Mongoose. It exports a function that can be called to establish the connection when the server starts.
// It uses the MONGO_URI environment variable to get the connection string for the database. If the connection is successful, it logs a success message; if it fails, it logs an error message and exits the process.
// The connectDB function is called in the server.js file before starting the server to ensure that the database connection is established before handling any requests.
// The code uses the Mongoose library to connect to the MongoDB database. It handles both successful and failed connection attempts, providing feedback in the console.
// src/config/db.js
const moongoose = require('mongoose');// Import the Mongoose library to connect to MongoDB

function connectDB() // Define a function to connect to the database
{
    moongoose.connect(process.env.MONGO_URI)   // Use the MONGO_URI environment variable to connect to the database
    .then(()=> {
        console.log('server is connected to the database')// Log a success message if the connection is successful
    })
    .catch((err=>{// Log an error message if the connection fails
        console.log("server is connected to db")
        process.exit(1);// Exit the process with a failure code if the connection fails
    }))
}

module.exports = connectDB;// Export the connectDB function so it can be used in other parts of the application, such as server.js