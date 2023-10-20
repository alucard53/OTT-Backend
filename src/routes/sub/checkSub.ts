import { Router } from "express";
import getPayload from "../../getPayload";
import { Stripe } from "stripe";

import users from "../../models/users";

const router = Router();

let stripe: Stripe;

if (process.env.STRIPE_PK) {
	stripe = new Stripe(process.env.STRIPE_PK, {
		apiVersion: "2023-08-16",
	});
} else {
	console.log("stripe pk not found")
	process.exit(1)
}


router.get("/", async (req, res) => {
	const data = await getPayload(req.headers.authorization);

	if (!data) {
		res.status(400).end()
		return
	}

	const email = data.payload.email;

	try {
		const user = await users.findOne({ email });

		console.log(user);

		// if (user?.subID) {
		//   console.log(await stripe.subscriptions.retrieve(user.subID))
		// }

		if (user !== null) {
			if (user.substate === "None") {
				res.status(400).end();
			} else {
				res.status(200).end();
			}
		} else {
			console.log("user not found");
			res.status(404).end();
		}
	} catch (e) {
		console.log(e);
		console.log("bad token");
		res.status(401).end();
		return;
	}
});

export default router;
