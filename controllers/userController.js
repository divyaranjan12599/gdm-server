import User from "../models/userModel.js";
import Client from "../models/clientModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Staff from "../models/staffModel.js"
import Sequence from "../models/sequenceModel.js";
import { Gender, PaidFor } from "../models/enums.js";
import Enquiry from "../models/enquiryModel.js";
import PaymentDetail from "../models/paymentModel.js";
import MembershipDetail from "../models/membershipModel.js";
import { capitalizeEachWord } from "../utilityFunctions.js";
import PTMembershipDetail from "../models/ptDetailsModel.js";

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
    })
}

export const register = async (req, res) => {
    try {
        const { ownerName, email, password } = req.body;

        let userExists = await User.findOne({ email });
        if (userExists) {
            res.status(401).json({ message: "Email is already in use." });
            return;
        }
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                return res.status(501).json({ error: err.message })
            }
            let user = new User({
                ownerName,
                email,
                password: hash,
            });
            user.save().then(() => {
                return res.json({ message: "User created successfully", user: user });
            });
        });

    } catch (err) {
        res.status(401).send(err.message);
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User Not Found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: "24h" });
            user = user.toObject();
            delete user.password;
            return res.status(200).json({ message: "User verified", user: user, token });
        } else {
            return res.status(401).json({ message: "Invalid Password" });
        }
    } catch (error) {
        res.status(401).send(error.message);
    }
}

