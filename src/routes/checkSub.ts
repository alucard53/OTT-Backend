import { Router } from "express";
import { base64url, jwtDecrypt } from "jose";
import { configDotenv } from "dotenv";
import { Stripe } from "stripe";

import users from "../models/users";

configDotenv()
const router = Router();

let stripe: Stripe;

if (process.env.STRIPE_PK) {
  stripe = new Stripe(process.env.STRIPE_PK, {
    apiVersion: "2023-08-16",
  })
}

let secret: Uint8Array = new Uint8Array();

router.get("/", async (req, res) => {
  if (process.env.JWT_KEY) {
    secret = base64url.decode(process.env.JWT_KEY);
  }
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401).end();
    console.log("not authenticated");
    return;
  }

  const [, token] = bearer.toString().split(" ");

  if (!token) {
    res.status(401).end();
    console.log("invalid token");
    return;
  }

  try {
    const data = await jwtDecrypt(token, secret);
    console.log(data);
    const email = data.payload.email;

    const user = await users.findOne({ email });

    console.log(user)

    if (user?.subID) {
      console.log(await stripe.subscriptions.retrieve(user.subID))
    }

    if (user !== null) {
      if (user.substate === "Active") {
        res.status(200).end();
      } else {
        res.status(400).end();
      }
    } else {
      console.log("user not found")
      res.status(404).end();
    }
  } catch (e) {
    console.log(e)
    console.log("bad token");
    res.status(401).end();
    return;
  }
});

export default router;