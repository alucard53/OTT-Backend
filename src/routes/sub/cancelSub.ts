import { Router } from "express";
import { configDotenv } from "dotenv";
import { Stripe } from "stripe";

import users from "../../models/users";
import JWTAuth from "../../middleware/auth";


configDotenv()
const router = Router()

let stripe: Stripe

if (process.env.STRIPE_PK) {
    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16",
    })
} else {
    console.log("Stripe PK not found")
    process.exit(1);
}

router.get("/", JWTAuth, async (req, res) => {
    const email = res.locals.email

    try { // get user from DB
        const user = await users.findOne({ email })
        if (!user || !user.subID) {
            console.log("user not found")
            res.status(400).end()
            return
        }

        // retrieve subscription to check if active
        const subscription = await stripe.subscriptions.retrieve(user.subID)

        if (subscription.status !== "active") {
            res.status(400).end()
            console.log("tried to cancel inactive sub", subscription.latest_invoice)
            return
        }

        // cancel sub
        const cancel_res = await stripe.subscriptions.cancel(user.subID)

        if (cancel_res.status === "canceled") {

            // update db (don't really need, remove later)
            const db_res = await users.updateOne({ email }, {
                $set: {
                    substate: "Inactive",
                }
            })

            if (!db_res.acknowledged) {
                res.status(500).end()
            } else {
                res.status(200).end()
            }
        }
    } catch (e) {
        console.log("Failed to find user/update sub")
        res.status(500).end()
        return
    }

})

export default router
