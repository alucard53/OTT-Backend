import { configDotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";
import { base64url, jwtDecrypt } from "jose";

configDotenv()

let secret: Uint8Array;

if (!process.env.JWT_KEY) {
    console.error("jwt key not env in env")
    process.exit(1)
} else {
    secret = base64url.decode(process.env.JWT_KEY);
}

export default async function JWTAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    const token = header?.split(" ")[1]

    // token not present
    if (!token) {
        console.log('token absent')
        res.status(401).json({ "message": "no auth token" }).end()
        return
    }

    try {
        const data = await jwtDecrypt(token, secret)
        res.locals.email = data.payload.email
        next()
    } catch (e) {
        console.log("JWT auth failed: ", e)
        res.status(401).json({ "message": "invalid auth token" }).end()
        return undefined
    }
}
