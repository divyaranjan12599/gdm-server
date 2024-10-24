import express from "express";
import { addUser, changePassword, checkToken, checkUserEmail, createClient, getPtDetailsByStaffId, createEnq, createPtMembershipByClientId, createPtMembershipByStaffId, createStaff, deleteClientById, deleteEnqById, deleteStaffById, deleteUser, getAllClient, getAllEnq, getAllMemberships, getAllMembershipsByClientId, getAllPaymentDetails, getAllPaymentDetailsByClientId, getAllPTMemberships, getAllStaff, getClientById, getEnqById, getMyUsers, getStaffById, login, register, test, updateClientById, updateEnqById, getPtDetailsByClientId, updateMembershipByClientId, updateStaffById, updateUserProfile, verifyJWT } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/check", checkToken);

router.post("/register", register);

router.post("/login", login);

router.get("/test", protect, test);

router.post("/check-user-email", checkUserEmail);

router.post('/create-client', protect, createClient);

router.post('/change-password', protect, changePassword)

router.get('/get-client/:id', protect, getClientById);

router.get('/get-clients', protect, getAllClient);

router.get('/get-memberships', protect, getAllMemberships);

router.get('/get-memberships/:clientId', protect, getAllMembershipsByClientId);

router.get('/get-paymentDetails', protect, getAllPaymentDetails);

router.get('/get-paymentDetails/:clientId', protect, getAllPaymentDetailsByClientId);

router.put('/update-client/:id', protect, updateClientById);

router.put('/update-membership/:clientId', protect, updateMembershipByClientId);

router.delete('/delete-client/:id', protect, deleteClientById);

router.post('/create-staff', protect, createStaff);

router.get('/get-staff/:id', protect, getStaffById);

router.get('/get-staffs', protect, getAllStaff);

router.get('/get-ptDetails', protect, getAllPTMemberships);

router.get('/get-ptDetails/:clientId', protect, getPtDetailsByClientId);

router.get('/get-ptbystaffid/:staffId', protect, getPtDetailsByStaffId);

router.put('/update-staff/:id', protect, updateStaffById);

router.post('/create-ptcid/:clientId', protect, createPtMembershipByClientId);

router.post('/create-ptsid/:staffId', protect, createPtMembershipByStaffId);

router.delete('/delete-staff/:id', protect, deleteStaffById);

router.post('/create-enquiry', protect, createEnq);

router.get('/get-enquiry/:id', protect, getEnqById);

router.get('/get-enquiries', protect, getAllEnq);

router.put('/update-enquiry/:id', protect, updateEnqById);

router.delete('/delete-enquiry/:id', protect, deleteEnqById);

router.post('/add-user/:id', protect, addUser);

router.get('/get-myusers', protect, getMyUsers)

router.delete('/delete-user/:id', protect, deleteUser);

router.put("/update-profile", protect, updateUserProfile);

export default router;

