import { Schema, model, Types } from "mongoose";

const seqModel = new Schema({
    _id: {
        type: Types.ObjectId,
        required: true,
        default: () => new Types.ObjectId('000000000000000000000001') // Fixed ObjectId for sequence document
    },
    clientIdSeq: {
        type: Number,
        required: true,
        default: 0
    },
    staffIdSeq: {
        type: Number,
        required: true,
        default: 0
    },
    enqIdSeq: {
        type: Number,
        required: true,
        default: 0
    },
}, { timestamps: true });

const Sequence = model("Sequence", seqModel);
export default Sequence;
