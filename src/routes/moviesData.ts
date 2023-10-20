import { Router } from "express";
import movies from "../models/movies";
import watchlater from "../models/watchlater";

const router = Router();

router.post("/", async (req, res) => {

  const email = req.body.email

  const mvs = await movies.find();

  if (email && email !== "") {
    const wl = await watchlater.findOne({ email })
    for (const i in mvs) {
      if (wl?.movies.includes(mvs[i].id)) {
        mvs[i].watchLater = true
      }
    }
  }

  if (!mvs) {
    res.status(500).end();
    console.log("Error in getting data from database");
  } else {
    res.status(200).json(mvs);
  }
});

export default router;
