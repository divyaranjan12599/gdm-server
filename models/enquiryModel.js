import { model, Schema } from "mongoose";
import { Gender, MembershipPeriod, SourceOfEquiry } from "./enums.js";

const enquiryModel = new Schema({

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
    source: {
        type: String,
        enum: Object.values(SourceOfEquiry)
    },
    address: {
        type: String
    },
    referredBy: {
        type: String
    },
    enquiryDate: {
        type: String
    },
    lastFollowUpDate: {
        type: String
    },
    enquiredFor: {
        type: [String]
    },
    intrestedOn: {
        type: String,
        enum: Object.values(MembershipPeriod)
    },
    attainBy: {
        type: Schema.Types.ObjectId,
        ref: "Staff"
    },
    comment: {
        type: String
    },
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });

const Enquiry = model("Enquiry", enquiryModel);
export default Enquiry;