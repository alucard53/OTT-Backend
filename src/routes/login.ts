import {Router} from "express";

import users from "../models/users";

const router = Router();

router.post("/", async(req, res)=>{
    const {email, password} = req.body;
   console.log(req.body);
    const user = (await users.findOne({email}));

   if(!user){
    res.writeHead(404);
   }else{
        if(password === user.password){
            res.write(JSON.stringify({user}))
        }else{
            res.writeHead(400);
        }
   }
res.end();
})

export default router;