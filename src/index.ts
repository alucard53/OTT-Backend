import express from "express"
import bodyParser from "body-parser"
import { configDotenv } from "dotenv"
import cors from "cors"
import mongoose from "mongoose"

import register from "./routes/register"

configDotenv()

async function main() {

    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
    }

    const app = express()
    app.use(bodyParser.json())
    app.use(cors())

    //assign register route to handler
    app.use("/register", register)

    app.listen(6969, () => { console.log("App started in http://localhost:6969") })
}

main()