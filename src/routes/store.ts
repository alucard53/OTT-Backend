//Route to store subscription details in DB

import { Router } from "express";

import users from "../models/users"

let router = Router()

router.post("/", async (req, res) => {
  //Read email to find user in DB, plan id, and billing id to store in DB
  const { email, plan, billing } = req.body

  //Search for user in DB
  const user = await users.findOne({ email })

  if (!user) {
    //Error should never occur, recheck frontend if it does
    res.status(404).end()
    return
  }

  //update user's plan details
  const update = await users.updateOne(
    { email },
    {
      //properties of user document to be updated, other properties will remain unchanged
      $set: {
        plan,
        substate: "Active",
        billing,
        startDate: Date.now(),
      },
    })

  //If update was unsuccessful
  if (!update.acknowledged) {
    res.status(500)
  } else {
    res.status(200)
  }
  res.end()
})

export default router
