import express from "express";
import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import register from "./routes/register";
import login from "./routes/login";

import pay from "./routes/sub/pay";
import store from "./routes/store";

import checkSub from "./routes/sub/checkSub";
import cancelSub from "./routes/sub/cancelSub";

import movies from "./routes/moviesData";
import addWatch from "./routes/watchLater/addWatch";
import checkWatch from "./routes/watchLater/checkWatch";
import getWatch from "./routes/watchLater/getWatch";
import removeWatch from "./routes/watchLater/removeWatch";
configDotenv();

async function main() {
	try {
		if (process.env.MONGO_URI) {
			await mongoose.connect(process.env.MONGO_URI);
			console.log("Connected to DB");
		} else {
			console.log("MONGO_URI not found")
		}
	} catch (e) {
		console.log("Failed to connect");
		console.log(e);
	}

	const app = express();
	app.use(bodyParser.json());
	app.use(cors());

	//assign register route to handler
	app.use("/register", register);
	app.use("/login", login);
	app.use("/checkSub", checkSub);

	app.use("/pay", pay);
	app.use("/store", store);
	app.use("/cancelSub", cancelSub)

	app.use("/movies", movies);
	app.use("/addWatch", addWatch);
	app.use("/checkWatch", checkWatch);
	app.use("/getWatch", getWatch);
	app.use("/removeWatch", removeWatch);

	app.listen(6969, () => {
		console.log("App started in http://localhost:6969");
	});
}

main();
