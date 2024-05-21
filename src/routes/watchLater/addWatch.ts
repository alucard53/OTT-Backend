import { Router } from "express"

import watchlater from "../../models/watchlater"
import JWTAuth from "../../middleware/auth"

const router = Router()


router.post("/", JWTAuth, async (req, res) => {
    const email = res.locals.email
    const movie = req.query.movie

    if (!movie) {
        console.log("movie not found in route query")
        res.status(400).end()
        return
    }

    //get current watchlater list
    try {
        const user = await watchlater.findOne({ email })

        if (!user) {
            console.log("user not found")
            res.status(404).end()
            return
        }

        //update watchlater list by appending movie in request to old list
        const update = await watchlater.updateOne({ email }, {
            $set: {
                movies: [...user.movies, movie]
            }
        })

        if (update.acknowledged) {
            res.status(200).end()
        } else {
            console.log("Failed to update db")
            res.status(500).end()
        }

    } catch (e) {
        console.log(e)
        res.status(400).end()
        return
    }
})

export default router