export const createClient = async (req, res) => {
    try {
        const {
            fname,
            lname,
            email,
            contactNumber,
            picUrl,
            address1,
            address2,
            city,
            state,
            zip,
            gender,
            joiningDate,
            idProofType,
            idProofNumber,
            idProofFront,
            idProofBack,
            ptStartingDate,
            emergencyContactName,
            emergencyContactNumber,
            membershipPeriod,
            membershipStartingDate,
            membershipAmount,
            amountPaid,
            amountRemaining,
            dueDate,
            paymentMode,
            transactionDate,
            transactionId,
            ptFees,
            ptMembershipPeriod,
            ptAssignedTo
        } = req.body;

        // console.log(req);

        const existingClientByEmail = await Client.findOne({ email });
        if (existingClientByEmail) {
            return res.status(400).json({ message: "Client with this email already exists" });
        }

        const existingClientByContact = await Client.findOne({ contact: contactNumber });
        if (existingClientByContact) {
            return res.status(400).json({ message: "Client with this contact already exists" });
        }

        if (![Gender.MALE, Gender.FEMALE].includes(gender.toLowerCase())) {
            return res.status(400).json({ message: "Invalid gender" });
        }

        const seq = await Sequence.findById('000000000000000000000001');
        // console.log(seq);
        const newClientId = seq.clientIdSeq + 1;
        seq.clientIdSeq = newClientId;
        await seq.save();

        const clientData = {
            id: newClientId, // If you have an auto-increment logic, this should be handled differently
            name: capitalizeEachWord(fname + ' ' + lname),
            contact: contactNumber,
            email: email,
            gender: gender.toLowerCase() || 'male',
            photoUrl: picUrl,
            address: {
                areaDetails: `${address1} ${address2}`,
                city: city,
                state: state,
                pincode: zip
            },
            // isPt: parseFloat(ptFees) > 0,
            // PTDetails: ptDetails,
            idproof: {
                type: idProofType,
                number: idProofNumber,
                frontPicUrl: idProofFront,
                backPicUrl: idProofBack
            },
            emergencyContact: {
                name: emergencyContactName,
                contact: emergencyContactNumber
            },
            joiningdate: joiningDate,
        };

        const client = new Client(clientData);

        const membershipData = {
            membershipBy: client,
            startingDate: membershipStartingDate,
            membershipPeriod: membershipPeriod || 'monthly',
            membershipAmount: parseFloat(membershipAmount),
            isPt: parseFloat(ptFees) > 0,
        }

        if (parseFloat(ptFees) > 0) {
            const ptAssignedStaff = await Staff.findById(ptAssignedTo);
            const ptDetailsData = {
                ptBy: client,
                ptfees: parseFloat(ptFees),
                ptPeriod: ptMembershipPeriod || 'monthly', // Default value if empty
                assignedTo: ptAssignedStaff,
                ptStartingDate: ptStartingDate
            };
            const ptDetails = new PTMembershipDetail(ptDetailsData);
            await ptDetails.save();
        }

        const membershipDetails = new MembershipDetail(membershipData);

        const paymentDetailsData = {
            amountPaidBy: client,
            amountPaid: parseFloat(amountPaid),
            mode: paymentMode || 'cash',
            amountPaidOn: transactionDate,
            amountRemaining: parseFloat(amountRemaining),
            dueDate: dueDate,
            transactionId: transactionId
        }

        const paymentDetails = new PaymentDetail(paymentDetailsData);

        await paymentDetails.save();
        await membershipDetails.save();
        await client.save();
        res.status(201).json({ message: "Client created successfully", client });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllClient = async (req, res) => {
    try {
        const clients = await Client.find({}).sort({ joiningDate: 1 });
        if (!clients) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllMemberships = async (req, res) => {
    try {
        const memberships = await MembershipDetail.find({}).sort({ startingDate: 1 }).populate('membershipBy');
        if (!memberships) {
            return res.status(404).json({ message: 'Membership details not found' });
        }
        res.status(200).json(memberships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPTMemberships = async (req, res) => {
    try {
        const memberships = await PTMembershipDetail.find({}).sort({ startingDate: 1 }).populate('ptTo').populate('assignedTo');
        if (!memberships) {
            return res.status(404).json({ message: 'PT Membership details not found' });
        }
        res.status(200).json(memberships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllMembershipsByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Fetch memberships filtered by client id
        const memberships = await MembershipDetail.find({ membershipBy: clientId }).sort({ startingDate: 1 }).populate('membershipBy');

        if (!memberships || memberships.length === 0) {
            return res.status(404).json({ message: 'No memberships found for this client' });
        }

        res.status(200).json(memberships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMembershipByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;
        const {
            membershipPeriod,
            membershipStartingDate,
            membershipAmount,
            amountPaid,
            amountRemaining,
            dueDate,
            paymentMode,
            transactionDate,
            transactionId,
        } = req.body;

        const updatedClient = await Client.findByIdAndUpdate(
            clientId,
            { $inc: { renewals: 1 } },
            { new: true } // Return the updated document
        );

        const membershipData = {
            membershipBy: updatedClient,
            startingDate: membershipStartingDate,
            membershipPeriod: membershipPeriod || 'monthly',
            membershipAmount: parseFloat(membershipAmount),
            isPt: parseFloat(ptFees) > 0,
        }

        const membershipDetails = new MembershipDetail(membershipData);

        const paymentDetailsData = {
            amountPaidBy: updatedClient,
            amountPaid: parseFloat(amountPaid),
            mode: paymentMode || 'cash',
            amountPaidOn: transactionDate,
            amountRemaining: parseFloat(amountRemaining || 0),
            dueDate: dueDate,
            transactionId: transactionId
        }

        const paymentDetails = new PaymentDetail(paymentDetailsData);

        await paymentDetails.save();
        await membershipDetails.save();

        res.status(200).json(membershipDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPtMembershipByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;
        const {
            ptStartingDate,
            ptFees,
            ptMembershipPeriod,
            ptAssignedTo,
            amountPaid,
            amountRemaining,
            dueDate,
            paymentMode,
            transactionDate,
            transactionId,
        } = req.body;

        const client = await Client.findById(clientId);

        const ptAssignedStaff = await Staff.findById(ptAssignedTo);
        const ptDetailsData = {
            ptTo: client,
            ptfees: parseFloat(ptFees),
            ptPeriod: ptMembershipPeriod || 'monthly', // Default value if empty
            assignedTo: ptAssignedStaff,
            ptStartingDate: ptStartingDate
        };
        const ptDetails = new PTMembershipDetail(ptDetailsData);
        await ptDetails.save();

        const paymentDetailsData = {
            amountPaidBy: client,
            amountPaid: parseFloat(amountPaid),
            mode: paymentMode || 'cash',
            paidFor: PaidFor.PTMembership,
            amountPaidOn: transactionDate,
            amountRemaining: parseFloat(amountRemaining || 0),
            dueDate: dueDate,
            transactionId: transactionId
        }

        const paymentDetails = new PaymentDetail(paymentDetailsData);

        await paymentDetails.save();

        res.status(200).json({pt: ptDetails, payment: paymentDetails});
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const createPtMembershipByStaffId = async (req, res) => {
    try {
        const { staffId } = req.params;
        const {
            ptStartingDate,
            ptFees,
            ptMembershipPeriod,
            ptTo,
            amountPaid,
            amountRemaining,
            dueDate,
            paymentMode,
            transactionDate,
            transactionId,
        } = req.body;

        const client = await Client.findById(ptTo);

        const ptAssignedStaff = await Staff.findById(staffId);
        const ptDetailsData = {
            ptTo: client,
            ptfees: parseFloat(ptFees),
            ptPeriod: ptMembershipPeriod || 'monthly', // Default value if empty
            assignedTo: ptAssignedStaff,
            ptStartingDate: ptStartingDate
        };
        const ptDetails = new PTMembershipDetail(ptDetailsData);
        await ptDetails.save();

        const paymentDetailsData = {
            amountPaidBy: client,
            amountPaid: parseFloat(amountPaid),
            mode: paymentMode || 'cash',
            paidFor: PaidFor.PTMembership,
            amountPaidOn: transactionDate,
            amountRemaining: parseFloat(amountRemaining),
            dueDate: dueDate,
            transactionId: transactionId
        }

        const paymentDetails = new PaymentDetail(paymentDetailsData);

        await paymentDetails.save();

        res.status(200).json(ptDetails, paymentDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPaymentDetails = async (req, res) => {
    try {
        const payments = await PaymentDetail.find({}).sort({ amountPaidOn: 1 }).populate('amountPaidBy');
        if (!payments) {
            return res.status(404).json({ message: 'Client Payment Details not found' });
        }
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPaymentDetailsByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;
        const payments = await PaymentDetail.find({ amountPaidBy: clientId }).sort({ amountPaidOn: 1 }).populate('amountPaidBy');
        if (!payments) {
            return res.status(404).json({ message: 'Client Payment Details not found' });
        }
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateClientById = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: "Client Details Updated", client });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteClientById = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createStaff = async (req, res) => {
    try {
        const {
            staffName,
            email,
            picUrl,
            contactNumber,
            address1,
            address2,
            city,
            state,
            zip,
            gender,
            joiningDate,
            idProofType,
            idProofNumber,
            idProofFront,
            idProofBack,
            emergencyContactName,
            emergencyContactNumber
        } = req.body;
        // const existingStaffById = await Staff.findOne({ id });
        // if (existingStaffById) {
        //     return res.status(400).json({ message: "Staff with this ID already exists" });
        // }
        const existingStaffByEmail = await Staff.findOne({ email });
        if (existingStaffByEmail) {
            return res.status(400).json({ message: "Staff with this email already exists" });
        }
        const existingStaffByContact = await Staff.findOne({ contact: contactNumber });
        if (existingStaffByContact) {
            return res.status(400).json({ message: "Staff with this contact already exists" });
        }

        const seq = await Sequence.findById('000000000000000000000001');
        // console.log(seq);
        const newStaffId = seq.staffIdSeq + 1;
        seq.staffIdSeq = newStaffId;
        await seq.save();

        const staffData = {
            id: newStaffId,
            name: staffName,
            contact: contactNumber,
            email: email,
            gender: gender.toLowerCase() || 'male',
            photoUrl: picUrl,
            address: {
                areaDetails: address1 + ' ' + address2,

                city: city,

                state: state,

                pincode: zip
            },
            idproof: {
                type: idProofType,
                number: idProofNumber,
                frontPicUrl: idProofFront,
                backPicUrl: idProofBack
            },
            emergencyContact: {
                name: emergencyContactName,
                contact: emergencyContactNumber
            },
            joiningdate: joiningDate
        }
        const staff = new Staff(staffData);
        await staff.save();
        res.status(201).json({ message: "Staff created", staff });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllStaff = async (req, res) => {
    try {
        const staffs = await Staff.find({}).sort({ joiningDate: 1 });
        if (!staffs) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json(staffs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStaffById = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({ message: "Staff details updated", staff });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteStaffById = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createEnq = async (req, res) => {
    try {
        const {
            visitorName,
            phone,
            source,
            referredBy,
            enquiryOn,
            lastFollowUpOn,
            enquiredFor,
            interestedOn,
            attainedBy,
            email,
            address,
            comment
        } = req.body;
        // const existingStaffById = await Staff.findOne({ id });
        // if (existingStaffById) {
        //     return res.status(400).json({ message: "Staff with this ID already exists" });
        // }
        const attainByStaff = await Staff.findById(attainedBy);

        if (!attainByStaff) {
            return res.status(400).json({ message: "Staff attained the client is not exist" });
        }

        const seq = await Sequence.findById('000000000000000000000001');
        // console.log(seq);
        const newEnqId = seq.enqIdSeq + 1;
        seq.enqIdSeq = newEnqId;
        await seq.save();

        const enqData = {
            id: newEnqId,
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
            comment: comment
        }
        const enquiry = new Enquiry(enqData);
        await enquiry.save();
        res.status(201).json({ message: "Enquiry created", enquiry });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getEnqById = async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }
        res.status(200).json(enquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllEnq = async (req, res) => {
    try {
        const enquiries = await Enquiry.find({}).sort({ enquiryDate: 1 }).populate('attainBy');
        if (!enquiries) {
            return res.status(404).json({ message: 'enquiry not found' });
        }
        res.status(200).json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEnqById = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }
        res.status(200).json({ message: "Enquiry details updated", enquiry });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteEnqById = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ message: 'enquiry not found' });
        }
        res.status(200).json({ message: 'enquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


