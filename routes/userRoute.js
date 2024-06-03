import express from "express";
import { createClient, createEnq, createStaff, deleteClientById, deleteEnqById, deleteStaffById, getAllClient, getAllEnq, getAllStaff, getClientById, getEnqById, getStaffById, login, register, updateClientById, updateEnqById, updateStaffById, verifyJWT } from "../controllers/userController.js";


const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post('/create-client',createClient);

router.get('/get-client/:id', verifyJWT, getClientById);

router.get('/get-clients', verifyJWT, getAllClient);

router.put('/update-client/:id', verifyJWT, updateClientById);

router.delete('/delete-client/:id', verifyJWT, deleteClientById);

router.post('/create-staff', verifyJWT, createStaff);

router.get('/get-staff/:id', verifyJWT, getStaffById);

router.get('/get-staffs', verifyJWT, getAllStaff);

router.put('/update-staff/:id', verifyJWT, updateStaffById);

router.delete('/delete-staff/:id', verifyJWT, deleteStaffById);

router.post('/create-enquiry', verifyJWT, createEnq);

router.get('/get-enquiry/:id', verifyJWT, getEnqById);

router.get('/get-enquirys', verifyJWT, getAllEnq);

router.put('/update-enquiry/:id', verifyJWT, updateEnqById);

router.delete('/delete-enquiry/:id', verifyJWT, deleteEnqById);

export default router;

