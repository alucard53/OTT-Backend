import express from "express";
import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import register from "./routes/register";
import login from "./routes/login";
import pay from "./routes/pay";
import store from "./routes/store";
import movies from "./routes/moviesData";

configDotenv();

async function main() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to DB");
    } else {
      console.log("Failed to connect");
      process.exit(1);
    }
  } catch (e) {
    console.log(e);
  }

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  //assign register route to handler
  app.use("/register", register);
  app.use("/login", login);
  app.use("/pay", pay);
  app.use("/store", store);
  app.use("/movies", movies);
  app.listen(6969, () => {
    console.log("App started in http://localhost:6969");
  });
}

main();
