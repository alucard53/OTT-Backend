import { Router } from "express";
import movies from "../models/movies";

const router = Router();

router.get("/", async (req, res) => {
  //   const title = req.body;

  let movie = await movies.find();
  console.log(movie);

  if (!movie) {
    res.write(404);
    console.log("Movie not found!");
  } else {
    res.write(JSON.stringify(movie));
  }
  res.end();
});

export default router;
