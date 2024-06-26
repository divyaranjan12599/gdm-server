import express from "express";
import { createClient, createEnq, createStaff, deleteClientById, deleteEnqById, deleteStaffById, getAllClient, getAllEnq, getAllStaff, getClientById, getEnqById, getStaffById, login, register, updateClientById, updateEnqById, updateStaffById, verifyJWT } from "../controllers/userController.js";


const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post('/create-client',createClient);

router.get('/get-client/:id', getClientById);

router.get('/get-clients', getAllClient);

router.put('/update-client/:id', updateClientById);

router.delete('/delete-client/:id', deleteClientById);

router.post('/create-staff', createStaff);

router.get('/get-staff/:id', getStaffById);

router.get('/get-staffs', getAllStaff);

router.put('/update-staff/:id', updateStaffById);

router.delete('/delete-staff/:id', deleteStaffById);

router.post('/create-enquiry', createEnq);

router.get('/get-enquiry/:id', getEnqById);

router.get('/get-enquirys', getAllEnq);

router.put('/update-enquiry/:id', updateEnqById);

router.delete('/delete-enquiry/:id', deleteEnqById);

export default router;

