//Login Route

import { Router } from "express"
import { Stripe } from "stripe"
import { configDotenv } from "dotenv";
import users from "../models/users"

configDotenv()

//Stripe price ids for subscription plans
const price_links = [
    [
        //mobile
        "price_1NdU8qSA6MDXluwIwVIWjxM0", //monthly
        "price_1Np1nNSA6MDXluwIpk01MOI1", //yearly
    ],
    [
        //basic
        "price_1NdUAMSA6MDXluwIUGNT6Ycy", //monthly
        "price_1Np1mOSA6MDXluwIKUJ4L9gD", //yearly
    ],
    [
        //standard
        "price_1NdUB5SA6MDXluwIonElPyLD", //monthly
        "price_1Np1ktSA6MDXluwIQISitszx", //yearly
    ],
    [
        //premium
        "price_1Np1iZSA6MDXluwIZ2XT7xgv", //monthly
        "price_1Np1izSA6MDXluwIi1PoWxWf", //yearly
    ],
];

let router = Router()
let stripe: Stripe

//Initialize stripe object
if (process.env.STRIPE_PK) {

    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16"
    })

    if (!stripe) {
        console.log("Stripe connection failed")
        process.exit(1)
    }

}

router.post("/", async (req, res) => {
    //Read plan index, billing index, and stripe customer id from request body
    const { plan, billing, email } = req.body

    //TODO: instead of storing Stripe customer ID on frontend(security risks), above API call will receive email. Change the frontend fetch request to send the email in place of the customer Stripe ID.
    //Then we will query the DB with the email and get the stripe ID directly into the backend.
    const user = await users.findOne({ email });

    let customer: string = "";

    if (!user) {
        res.status(404).end();
        return
    }

    if (user.stripeID) {
        customer = user.stripeID;

    }

    //create a new subscription in stripe
    const subscription = (await stripe.subscriptions.create({
        customer,
        items: [{ price: price_links[plan][billing] }],
        collection_method: "send_invoice",
        days_until_due: 30
    }))

    if (!subscription) {
        res.status(500).end()
        return
    }
    //Invoice can be an invoice object | string | undefined, so convert to string
    const inv_id = subscription.latest_invoice?.toString()

    if (!inv_id) {
        res.status(500).end()
        return
    }

    //Finalize invoice to get payment intent
    const invoice = (await stripe.invoices.finalizeInvoice(inv_id)).payment_intent?.toString()

    if (!invoice) {
        res.status(500).end()
        return
    }
    //retrieve payment intent object to get client secret
    const paymentIntent = stripe.paymentIntents.retrieve(invoice)

    if (!paymentIntent) {
        res.status(500).end()
        return
    }

    //send client secret to frontend
    res.status(200).json({
        secret: (await paymentIntent).client_secret, sub_id: subscription.id
    })
})

export default router
