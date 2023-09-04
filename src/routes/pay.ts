//Login Route

import { Router } from "express"
import { Stripe } from "stripe"
import { configDotenv } from "dotenv"

configDotenv()

//Stripe price ids for subscription plans
const price_links = [
    [
        //mobile
        "price_1NdU8qSA6MDXluwIwVIWjxM0", //monthly
        "price_1NdWZBSA6MDXluwIv8SwwlJp", //yearly
    ],
    [
        //basic
        "price_1NdUAMSA6MDXluwIUGNT6Ycy", //monthly
        "price_1NdWYgSA6MDXluwIfqduqnum", //yearly
    ],
    [
        //standard
        "price_1NdUB5SA6MDXluwIonElPyLD", //monthly
        "price_1NdWWjSA6MDXluwIobzubQa0", //yearly
    ],
    [
        //premium
        "price_1NdUBrSA6MDXluwIT00vFJzX", //monthly
        "price_1NdWWISA6MDXluwIhiBvxcm4", //yearly
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
    const { plan, billing, customer } = req.body

    //create a new subscription in stripe
    const subscription = (await stripe.subscriptions.create({
        customer,
        items: [{ price: price_links[plan][billing] }],
        collection_method: "send_invoice",
        days_until_due: 30
    }))

    if (!subscription) {
        res.writeHead(500)
    }
    else {

        //Invoice can be an invoice object | string | undefined, so convert to string
        const inv_id = subscription.latest_invoice?.toString()

        if (!inv_id) {
            res.writeHead(500)
        } else {

            //Finalize invoice to get payment intent
            const invoice = (await stripe.invoices.finalizeInvoice(inv_id)).payment_intent?.toString()

            if (!invoice) {
                res.writeHead(500)
            } else {
                //retrieve payment intent object to get client secret
                const paymentIntent = stripe.paymentIntents.retrieve(invoice)

                if (!paymentIntent) {
                    res.writeHead(500)
                } else {

                    res.setHeader("Content-Type", "application/json")

                    //send client secret to frontend
                    res.write(JSON.stringify({
                        secret: (await paymentIntent).client_secret, sub_id: subscription.id
                    }))
                }
            }
        }
    }
    res.end()
})

export default router