import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt"
import userRoutes from "./routes/userRoute.js";
import expenseRoutes from "./routes/expenseRoute.js";
import User from "./models/userModel.js";
import { sendOtpEmail, generateOtp, saveOtp, verifyOtp } from "./emailService.js";

const app = express();
const port = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const connectDb = async () => {
	try {
		const connect = await mongoose.connect(MONGO_URI);
	} catch (error) {
		console.log("Db is not connected!!!", error);
	}
};

connectDb();

app.use("/user", userRoutes);
app.use('/user/expenses', expenseRoutes);

app.post("/api/auth/reset-password", async (req, res) => {
	const { email, otp, newPassword } = req.body;

	try {
		const otpValid = await verifyOtp(email, otp);
		if (!otpValid) {
			return res.status(400).json({ message: "Invalid or expired OTP" });
		}


		const hashedPassword = await bcrypt.hash(newPassword, 10);

		const result = await User.updateOne({ email }, { password: hashedPassword });
		if (result.nModified === 0) {
			throw new Error("No document matched the query. Password not updated.");
		}

		res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Error updating password:", error);
		res.status(500).json({ message: error.message || "Error updating password" });
	}
});

app.post("/api/auth/send-otp", (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ message: "Email is required" });
	}

	const otp = generateOtp();
	saveOtp(email, otp);

	sendOtpEmail(email, otp)
		.then(() => {
			res.status(200).json({ message: "OTP sent successfully" });
		})
		.catch((error) => {
			console.error("Error sending OTP:", error);
			res.status(500).json({ message: "Failed to send OTP" });
		});
});

app.post("/api/auth/verify-otp", (req, res) => {
	const { email, otp } = req.body;

	if (!email || !otp) {
		return res.status(400).json({ message: "Email and OTP are required" });
	}

	if (verifyOtp(email, otp)) {
		res.status(200).json({ message: "OTP verified successfully" });
	} else {
		res.status(400).json({ message: "Invalid or expired OTP" });
	}
});

const server = app.listen(port, () => {
	console.log("listening on port", port);
});
