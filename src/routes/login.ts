import { Router } from "express";

import users from "../models/users";

const router = Router();

router.post("/", async (req, res) => {
    //get email and password from request
    const { email, password } = req.body;

    //Get user data by email from DB
    let user = (await users.findOne({ email }));

    //If user doesn't exist
    if (!user) {
        res.writeHead(404);
    } else {
        if (password === user.password) {
            res.writeHead(200)
            res.write(JSON.stringify(
                {
                    billing: user.billing,
                    email: user.email,
                    name: user.name,
                    plan: user.plan,
                    substate: user.substate,
                }
            ))
        } else { //Incorrect password
            res.writeHead(400);
        }
    }
    res.end();
})

export default router;
