import User from "../models/userModel.js";
import Client from "../models/clientModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Staff from "../models/staffModel.js"
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
        const { email, id } = req.body;
        const existingClientById = await Client.findOne({ id });
        if (existingClientById) {
            return res.status(400).json({ message: "Client with this ID already exists" });
        }
        const existingClientByEmail = await Client.findOne({ email });
        if (existingClientByEmail) {
            return res.status(400).json({ message: "Client with this email already exists" });
        }
        const client = new Client(req.body);
        await client.save();
        res.status(201).json({ message: "client created ", client });
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
        const { email, id } = req.body;
        const existingStaffById = await Staff.findOne({ id });
        if (existingStaffById) {
            return res.status(400).json({ message: "Staff with this ID already exists" });
        }
        const existingStaffByEmail = await Staff.findOne({ email });
        if (existingStaffByEmail) {
            return res.status(400).json({ message: "Staff with this email already exists" });
        }
        const staff = new Staff(req.body);
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


