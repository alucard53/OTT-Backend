import { Router } from "express";
import watchlater from "../../models/watchlater";
import JWTAuth from "../../middleware/auth";

const router = Router();

router.delete("/", JWTAuth, async (req, res) => {
    const email = res.locals.email;
    const movieId = req.query.id;

    try {
        const user = await watchlater.findOne({ email });

        if (!user) {
            console.log("user not found");
            res.status(404).end();
            return;
        }

        const deleteMovie = await watchlater.updateOne(
            { email },
            {
                $pull: { movies: { $eq: movieId } },
            },
            {
                multi: false,
            }
        );

        if (deleteMovie.acknowledged) {
            res.status(200).end();
        } else {
            console.log("Failed to update db");
            res.status(500).end();
        }
    } catch (e) {
        console.log(e);
        res.status(400).end();
        return;
    }
});

export default router;
