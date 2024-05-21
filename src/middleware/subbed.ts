import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";

import users from "../models/users";


let stripe: Stripe;

if (process.env.STRIPE_PK) {
    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16",
    });
} else {
    console.log("stripe pk not found")
    process.exit(1)
}

export default async function ActiveSub(_: Request, res: Response, next: NextFunction) {
    const email = res.locals.email

    try {
        const user = await users.findOne({ email })

        const subscription = await stripe.subscriptions.retrieve(user!.subID!)

        if (subscription.status === "active") {
            next()
            return
        } else {
            console.log(subscription.status)
        }
    } catch (e) {
        console.log("sub verification failed: ", e)
    }
    res.status(401).json({ "message": "no/expired subscription" }).end()

}
