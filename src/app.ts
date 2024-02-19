import express from "express";
import userRoutes from "./routes/user.route";
import cors from "cors"
import morgan from "morgan";
import mongoose from "mongoose";
import 'dotenv/config';
import profileRoutes from "./routes/profile.route";

const app = express();
export { app };
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

app.use("/user", userRoutes);
app.use("/profile", profileRoutes);

const uri = "mongodb+srv://sazzadmahmud16301091:sazzadmahmud16301091@cluster0.3btvx.mongodb.net/test-db?retryWrites=true&w=majority";
mongoose
  .connect(
    uri
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((e: any) => {
    console.log(e.message);
  });

