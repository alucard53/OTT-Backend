import { configDotenv } from "dotenv";
import { jwtDecrypt, base64url, JWTDecryptResult } from "jose";

configDotenv()

let secret: Uint8Array;

if (!process.env.JWT_KEY) {
    console.log("jwt key not found")
} else {
    secret = base64url.decode(process.env.JWT_KEY)
}

export default async function(header: String | undefined): Promise<JWTDecryptResult | undefined> {
    const token = header?.split(" ")[1]

    // token not present
    if (!token) {
        console.log("token not found")
        return undefined
    }

    let data: JWTDecryptResult
    try {
        // decrypt jwt
        return await jwtDecrypt(token, secret)
    } catch (e) {
        console.log("Invalid jwt", e)
        return undefined
    }
}
