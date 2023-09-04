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
        res.writeHead(400)
    } else {

        //create stripe customer
        const customer = await stripe.customers.create({
            description: "",
            name,
            email,
        })

        //error from stripe in creating customer
        if (!customer) {
            res.writeHead(500)
        } else {
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
                res.writeHead(500)
            } else {
                res.writeHead(200)
            }
        }
    }
    res.end()

})

export default router
