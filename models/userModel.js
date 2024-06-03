import { model, Schema } from "mongoose";

const userModel = new Schema({
    gymTitle: {
        type: String,
        required: true
    },
    gymLogoUrl: {
        type: String
    },
    username: {
        type: String,
        required: true
    },
    ownersName: {
        type: [String],
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

}, { timeStamp: true });

const User = model("User", userModel);
export default User;