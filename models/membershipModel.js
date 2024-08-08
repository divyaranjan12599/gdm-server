import { model, Schema } from "mongoose";
import { MembershipPeriod } from "./enums.js";

const membershipModel = new Schema({
    membershipBy: {
        type: Schema.Types.ObjectId,
        ref: "Client"
    },
    startingDate: {
        type: String,
    },
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
        ptStartingDate: {
            type: String,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "Staff"
        }
    }
}, { timeStamp: true });

const MembershipDetail = model("Membership", membershipModel);
export default MembershipDetail;