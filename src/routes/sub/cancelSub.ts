import { Router } from "express";
import { JWTDecryptResult, base64url, jwtDecrypt } from "jose";
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

if (process.env.JWT_KEY) {
  secret = base64url.decode(process.env.JWT_KEY)
} else {
  process.exit(1)
}

router.get("/", async (req, res) => {

  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    console.log("token not found")
    res.status(400).end()
    return
  }

  let data: JWTDecryptResult
  try {
    data = await jwtDecrypt(token, secret)
  } catch (e) {
    console.log("Invalid jwt", e)
    res.send(400).end()
    return
  }

  try {
    const user = await users.findOne({ email: data.payload.email })
    if (!user || !user.subID) {
      console.log("user not found")
      res.status(400).end()
      return
    }

    const subscription = await stripe.subscriptions.retrieve(user.subID)

    if (subscription.status !== "active") {
      res.status(400).end()
      console.log("tried to cancel inactive sub", subscription.latest_invoice)
      return
    }

    const cancel_res = await stripe.subscriptions.cancel(user.subID)

    if (cancel_res.status === "canceled") {

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
