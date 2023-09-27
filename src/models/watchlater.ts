import { model, Schema } from "mongoose"

const schema = new Schema({
  email: {
    type: String,
    require: true,
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email ID!",
    ],
  },
  movies: {
    type: Array,
  }
})

export default model("WatchLater", schema, "WatchLater")
