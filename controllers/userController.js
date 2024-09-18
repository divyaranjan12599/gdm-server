import User from "../models/userModel.js";
import Client from "../models/clientModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Staff from "../models/staffModel.js";
import { Gender, PaidFor } from "../models/enums.js";
import Enquiry from "../models/enquiryModel.js";
import PaymentDetail from "../models/paymentModel.js";
import MembershipDetail from "../models/membershipModel.js";
import { capitalizeEachWord, endDateGenerator } from "../utilityFunctions.js";
import PTMembershipDetail from "../models/ptDetailsModel.js";
import { sendAdminUserAddedEmail, sendAdminUserRemovedEmail, sendUserAddedEmail } from "../emailService.js";

export const verifyJWT = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) {
		return res.status(401).json({ error: "No access token" });
	}
	jwt.verify(token, process.env.SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ error: "Access Token is Invalid" });
		}
		req.user = user.id;
		next();
	});
};

export const register = async (req, res) => {
	try {
		const { gymTitle, gymShortform, contact, role, ownerName, email, password } = req.body;
		console.log(req.body);

		let userExists = await User.findOne({ email });
		if (userExists) {
			res.status(401).json({ message: "Email is already in use." });
			return;
		}
		const saltRounds = 10;
		bcrypt.hash(password, saltRounds, (err, hash) => {
			if (err) {
				return res.status(501).json({ error: err.message });
			}
			let user = new User({
				gymShortform: gymShortform || null,
				role,
				gymTitle,
				contact,
				ownerName,
				email,
				password: hash,
			});
			user.save().then(() => {
				return res.json({ message: "User created successfully", user: user });
			});
		});
	} catch (err) {
		console.log(err);

		res.status(401).send(err.message);
	}
};

export const test = async (req, res) => {
	try {
		const user = req.user.userId;
		if (user) {
			console.log("Requested User ID:", user);
			res.status(200).json({ message: "User ID retrieved", userId: user._id });
		} else {
			res.status(404).json({ message: "User not found in request" });
		}
	} catch (error) {
		console.log("Error in test controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
export const checkUserEmail = async (req, res) => {
	try {
		const { email } = req.body;
		let user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: "User Not Found", userExists: false });
		} else {
			return res.status(200).json({ message: "User found", userExists: true });
		}
	} catch (error) {
		res.status(500).json({ message: "User does not exist.", userExists: false });
	}
};

export const checkToken = (req, res) => {
	const token = req.headers["authorization"]?.split(" ")[1];

	if (!token) {
		return res.status(403).json({ message: "No token provided" });
	}

	jwt.verify(token, process.env.SECRET, (err, decoded) => {
		if (err) {
			if (err.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Token has expired" });
			}
			return res.status(401).json({ message: "Invalid token" });
		}

		return res.status(200).json({ message: "Token is valid", user: decoded });
	});
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		let user = await User.findOne({ email });
		if (!user) {
			const staff = await Staff.findOne({ email });

			if (!staff || !staff.password) {
				return res.status(401).json({ message: "User Not Found" });
			}

			const passwordMatch = await bcrypt.compare(password, staff.password);

			if (passwordMatch) {
				const token = jwt.sign({ staffId: staff._id, userId: staff.belongsTo, email, role: "STAFF" }, process.env.SECRET, { expiresIn: "8h" });
				const staffObject = staff.toObject();
				delete staffObject.password;
				return res.status(200).json({ message: "User verified", user: staffObject, token });
			} else {
				return res.status(401).json({ message: "Invalid Password" });
			}
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		const userId = user._id;
		if (passwordMatch) {
			const token = jwt.sign({ userId, email, role: "ADMIN" }, process.env.SECRET, { expiresIn: "8h" });
			user = user.toObject();
			delete user.password;
			return res.status(200).json({ message: "User verified", user: user, token });
		} else {
			return res.status(401).json({ message: "Invalid Password" });
		}
	} catch (error) {
		res.status(401).send(error.message);
	}
};

