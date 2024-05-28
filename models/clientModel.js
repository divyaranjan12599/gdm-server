import { model, Schema } from "mongoose";
import { Gender, IdProofAccepted, MembershipPeriod, PaymentMethod } from "./enums.js";

const clientModel = new Schema({
    id: {
        type: Number
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
                // type: StaffModel
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