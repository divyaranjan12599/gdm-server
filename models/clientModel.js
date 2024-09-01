import { model, Schema } from "mongoose";
import { Gender, IdProofAccepted, MembershipPeriod, PaymentMethod } from "./enums.js";

const clientModel = new Schema({
    name: {
        type: String
    },
    contact: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
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
    renewals: {
        type: Number,
        // required: true,
        default: 0,
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
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });

const Client = model("Client", clientModel);
export default Client;