export const createClient = async (req, res) => {
	try {
		const { fname, lname, email, contactNumber, picUrl, address1, address2, city, state, zip, gender, joiningDate, idProofType, idProofNumber, idProofFront, idProofBack, ptStartDate, emergencyContactName, emergencyContactNumber, membershipPeriod, membershipStartingDate, membershipAmount, amountPaid, amountRemaining, dueDate, paymentMode, transactionDate, transactionId, ptFees, ptMembershipPeriod, ptAssignedTo } = req.body;

		const user = await User.findById(req.user.userId);
		if (!user) {
			return res.status(403).json({ message: "Request Denied/" });
		}

		const existingClientByEmail = await Client.findOne({ email, belongsTo: req.user.userId });
		// console.log(existingClientByEmail);

		if (existingClientByEmail) {
			return res.status(400).json({ message: "Client with this email already exists" });
		}

		const existingClientByContact = await Client.findOne({ contact: contactNumber, belongsTo: req.user.userId });
		if (existingClientByContact) {
			return res.status(400).json({ message: "Client with this contact already exists" });
		}

		if (![Gender.MALE, Gender.FEMALE].includes(gender.toLowerCase())) {
			return res.status(400).json({ message: "Invalid gender" });
		}

		const currentDate = new Date();
		const formattedDate = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, "0")}${currentDate.getDate().toString().padStart(2, "0")}`;
		const formattedTime = `${currentDate.getHours().toString().padStart(2, "0")}${currentDate.getMinutes().toString().padStart(2, "0")}${currentDate.getSeconds().toString().padStart(2, "0")}`;
		const randomNumber = Math.floor(Math.random() * 10000);
		const gymTitleShortForm = user.gymTitle
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase();
		const newClientId = `${gymTitleShortForm}_${fname[0].toUpperCase()}${lname[0].toUpperCase()}_${formattedDate}-${formattedTime}_${randomNumber}`;

		const clientData = {
			clientId: newClientId,
			name: capitalizeEachWord(fname + " " + lname),
			contact: contactNumber,
			email: email,
			gender: gender.toLowerCase() || "male",
			photoUrl: picUrl,
			address: {
				areaDetails: `${address1} ${address2}`,
				city: city,
				state: state,
				pincode: zip,
			},
			idproof: {
				type: idProofType,
				number: idProofNumber,
				frontPicUrl: idProofFront,
				backPicUrl: idProofBack,
			},
			emergencyContact: {
				name: emergencyContactName,
				contact: emergencyContactNumber,
			},
			joiningdate: joiningDate,
			belongsTo: req.user.userId,
		};

		const client = new Client(clientData);

		const membershipData = {
			membershipBy: client,
			startDate: membershipStartingDate,
			membershipPeriod: membershipPeriod || "monthly",
			endDate: endDateGenerator(membershipStartingDate, membershipPeriod),
			membershipAmount: parseFloat(membershipAmount),
			isPt: parseFloat(ptFees) > 0,
			belongsTo: req.user.userId,
		};

		if (parseFloat(ptFees) > 0) {
			const ptAssignedStaff = await Staff.findById(ptAssignedTo);
			const ptDetailsData = {
				ptBy: client,
				ptfees: parseFloat(ptFees),
				ptPeriod: ptMembershipPeriod || "monthly", // Default value if empty
				assignedTo: ptAssignedStaff,
				ptStartDate: ptStartDate,
				ptEndDate: endDateGenerator(ptStartDate, ptMembershipPeriod),
				belongsTo: req.user.userId,
			};
			const ptDetails = new PTMembershipDetail(ptDetailsData);
			await ptDetails.save();
		}

		const membershipDetails = new MembershipDetail(membershipData);

		const paymentDetailsData = {
			amountPaidBy: client,
			amountPaid: parseFloat(amountPaid),
			mode: paymentMode || "cash",
			amountPaidOn: transactionDate,
			amountRemaining: parseFloat(amountRemaining || 0),
			dueDate: dueDate,
			transactionId: transactionId,
			belongsTo: req.user.userId,
		};

		const paymentDetails = new PaymentDetail(paymentDetailsData);

		await paymentDetails.save();
		await membershipDetails.save();
		await client.save();
		res.status(201).json({ message: "Client created successfully", client });
	} catch (error) {
		res.status(400).json({ message: error.message });
		console.log(error);
	}
};

export const getClientById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const client = await Client.find({ _id: req.params.id, belongsTo: userId });
		if (!client) {
			return res.status(404).json({ message: "Client not found" });
		}
		res.status(200).json(client);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllClient = async (req, res) => {
	const userId = req.user.userId;
	try {
		const clients = await Client.find({ belongsTo: userId }).sort({ _id: 1 });
		if (!clients) {
			return res.status(404).json({ message: "Client not found" });
		}
		res.status(200).json(clients);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllMemberships = async (req, res) => {
	const userId = req.user.userId;
	try {
		const memberships = await MembershipDetail.find({ belongsTo: userId }).sort({ startDate: 1 }).populate("membershipBy");
		if (!memberships) {
			return res.status(404).json({ message: "Membership details not found" });
		}
		res.status(200).json(memberships);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllPTMemberships = async (req, res) => {
	const userId = req.user.userId;
	try {
		const memberships = await PTMembershipDetail.find({ belongsTo: userId }).sort({ startDate: 1 }).populate("ptTo").populate("assignedTo");
		if (!memberships) {
			return res.status(404).json({ message: "PT Membership details not found" });
		}
		res.status(200).json(memberships);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllMembershipsByClientId = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { clientId } = req.params;

		// Fetch memberships filtered by client id
		const memberships = await MembershipDetail.find({ membershipBy: clientId, belongsTo: userId }).sort({ startDate: 1 }).populate("membershipBy");

		if (!memberships || memberships.length === 0) {
			return res.status(404).json({ message: "No memberships found for this client" });
		}

		res.status(200).json(memberships);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
export const getPtDetailsByClientId = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { clientId } = req.params;
		const memberships = await PTMembershipDetail.find({ ptTo: clientId, belongsTo: userId })
			.populate("ptTo", "name") 
			.populate("assignedTo", "name") 
			.populate("belongsTo", "username"); 

		res.status(200).json(memberships);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateMembershipByClientId = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { clientId } = req.params;
		const { membershipPeriod, membershipStartingDate, membershipAmount, amountPaid, amountRemaining, dueDate, paymentMode, transactionDate, transactionId } = req.body;

		const existingMembership = await MembershipDetail.findOne({
			membershipBy: clientId,
			$or: [
				{
					startDate: { $lt: new Date() },
					endDate: { $gt: new Date() },
				},
				{
					startDate: { $lt: new Date() },
					endDate: { $exists: false },
				},
			],
		});

		if (existingMembership) {
			return res.status(400).json({ message: "Client already has an active membership." });
		}

		const updatedClient = await Client.findOneAndUpdate({ _id: clientId, belongsTo: userId }, { $inc: { renewals: 1 } }, { new: true });

		const membershipData = {
			membershipBy: updatedClient,
			startDate: membershipStartingDate,
			membershipPeriod: membershipPeriod || "monthly",
			endDate: endDateGenerator(membershipStartingDate, membershipPeriod),
			membershipAmount: parseFloat(membershipAmount),
			isPt: parseFloat(ptFees) > 0,
			belongsTo: userId,
		};

		const membershipDetails = new MembershipDetail(membershipData);

		const paymentDetailsData = {
			amountPaidBy: updatedClient,
			amountPaid: parseFloat(amountPaid),
			mode: paymentMode || "cash",
			amountPaidOn: transactionDate,
			amountRemaining: parseFloat(amountRemaining || 0),
			dueDate: dueDate,
			transactionId: transactionId,
			belongsTo: userId,
		};

		const paymentDetails = new PaymentDetail(paymentDetailsData);

		await paymentDetails.save();
		await membershipDetails.save();

		res.status(200).json(membershipDetails);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createPtMembershipByClientId = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { clientId } = req.params;
		const { ptStartDate, ptFees, ptMembershipPeriod, ptAssignedTo, amountPaid, amountRemaining, dueDate, paymentMode, transactionDate, transactionId } = req.body;

		const existingMembership = await PTMembershipDetail.findOne({
			ptTo: clientId,
			$or: [
				{
					ptStartDate: { $lt: new Date() },
					ptEndDate: { $gt: new Date() },
				},
				{
					ptStartDate: { $lt: new Date() },
					ptEndDate: { $exists: false },
				},
			],
		});

		console.log(existingMembership);

		if (existingMembership) {
			return res.status(400).json({ message: "Client already has an active membership." });
		}

		const client = await Client.findById(clientId);
		const ptAssignedStaff = await Staff.findById(ptAssignedTo);
		const ptDetailsData = {
			ptTo: client,
			ptfees: parseFloat(ptFees),
			ptPeriod: ptMembershipPeriod || "monthly", // Default value if empty
			assignedTo: ptAssignedStaff,
			ptStartDate: ptStartDate,
			ptEndDate: endDateGenerator(ptStartDate, ptMembershipPeriod),
			belongsTo: userId,
		};
		const ptDetails = new PTMembershipDetail(ptDetailsData);
		await ptDetails.save();

		const paymentDetailsData = {
			amountPaidBy: client,
			amountPaid: parseFloat(amountPaid),
			mode: paymentMode || "cash",
			paidFor: PaidFor.PTMembership,
			amountPaidOn: transactionDate,
			amountRemaining: parseFloat(amountRemaining || 0),
			dueDate: dueDate,
			transactionId: transactionId,
			belongsTo: userId,
		};

		const paymentDetails = new PaymentDetail(paymentDetailsData);

		await paymentDetails.save();

		res.status(200).json({ pt: ptDetails, payment: paymentDetails });
	} catch (error) {
		// console.log(error);
		res.status(500).json({ message: error.message });
	}
};

export const createPtMembershipByStaffId = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { staffId } = req.params;
		const { ptStartDate, ptFees, ptMembershipPeriod, ptTo, amountPaid, amountRemaining, dueDate, paymentMode, transactionDate, transactionId } = req.body;

		const client = await Client.findById(ptTo);

		const ptAssignedStaff = await Staff.findById(staffId);
		const ptDetailsData = {
			ptTo: client,
			ptfees: parseFloat(ptFees),
			ptPeriod: ptMembershipPeriod || "monthly", // Default value if empty
			assignedTo: ptAssignedStaff,
			ptStartDate: ptStartDate,
			ptEndDate: endDateGenerator(ptStartDate, ptMembershipPeriod),
			belongsTo: userId,
		};
		const ptDetails = new PTMembershipDetail(ptDetailsData);
		await ptDetails.save();

		const paymentDetailsData = {
			amountPaidBy: client,
			amountPaid: parseFloat(amountPaid),
			mode: paymentMode || "cash",
			paidFor: PaidFor.PTMembership,
			amountPaidOn: transactionDate,
			amountRemaining: parseFloat(amountRemaining || 0),
			dueDate: dueDate,
			transactionId: transactionId,
			belongsTo: userId,
		};

		const paymentDetails = new PaymentDetail(paymentDetailsData);

		await paymentDetails.save();

		res.status(200).json(ptDetails, paymentDetails);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllPaymentDetails = async (req, res) => {
	const userId = req.user.userId;
	try {
		const payments = await PaymentDetail.find({ belongsTo: userId }).sort({ amountPaidOn: 1 }).populate("amountPaidBy");
		if (!payments) {
			return res.status(404).json({ message: "Client Payment Details not found" });
		}
		res.status(200).json(payments);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllPaymentDetailsByClientId = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { clientId } = req.params;
		const payments = await PaymentDetail.find({ amountPaidBy: clientId, belongsTo: userId }).sort({ amountPaidOn: 1 }).populate("amountPaidBy");
		if (!payments) {
			return res.status(404).json({ message: "Client Payment Details not found" });
		}
		res.status(200).json(payments);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateClientById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const client = await Client.findOneAndUpdate({ _id: req.params.id, belongsTo: userId }, req.body, { new: true });
		if (!client) {
			return res.status(404).json({ message: "Client not found" });
		}
		res.status(200).json({ message: "Client Details Updated", client });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const deleteClientById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const client = await Client.findOneAndDelete({ _id: req.params.id, belongsTo: userId });
		if (!client) {
			return res.status(404).json({ message: "Client not found" });
		}
		res.status(200).json({ message: "Client deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createStaff = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { staffName, email, picUrl, contactNumber, address, city, state, zip, gender, joiningDate, idProofType, idProofNumber, idProofFront, idProofBack, emergencyContactName, emergencyContactNumber } = req.body;
		// const existingStaffById = await Staff.findOne({ id });
		// if (existingStaffById) {
		//     return res.status(400).json({ message: "Staff with this ID already exists" });
		// }
		const existingStaffByEmail = await Staff.findOne({ email, belongsTo: userId });
		if (existingStaffByEmail) {
			return res.status(400).json({ message: "Staff with this email already exists" });
		}
		const existingStaffByContact = await Staff.findOne({ contact: contactNumber, belongsTo: userId });
		if (existingStaffByContact) {
			return res.status(400).json({ message: "Staff with this contact already exists" });
		}

		// const seq = await Sequence.findById('000000000000000000000001');
		// console.log(seq);
		// const newStaffId = seq.staffIdSeq + 1;
		// seq.staffIdSeq = newStaffId;
		// await seq.save();

		const staffData = {
			name: staffName,
			contact: contactNumber,
			email: email,
			gender: gender.toLowerCase() || "male",
			photoUrl: picUrl,
			address: {
				areaDetails: address,

				city: city,

				state: state,

				pincode: zip,
			},
			idproof: {
				type: idProofType,
				number: idProofNumber,
				frontPicUrl: idProofFront,
				backPicUrl: idProofBack,
			},
			emergencyContact: {
				name: emergencyContactName,
				contact: emergencyContactNumber,
			},
			joiningdate: joiningDate,
			belongsTo: userId,
		};
		const staff = new Staff(staffData);
		await staff.save();
		res.status(201).json({ message: "Staff created", staff });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const getStaffById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const staff = await Staff.findOne({ _id: req.params.id, belongsTo: userId });
		if (!staff) {
			return res.status(404).json({ message: "Staff not found" });
		}
		res.status(200).json(staff);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllStaff = async (req, res) => {
	const userId = req.user.userId;
	try {
		const staffs = await Staff.find({ belongsTo: userId }).sort({ joiningDate: 1 });
		if (!staffs) {
			return res.status(404).json({ message: "Staff not found" });
		}
		res.status(200).json(staffs);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateStaffById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const staff = await Staff.findOneAndUpdate({ _id: req.params.id, belongsTo: userId }, req.body, { new: true });
		if (!staff) {
			return res.status(404).json({ message: "Staff not found" });
		}
		res.status(200).json({ message: "Staff details updated", staff });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const deleteStaffById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const staff = await Staff.findOneAndDelete({ _id: req.params.id, belongsTo: userId });
		if (!staff) {
			return res.status(404).json({ message: "Staff not found" });
		}
		res.status(200).json({ message: "Staff deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createEnq = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { visitorName, phone, source, referredBy, enquiryOn, lastFollowUpOn, enquiredFor, interestedOn, attainedBy, email, address, comment } = req.body;
		// const existingStaffById = await Staff.findOne({ id });
		// if (existingStaffById) {
		//     return res.status(400).json({ message: "Staff with this ID already exists" });
		// }
		const attainByStaff = await Staff.findOne({ _id: attainedBy, belongsTo: userId });
		// console.log(attainByStaff);

		if (!attainByStaff) {
			return res.status(400).json({ message: "Staff attained the client is not exist" });
		}

		// const seq = await Sequence.findById('000000000000000000000001');
		// // console.log(seq);
		// const newEnqId = seq.enqIdSeq + 1;
		// seq.enqIdSeq = newEnqId;
		// await seq.save();

		const enqData = {
			// id: newEnqId,
			name: visitorName,
			contact: phone,
			email: email,
			// gender: gender.toLowerCase() || 'male',
			source: source,
			address: address,
			referredBy: referredBy,
			enquiryDate: enquiryOn,
			lastFollowUpDate: lastFollowUpOn,
			enquiredFor: enquiredFor,
			intrestedOn: interestedOn,
			attainBy: attainByStaff,
			comment: comment,
			belongsTo: userId,
		};
		const enquiry = new Enquiry(enqData);
		await enquiry.save();
		res.status(201).json({ message: "Enquiry created", enquiry });
	} catch (error) {
		// console.log(error);
		res.status(400).json({ message: error.message });
	}
};

export const getEnqById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const enquiry = await Enquiry.find({ _id: req.params.id, belongsTo: userId });
		if (!enquiry) {
			return res.status(404).json({ message: "Enquiry not found" });
		}
		res.status(200).json(enquiry);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAllEnq = async (req, res) => {
	const userId = req.user.userId;
	try {
		const enquiries = await Enquiry.find({ belongsTo: userId }).sort({ enquiryDate: 1 }).populate("attainBy");
		if (!enquiries) {
			return res.status(404).json({ message: "enquiry not found" });
		}
		res.status(200).json(enquiries);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateEnqById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const enquiry = await Enquiry.findOneAndUpdate({ _id: req.params.id, belongsTo: userId }, req.body, { new: true });
		if (!enquiry) {
			return res.status(404).json({ message: "Enquiry not found" });
		}
		res.status(200).json({ message: "Enquiry details updated", enquiry });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const deleteEnqById = async (req, res) => {
	const userId = req.user.userId;
	try {
		const enquiry = await Enquiry.findOneAndDelete({ _id: req.params.id, belongsTo: userId });
		if (!enquiry) {
			return res.status(404).json({ message: "enquiry not found" });
		}
		res.status(200).json({ message: "enquiry deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const changePassword = async (req, res) => {
	const userId = req.user.userId;
	try {
		const { oldPassword, newPassword } = req.body;

		const staff = await Staff.findById(req.user.staffId);

		if (!staff) {
			let user = await User.findById(userId);
			if (!user) {
				return res.status(401).json({ message: "User Not Found" });
			}

			const passwordMatch = await bcrypt.compare(oldPassword, user.password);
			if (passwordMatch) {
				const hashedPassword = await bcrypt.hash(newPassword, 10);

				user.password = hashedPassword;
				await user.save();

				return res.status(200).json({ message: "Password changed successfully" });
			} else {
				return res.status(401).json({ message: "Invalid Old Password" });
			}
		}
		if (!staff.password) {
			return res.status(401).json({ message: "User Not Found" });
		}
		const passwordMatch = await bcrypt.compare(oldPassword, staff.password);
		if (passwordMatch) {
			const hashedPassword = await bcrypt.hash(newPassword, 10);

			staff.password = hashedPassword;
			await staff.save();

			return res.status(200).json({ message: "Password changed successfully" });
		} else {
			return res.status(401).json({ message: "Invalid Old Password" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const addUser = async (req, res) => {
	const userId = req.user.userId;
	const { password } = req.body;
	const staffId = req.params.id;
	try {
		const staff = await Staff.findOne({ _id: staffId, belongsTo: userId });
		if (!staff) {
			return res.status(404).json({ message: "Staff not found" });
		}
		const user = await User.findById(userId);
		if (user.numberOfUsers >= 1) {
			return res.status(401).json({ message: "User Limit exceeded" });
		}

		if (!password) {
			return res.status(401).json({ message: "Please provide default password." });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const result = await Staff.findByIdAndUpdate(staffId, { password: hashedPassword });

		const numberOfUsers = user.numberOfUsers;
		user.numberOfUsers = numberOfUsers + 1;
		user.save();
		await sendUserAddedEmail(staff.email, staff.name, password);
		await sendAdminUserAddedEmail(user.email, user.ownerName, staff.name, staff.email);
		res.status(200).json({ message: "User Added Successfully!!" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteUser = async (req, res) => {
	const userId = req.user.userId;
	const staffId = req.params.id;
	try {
		const user = await User.findById(userId);
		if (user.numberOfUsers <= 0) {
			return res.status(401).json({ message: "No Users Exits" });
		}
		const staff = await Staff.findOne({ _id: staffId, belongsTo: userId });
		if (!staff) {
			return res.status(404).json({ message: "Staff not found" });
		}

		staff.password = undefined;
		staff.save();

		const numberOfUsers = user.numberOfUsers;
		user.numberOfUsers = numberOfUsers - 1;
		user.save();
		await sendAdminUserRemovedEmail(user.email, user.ownerName, staff.name, staff.email);

		res.status(200).json({ message: "User Deleted Successfully!!" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


export const getMyUsers = async (req, res) => {
	const userId = req.user.userId;
	try {
		const user = await User.findById(userId);
		if (user.numberOfUsers <= 0) {
			return res.status(401).json({ message: "No Users Exits" });
		}
		const staff = await Staff.find({ belongsTo: userId, password: { $exists: true, $ne: null } });
		if (!staff) {
			return res.status(404).json({ message: "Staff not found" });
		}

		res.status(200).json({ staff });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateUserProfile = async (req, res) => {
	const userId = req.user.userId;
	const { gymTitle, ownerName, email, contact, profilePicture } = req.body;

	try {
		const updatedUser = await User.findByIdAndUpdate(userId, { gymTitle, ownerName, email, contact, profilePicture }, { new: true, runValidators: true });
		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
