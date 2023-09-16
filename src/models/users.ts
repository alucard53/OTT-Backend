import mongoose from "mongoose"

const schema = new mongoose.Schema({
  name: { type: String, require: true },
  email: {
    type: String,
    require: true,
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email ID!",
    ],
  },
  password: { type: String, bcrypt: true, require: true },
  plan: Number,
  substate: { type: String, require: true },
  billing: Number,
  stripeID: { type: String, require: true },
  subID: { type: String },
  startDate: Date,
});

export default mongoose.model("Users", schema, "Users")
