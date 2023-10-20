import { Router } from "express";
import { configDotenv } from "dotenv";

import watchlater from "../../models/watchlater";
import movies from "../../models/movies";

configDotenv();

const router = Router();

router.post("/", async (req, res) => {
  const { email } = req.body;
  console.log(req.body);

  try {
    const user = await watchlater.findOne({ email });
    console.log(user);

    if (!user) {
      res.status(404).end();
      return;
    } else {
      const wlMovies = await movies.find({ id: { $in: user.movies } });
      console.log(wlMovies);
      res.status(200).json({ wlMovies });
    }
  } catch (e) {
    console.log(e);
    res.status(400).end();
    return;
  }
});

export default router;
