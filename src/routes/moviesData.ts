import { Router } from "express";
import movies from "../models/movies";

const router = Router();

router.get("/", async (_, res) => {

  let mvs = await movies.find();

  if (!mvs) {
    res.status(500).end();
    console.log("Error in getting data from database");
  } else {
    res.status(200).json(mvs);
  }

  res.end();
});

export default router;
