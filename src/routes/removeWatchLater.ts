import { Router } from "express";
import { configDotenv } from "dotenv";
import watchlater from "../models/watchlater";
import { base64url, jwtDecrypt } from "jose";

configDotenv();

const router = Router();

router.delete("/", async (req, res) => {
  console.log(req.query);

  console.log(req.query.id);
  if (!process.env.JWT_KEY) {
    res.status(500).end();
    return;
  }

  const secret = base64url.decode(process.env.JWT_KEY);
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(400).end();
    console.log("no auth header found");
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(400).end();
    console.log("invalid token");
    return;
  }
  try {
    const data = await jwtDecrypt(token, secret);

    const email = data.payload.email;

    const user = await watchlater.findOne({ email });

    if (!user) {
      console.log("user not found");
      res.status(404).end();
      return;
    }

    // console.log(user.movies);

    const movieId = req.query.id;
    console.log(movieId);

    const deleteMovie = await watchlater.updateOne(
      { email },
      {
        $pull: { movies: { $eq: movieId } },
      },
      {
        multi: false,
      }
    );

    console.log(deleteMovie);
    if (deleteMovie.modifiedCount === 1) {
      res.json({ message: `Movie with ID ${movieId} deleted from the array.` });
    } else {
      res
        .status(500)
        .json({ error: `Failed to delete movie with ID ${movieId}.` });
    }

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
