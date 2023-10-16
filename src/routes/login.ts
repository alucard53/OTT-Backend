import { Router } from "express";
import { base64url, EncryptJWT } from "jose";

import users from "../models/users";

const router = Router();

router.post("/", async (req, res) => {
  //get email and password from request
  const { email, password } = req.body;

  //Get user data by email from DB
  let user = await users.findOne({ email });

  //If user doesn't exist
  if (!user) {
    res.status(404).end();
    return;
  }

  if (password === user.password) {
    if (!process.env.JWT_KEY) {
      res.status(500).end();
      return;
    }

    const secret = base64url.decode(process.env.JWT_KEY); // getting encrypted key from .env file and decrypting

    const token = await new EncryptJWT({ //creating new jwt and encrypting it
      email: user.email, //payload
      stripeID: user.stripeID, //payload
      subID: user.subID,
    })
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" }) //encryption algo to be used
      .setIssuedAt()
      .setExpirationTime("24h")
      .encrypt(secret); //encrypting with secrety key


    res.status(200).json({
      billing: user.billing,
      email: user.email,
      name: user.name,
      plan: user.plan,
      substate: user.substate,
      startDate: user.startDate,
      token, //sending token on successful login
    });
  } else {
    //Incorrect password
    res.status(400).end();
  }
});

export default router;
