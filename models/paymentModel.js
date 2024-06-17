import { model, Schema } from "mongoose";

const paymentModel = new Schema({
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
}, { timeStamp: true });

const PaymentDetail = model("Payment", paymentModel);
export default PaymentDetail;