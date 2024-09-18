import { model, Schema } from "mongoose";

const expenseModel = new Schema({
    amountPaid: {
        type: Number
    },
    amountPaidOn: {
        type: String
    },
    paidFor: {
        type: String,
    },
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });

const ExpenseDetail = model("Expense", expenseModel);
export default ExpenseDetail;