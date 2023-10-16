import { base64url, jwtDecrypt } from "jose"
import { Router } from "express"
import { configDotenv } from "dotenv"

import watchlater from "../../models/watchlater"

configDotenv()

const router = Router()

router.post("/", async (req, res) => {
  if (!process.env.JWT_KEY) {
    res.status(500).end()
    return
  }

  const secret = base64url.decode(process.env.JWT_KEY)

  const bearer = req.headers.authorization

  if (!bearer) {
    res.status(400).end()
    console.log("no auth header found")
    return
  }

  const [, token] = bearer.split(" ")

  if (!token) {
    res.status(400).end()
    console.log("invalid token")
    return
  }

  //Get email from jwt
  try {
    const data = await jwtDecrypt(token, secret)
    //TODO validateJwt
    const email = data.payload.email
    const movie = req.query.movie

    if (!movie) {
      console.log("movie not found in route query")
      res.status(400).end()
      return
    }

    //get current watchlater list
    const user = await watchlater.findOne({ email })

    if (!user) {
      console.log("user not found")
      res.status(404).end()
      return
    }

    console.log(user.movies)

    //update watchlater list by appending movie in request to old list
    const update = await watchlater.updateOne({ email }, {
      $set: {
        movies: [...user.movies, movie]
      }
    })

    if (update.acknowledged) {
      res.status(200).end()
    } else {
      console.log("Failed to update db")
      res.status(500).end()
    }

  } catch (e) {
    console.log(e)
    res.status(400).end()
    return
  }
})

export default router
