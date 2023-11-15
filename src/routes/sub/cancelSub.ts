import { Router } from "express";
import getPayload from "../../getPayload";
import { configDotenv } from "dotenv";
import { Stripe } from "stripe";

import users from "../../models/users";


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

let secret: Uint8Array;

router.get("/", async (req, res) => {

    // get header
    const data = await getPayload(req.headers.authorization)

    if (!data) {
        res.status(400).end()
        return
    }

    try { // get user from DB
        const user = await users.findOne({ email: data.payload.email })
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
            const db_res = await users.updateOne({ email: data.payload.email }, {
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
