import { Router } from "express";
import watchlater from "../../models/watchlater";
import getPayload from "../../getPayload";

const router = Router();

router.delete("/", async (req, res) => {
	console.log(req.query);
	console.log(req.query.id);

	const data = await getPayload(req.headers.authorization)

	if (!data) {
		res.status(400).end()
		return
	}

	const email = data.payload.email;

	try {
		const user = await watchlater.findOne({ email });

		if (!user) {
			console.log("user not found");
			res.status(404).end();
			return;
		}

		const movieId = req.query.id;

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
