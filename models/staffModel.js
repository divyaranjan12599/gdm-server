import { model, Schema } from "mongoose";
import { Gender, IdProofAccepted, MembershipPeriod, PaymentMethod } from "./enums.js";

const staffModel = new Schema({
    id: {
        type: Number,
    },
    name: {
        type: String
    },
    contact: {
        type: String
    },
    email: {
        type: String
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        default: Gender.MALE,
    },
    photoUrl: {
        type: String,
    },
    address: {
        areaDetails: {
            type: String
        },

        city: {
            type: String
        },

        state: {
            type: String
        },

        pincode: {
            type: Number
        }
    },
    idproof: {
        type: {
            type: String,
            enum: Object.values(IdProofAccepted),
        },
        number: {
            type: String
        },
        frontPicUrl: {
            type: String,
        },
        backPicUrl: {
            type: String,
        }
    },
    emergencyContact: {
        name: {
            type: String
        },
        contact: {
            type: String
        }
    },
    joiningdate: {
        type: String
    },
}, { timeStamp: true });

const Staff = model("Staff", staffModel);
export default Staff;