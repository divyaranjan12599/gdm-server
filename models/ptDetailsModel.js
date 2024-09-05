import { model, Schema } from "mongoose";
import { MembershipPeriod} from "./enums.js";

const ptDetailsModel = new Schema({
    ptTo: {
        type: Schema.Types.ObjectId,
        ref: "Client"
    },
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
    ptEndDate: {
        type: String,
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "Staff"
    },
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });

const PTMembershipDetail = model("PtDetails", ptDetailsModel);
export default PTMembershipDetail;