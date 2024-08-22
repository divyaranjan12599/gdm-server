import express from "express";
import { createClient, createEnq, createStaff, deleteClientById, deleteEnqById, deleteStaffById, getAllClient, getAllEnq, getAllMemberships, getAllMembershipsByClientId, getAllPaymentDetails, getAllPaymentDetailsByClientId, getAllStaff, getClientById, getEnqById, getStaffById, login, register, updateClientById, updateEnqById, updateMembershipByClientId, updateStaffById, verifyJWT } from "../controllers/userController.js";


const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post('/create-client',createClient);

router.get('/get-client/:id', getClientById);

router.get('/get-clients', getAllClient);

router.get('/get-memberships', getAllMemberships);

router.get('/get-memberships/:clientId', getAllMembershipsByClientId);

router.get('/get-paymentDetails', getAllPaymentDetails);

router.get('/get-paymentDetails/:clientId', getAllPaymentDetailsByClientId);

router.put('/update-client/:id', updateClientById);

router.put('/update-membership/:clientId', updateMembershipByClientId);

router.delete('/delete-client/:id', deleteClientById);

router.post('/create-staff', createStaff);

router.get('/get-staff/:id', getStaffById);

router.get('/get-staffs', getAllStaff);

router.put('/update-staff/:id', updateStaffById);

router.delete('/delete-staff/:id', deleteStaffById);

router.post('/create-enquiry', createEnq);

router.get('/get-enquiry/:id', getEnqById);

router.get('/get-enquiries', getAllEnq);

router.put('/update-enquiry/:id', updateEnqById);

router.delete('/delete-enquiry/:id', deleteEnqById);

export default router;

