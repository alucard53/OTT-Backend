import { Router } from "express";
import movies from "../models/movies";

const router = Router();

router.post("/", async (req, res) => {
  const title = req.body;

  let movie = await movies.findOne({ title });
  console.log(movie);

  if (!movie) {
    res.write(404);
    console.log("Movie not found!");
  } else {
    res.write(200);
    res.write(
      JSON.stringify({
        id: movie.id,
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        director: movie.director,
        desc: movie.desc,
      })
    );
  }
  res.end();
});

export default router;
