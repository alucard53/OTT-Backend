//Login Route

import { Router } from "express"
import { Stripe } from "stripe"
import { configDotenv } from "dotenv";
import users from "../../models/users"

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

    try {
        const user = await users.findOne({ email });

        let customer: string = "";

        if (!user) {
            res.status(404).end();
            return
        }

        if (user.stripeID) {
            customer = user.stripeID;

        }

        let subscription: Stripe.Response<Stripe.Subscription>
        //create a new subscription in stripe or retrieve old subscription

        if (user.subID) { // for exising sub ID

            subscription = await stripe.subscriptions.retrieve(user.subID)

            switch (subscription.status) {
                case "canceled": // for cancelled subscription, create new subscription object in stripe for renewal
                    subscription = (await stripe.subscriptions.create({
                        customer,
                        items: [{ price: price_links[plan][billing] }],
                        collection_method: "charge_automatically",
                        payment_behavior: "default_incomplete"
                    }))
                    break;
                case "active":
                    subscription = await stripe.subscriptions.update(user.subID, { // to alter plan, delete previous subscription item from subscription, and add new one
                        items: [
                            {
                                id: subscription.items.data[0].id,
                                deleted: true
                            },
                            {
                                price: price_links[plan][billing]
                            },
                        ],
                        collection_method: "charge_automatically",
                        payment_behavior: "default_incomplete"
                    })
                    break;
                default:
                    console.log("Unpaid sub, using previous intent to get secret") // shouldddd also cover overdue subs
            }
        } else {
            subscription = (await stripe.subscriptions.create({ // for new subscription
                customer,
                items: [{ price: price_links[plan][billing] }],
                collection_method: "charge_automatically",
                payment_behavior: "default_incomplete"
            }))

        }

        // if payment is incomplete/past_due above block should be skipped, and latest invoice can be generated without extra steps

        let substate = "Incomplete";

        console.log(subscription.status)

        if (subscription.status !== "active") { // this check is for when the cost for altering an ongoing sub is covered automatically by stripe

            //Invoice can be an invoice object | string | undefined, so convert to string
            const invoice = subscription.latest_invoice?.toString()

            if (!invoice) {
                res.status(500).end()
                return
            }

            //retrieve payment intent object to get client secret
            const paymentIntentId = (
                await
                    stripe.
                        invoices.
                        retrieve(invoice))
                .payment_intent

            if (!paymentIntentId) {
                res.status(500).end()
                return
            }

            const paymentIntent = await stripe
                .paymentIntents
                .retrieve(
                    paymentIntentId.toString()
                )

            if (!paymentIntent) {
                res.status(500).end()
                return
            }

            //send client secret to frontend
            res.status(206).json({
                secret: paymentIntent.client_secret, sub_id: subscription.id
            })

        } else {
            substate = "Active"
            let date = new Date(0)
            date.setUTCSeconds(subscription.current_period_end)
            res.status(200).json({ date })
        }

        console.log(subscription.current_period_end)

        const update = await users.updateOne(
            { email },
            {
                $set: {
                    subID: subscription.id,
                    substate,
                    plan,
                    billing,
                }
            }
        )

        if (!update.acknowledged) {
            console.log("failed to update subscription id to DB")
        }
    } catch (e) {
        console.log(e)
    }

})

export default router
