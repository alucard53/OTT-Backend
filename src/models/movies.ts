import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    id: Number,
    title: String,
    year: Number,
    genre: String,
    director: String,
    desc: String,
  },
  {
    collection: "Movies",
  }
);

export default mongoose.model("Movies", schema, "Movies");
