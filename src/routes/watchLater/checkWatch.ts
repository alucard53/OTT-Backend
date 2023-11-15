import { Router } from "express"
import { configDotenv } from "dotenv"

import watchlater from "../../models/watchlater"

configDotenv()

const router = Router()

router.post("/", async (req, res) => {
    const email = req.body.email
    const movie = req.query.movie

    console.log(email)

    const user = await watchlater.findOne({ email })

    if (!user) {
        res.status(400).end()
        console.log("user not found")
        return
    }

    if (user.movies.includes(movie)) {
        res.status(200).end()
    } else {
        res.status(404).end()
    }
})

export default router
