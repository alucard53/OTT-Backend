import express from "express"

import bodyParser from "body-parser"
import { configDotenv } from "dotenv"
import cors from "cors"
import { Stripe } from "stripe"

import users from "./models/users"
import mongoose from "mongoose"

configDotenv()

async function main() {

    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
    }

    let stripe: Stripe;

    if (process.env.STRIPE_PK) {
        stripe = new Stripe(process.env.STRIPE_PK, {
            apiVersion: "2023-08-16",
        })
        if (!stripe) {
            console.log("Stripe connection failed")
            process.exit(1)
        }
        console.log("Connected to Stripe")
    }

    const app = express()
    app.use(bodyParser.json())
    app.use(cors())

    app.post("/register", async (req, res) => {
        const { name, email, password } = req.body

        if (await users.findOne({ email })) {
            res.writeHead(400)
        } else {
            const customer = await stripe.customers.create({
                description: "",
                name,
                email,
            })
            if (!customer) {
                res.writeHead(500)
            } else {
                if (!await users.create({
                    name,
                    email,
                    password,
                    plan: 0,
                    stripeID: customer.id,
                    substate: "None",
                    billing: 0,
                    startDate: Date.now(),
                })) {
                    res.writeHead(500)
                } else {
                    res.writeHead(200)
                }
            }
        }
        res.end()
    })

    app.listen(6969, () => { console.log("App started in http://localhost:6969") })
}

main()
