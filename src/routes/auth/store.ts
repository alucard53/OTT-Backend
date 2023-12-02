//Route to store subscription details in DB

import { Router } from "express";
import { Stripe } from "stripe"

import users from "../../models/users"

let router = Router()

let stripe: Stripe;

if (process.env.STRIPE_PK) {
    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16",
    });
} else {
    console.log("stripe pk not found")
    process.exit(1)
}

router.post("/", async (req, res) => {
    //Read email to find user in DB, plan id, and billing id to store in DB
    const { email } = req.body

    console.log(email)

    //Search for user in DB
    const user = await users.findOne({ email })

    if (!user || !user.subID) {
        //Error should never occur, recheck frontend if it does
        res.status(404).end()
        return
    }

    const subscription = await stripe.subscriptions.retrieve(user.subID)

    if (!subscription) {
        res.status(404).end()
        return
    }

    let endDate = new Date(0)
    endDate.setUTCSeconds(subscription.current_period_end)

    //update user's plan details
    const update = await users.updateOne(
        { email },
        {
            //properties of user document to be updated, other properties will remain unchanged
            $set: {
                substate: "Active",
                endDate
            },
        })

    //If update was unsuccessful
    if (!update.acknowledged) {
        res.status(500)
    } else {
        res.json({ date: endDate })
    }
    res.end()
})

export default router
