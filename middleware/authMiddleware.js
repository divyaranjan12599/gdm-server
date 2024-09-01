import jwt from "jsonwebtoken"
import User from "../models/userModel.js";


export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = decoded;
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            next();
        } catch (error) {
            console.error('Error in protect middleware:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
    }
};
