//Route to store subscription details in DB

import { Router } from "express";

import users from "../models/users"

let router = Router()

router.post("/", async (req, res) => {
    const { email, plan, billing } = req.body

    const user = await users.findOne({ email })

    if (!users) {
        res.writeHead(404)
    } else {
        const updated = await users.updateOne(
            { email },
            {
                $set: {
                    plan,
                    substate: "Active",
                    billing,
                    startDate: Date.now(),
                },
            })

        if (!updated.acknowledged) {
            res.writeHead(500)
        } else {
            res.writeHead(200)
        }
    }
    res.end()
})

export default router