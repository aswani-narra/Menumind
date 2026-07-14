const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not set. Copy .env.example to .env and configure it before starting the server.')
        }

        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected: ${ conn.connection.host }`)
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`)
        process.exit(1)
    }
}

module.exports = { connectDB }