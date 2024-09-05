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
    endDate: {
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
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });

const MembershipDetail = model("Membership", membershipModel);
export default MembershipDetail;