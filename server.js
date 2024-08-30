import express, { response } from "express";
import mongoose from "mongoose";
import cors from 'cors';
import userRoutes from "./routes/userRoute.js";
import Sequence from "./models/sequenceModel.js";

// express app
const app = express();
const port = process.env.PORT || 3000

const MONGO_URI = process.env.MONGO_URI;
// console.log(MONGO_URI);

app.use(cors());
app.use(express.json());

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(MONGO_URI);
        console.log("Db connected...");
        const existingSeq = await Sequence.findById('000000000000000000000001');
        if (!existingSeq) {
            const seq = new Sequence({
                _id: new mongoose.Types.ObjectId('000000000000000000000001'),
                clientIdSeq: 0,
                staffIdSeq: 0,
                enqIdSeq: 0,
            });
            await seq.save();
            console.log("Sequence document initialized");
        } else {
            console.log("Sequence document already exists");
        }
    } catch (error) {
        console.log("Db is not connected!!!", error);
    }
}

connectDb();

app.use("/user", userRoutes)

const server = app.listen(port, () => {
    console.log("listening on port", port);
})