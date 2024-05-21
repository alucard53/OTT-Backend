import { Router } from "express";
import movies from "../models/movies";
import Stripe from "stripe";
import JWTAuth from "../middleware/auth";
import ActiveSub from "../middleware/subbed";

let stripe: Stripe;

if (process.env.STRIPE_PK) {
    stripe = new Stripe(process.env.STRIPE_PK, {
        apiVersion: "2023-08-16",
    });
} else {
    console.log("stripe pk not found")
    process.exit(1)
}

const router = Router()

router.get("/:id", JWTAuth, ActiveSub, async (req, res) => {
    const id = req.params.id

    const movie = await movies.findOne({ id })
    if (!movie) {
        res.status(404).end()
        return
    }

    res.status(200).json(movie)
})

export default router;
