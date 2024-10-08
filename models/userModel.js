import { model, Schema } from "mongoose";

const userModel = new Schema(
	{
		gymTitle: {
			type: String,
			required: true,
		},
		gymShortform: {
			type: String,
		},
		ownerName: {
			type: String,
			required: true,
		},
		contact: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			default: "ADMIN",
		},
		numberOfUsers: {
			type: Number,
            default: 0
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
	},
	{ timeStamp: true }
);

const User = model("User", userModel);
export default User;
