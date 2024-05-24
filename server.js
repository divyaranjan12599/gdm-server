import express, { response } from "express";
import mongoose from "mongoose";
import cors from 'cors';
import userRoutes from "./routes/userRoute.js";


// require("dotenv").config()

// express app
const app = express();
const port = process.env.PORT || 3000

const MONGO_URI = process.env.MONGO_URI;
// console.log(MONGO_URI);

app.use(cors({
    origin: "http://localhost:5173/"
}));
app.use(express.json());

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(MONGO_URI);
        console.log("Db connected...");
    } catch (error) {
        console.log("Db is not connected!!!", error);
    }
}

connectDb();

app.use("/user", userRoutes)

const server = app.listen(port, () => {
    console.log("listening on port", port);
})