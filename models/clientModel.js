import { model, Schema } from "mongoose";
import { Gender, IdProofAccepted } from "./enums.js";
import User from "./userModel.js";

const clientModel = new Schema({
    // providedId: {
    //     type: String, // Using String for custom ID
    //     required: true,
    //     unique: true
    // },
    name: {
        type: String
    },
    contact: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
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
    renewals: {
        type: Number,
        // required: true,
        default: 0,
    },
    idproof: {
        type: {
            type: String,
            enum: Object.values(IdProofAccepted),
        },
        number: {
            type: String
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
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });

const generateCustomId = async (belongsToUserId) => {
    const user = await User.findById(belongsToUserId);
    if (!user) {
        throw new Error('User not found');
    }

    const gymName = user.gymTitle || '';
    const gymShortform = user.gymShortform || gymName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();

    const lastClient = await Client.findOne({ _id: new RegExp(`^${gymShortform}\\d+$`) }).sort({ _id: -1 });

    const lastId = lastClient ? parseInt(lastClient._id.replace(gymShortform, ''), 10) : 0;
    const nextId = (lastId + 1).toString();

    const paddedNextId = nextId.padStart(4, '0');

    return `${gymShortform}${paddedNextId}`;
};

// Pre-save hook to set custom ID
// clientModel.pre('save', async function (next) {
//     if (this.isNew) { // Only set _id for new documents
//         try {
//             const customId = await generateCustomId(this.belongsTo);
//             this.providedId = customId;
//             next();
//         } catch (err) {
//             next(err);
//         }
//     } else {
//         next();
//     }
// });

const Client = model("Client", clientModel);
export default Client;