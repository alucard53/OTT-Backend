import { Router } from "express"
import { base64url, EncryptJWT } from "jose"

import users from "../models/users"

const router = Router();

router.post("/", async (req, res) => {
  //get email and password from request
  const { email, password } = req.body

  //Get user data by email from DB
  let user = (await users.findOne({ email }))

  //If user doesn't exist
  if (!user) {
    res.status(404).end()
    return
  }

  if (password === user.password) {

    if (!process.env.JWT_KEY) {
      res.status(500).end()
      return
    }

    const secret = base64url.decode(process.env.JWT_KEY)
    const token = await new EncryptJWT(
      {
        email: user.email,
        stripeID: user.stripeID,
      })
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .encrypt(secret)

    console.log(token)

    res.status(200).json(
      {
        billing: user.billing,
        email: user.email,
        name: user.name,
        plan: user.plan,
        substate: user.substate,
        token
      }
    )
  } else { //Incorrect password
    res.status(400).end()
  }
})

export default router
