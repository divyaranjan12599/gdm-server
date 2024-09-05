import { model, Schema } from "mongoose";
import { Gender, IdProofAccepted, MembershipPeriod, PaymentMethod } from "./enums.js";

const staffModel = new Schema({
    name: {
        type: String
    },
    contact: {
        type: String
    },
    role: {
        type: String,
        default: 'STAFF'
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
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
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });

const Staff = model("Staff", staffModel);
export default Staff;