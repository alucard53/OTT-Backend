import { Router } from "express";
import { base64url, jwtDecrypt } from "jose";

import users from "../models/users";

const router = Router();

let secret: Uint8Array = new Uint8Array();

router.get("/", async (req, res) => {
  //isko alag s import karna parega
  if (process.env.JWT_KEY) {
    secret = base64url.decode(process.env.JWT_KEY);
  }
  const bearer = req.headers.authorization;
  console.log("bearer", bearer);

  if (!bearer) {
    res.status(401);
    console.log("not authenticated");
    return;
  }

  const [, token] = bearer.toString().split(" ");

  if (!token) {
    res.status(401).end();
    console.log("invalid token");
    return;
  }

  try {
    const data = await jwtDecrypt(token, secret);
    console.log(data);
    const email = data.payload.email;

    const user = await users.findOne({ email });
    if (user !== null) {
      if (user.substate === "Active") {
        res.status(200);
      } else {
        res.status(400);
      }
    }
    return;
  } catch (e) {
    res.status(401);
    console.log("bad token");
    return;
  }
});

export default router;
