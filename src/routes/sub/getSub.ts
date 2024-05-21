import { Router } from "express";
import JWTAuth from "../../middleware/auth"
import { Stripe } from "stripe";

import users from "../../models/users"

const router = Router()

let stripe: Stripe;

if (process.env.STRIPE_PK) {
    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16",
    });
} else {
    console.log("stripe pk not found")
    process.exit(1)
}

router.get("/:email", JWTAuth, async (req, res) => {
    const email = req.params.email

    try {
        const user = await users.findOne({ email })

        if (!user) {
            res.status(404).end();
            return;
        }

        const subscription = await stripe.subscriptions.retrieve(user.subID!)

        res.json({
            endDate: user.endDate,
            billing: user.billing,
            plan: user.plan,
            substate: subscription.status
        })
    } catch (e) {
        console.log(e)
    }
})

export default router
