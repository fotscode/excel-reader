import mongoose from "mongoose"

const BATCH_SIZE = 512

interface DBConfig {
    host: string;
    port: string;
    name: string;
}

const dbConfig: DBConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || '27017',
    name: process.env.DB_NAME || 'koibanx_challenge'
}

const connectToDB = async () => {
    mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err))
}

export { connectToDB, BATCH_SIZE }
