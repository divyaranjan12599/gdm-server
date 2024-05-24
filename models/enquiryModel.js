import { model, Schema } from "mongoose";
import { MembershipPeriod, SourceOfEquiry} from "./enums.js";

const enquiryModel = new Schema({
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
        type: [toString]
    },
    intrestedOn: {
        type: String,
        enum: Object.values(MembershipPeriod)
    },
    attainBy:{
        type: Object
    },
    comment:{
        type:String
    }
}, { timeStamp: true });

const Enquiry = model("Enquiry", enquiryModel);
export default Enquiry;