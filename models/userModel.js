import { model, Schema } from "mongoose";

const appoitmentModel = new Schema({
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

const Appointment = model("Appointment", appoitmentModel);
export default Appointment;