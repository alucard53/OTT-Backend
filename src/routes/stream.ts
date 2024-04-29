import { Router } from "express";
import movies from "../models/movies";
import users from "../models/users";
import getPayload from "../getPayload";
import Stripe from "stripe";

let stripe: Stripe;

if (process.env.STRIPE_PK) {
    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16",
    });
} else {
    console.log("stripe pk not found")
    process.exit(1)
}

const router = Router()

router.get("/:id", async (req, res) => {
    const id = req.params.id

    const data = await getPayload(req.headers.authorization)

    if (!data) {
        res.status(400).end()
        return
    }

    const user = await users.findOne({ email: data.payload.email })

    if (!user || !user.subID) {
        res.status(404).end()
        return
    }

    const subscription = await stripe.subscriptions.retrieve(user.subID)

    if (subscription.status === "active") {
        const movie = await movies.findOne({ id })
        if (!movie) {
            res.status(404).end()
            return
        }

        res.status(200).json(movie)
    } else {
        res.status(401).end()
    }
})

export default router;
