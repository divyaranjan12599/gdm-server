import { model, Schema } from "mongoose";
import { PaidFor, PaymentMethod } from "./enums.js";

const paymentModel = new Schema({
    amountPaidBy:{
        type: Schema.Types.ObjectId,
        ref: "Client"
    },
    amountPaid: {
        type: Number
    },
    amountPaidOn: {
        type: String
    },
    paidFor: {
        type: String,
        enum: Object.values(PaidFor),
        default: PaidFor.NORMAL
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
}, { timeStamp: true });

const PaymentDetail = model("Payment", paymentModel);
export default PaymentDetail;