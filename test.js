const jose = require("jose")

async function func() {
    const secret = jose.base64url.decode("zH4NRP1HMALxxCFnRZABFA7GOJtzU_gIj02alfL1lvI")
    const jwt = await new jose.EncryptJWT({email: "chidori9912@gmail.com"})
        .setProtectedHeader({alg: "dir", enc: "A128CBC-HS256"})
        .setIssuedAt()
        .setExpirationTime("24h")
        .encrypt(secret)

    console.log(jwt)

    console.log(await jose.jwtDecrypt(jwt, jose.base64url.decode("zH4NRP1HMALxxCFnRZABFA7GOJtzU_gIj02alfL1lvI")))
}

func()
