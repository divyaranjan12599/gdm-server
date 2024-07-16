import { model, Schema } from "mongoose";
import { Gender, IdProofAccepted, MembershipPeriod, PaymentMethod } from "./enums.js";

const clientModel = new Schema({
    id: {
        type: Number,
        unique: true
    },
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
    renewals:{
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
    membership: {
        registrationFees: {
            type: Number
        },
        membershipPeriod: {
            type: String,
            enum: Object.values(MembershipPeriod)
        },
        membershipAmount: {
            type: Number,
        },
        isPt: {
            type: Boolean,
            default: false
        },
        PTDetails: {
            ptfees: {
                type: Number
            },
            ptPeriod: {
                type: String,
                enum: Object.values(MembershipPeriod)
            },
            assignedTo: {
                type: Schema.Types.ObjectId,
                ref: "Staff"
            }
        }
    },
    paymentDetails: {
        amountPaid: {
            type: Number
        },
        mode: {
            type: String,
            enum: Object.values(PaymentMethod),
        },
        amountRemaining: {
            type: Number
        },
        dueDate: {
            type: String
        },
        transactionId: {
            type: String,
        }
    }
}, { timeStamp: true });

const Client = model("Client", clientModel);
export default Client;