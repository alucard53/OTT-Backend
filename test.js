const body = {
    name: "Babar Bitchi",
    email: "borobitch@gmail.com",
    password: "nijer chorka",

}

fetch("http://localhost:6969/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
        "Content-Type": "application/json"
    }
})
