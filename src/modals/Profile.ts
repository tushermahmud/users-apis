import mongoose from "mongoose";
const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  position: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
  },
  bio: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
export const Profile = mongoose.model("Profile", profileSchema);
