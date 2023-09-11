//New User Registration route

import { Router } from "express"
import { Stripe } from "stripe"
import { configDotenv } from "dotenv"

import users from "../models/users"

//Intialize config to access variables from .env file
configDotenv()

const router = Router()
let stripe: Stripe
//Initialize stripe object
if (process.env.STRIPE_PK) {
    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16",
    })
    if (!stripe) {
        console.log("Stripe connection failed")
        process.exit(1)
    }
}

router.post("/", async (req, res) => {
    //get creds from request body
    const { name, email, password } = req.body

    if (await users.findOne({ email })) { //check if email already exists
        res.status(400).end()
        return
    }

    //create stripe customer
    const customer = await stripe.customers.create({
        description: "",
        name,
        email,
    })

    //error from stripe in creating customer
    if (!customer) {
        res.status(500).end()
        return
    }

    //add to db and handle error
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
        res.status(500).end()
    } else {
        res.status(200).end()
    }

})

export default router
