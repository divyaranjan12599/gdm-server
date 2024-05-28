import express from "express";
import { createClient, createStaff, deleteClientById, deleteStaffById, getClientById, getStaffById, login, register, updateClientById, updateStaffById, verifyJWT } from "../controllers/userController.js";


const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post('/create-client',createClient);

router.get('/get-client/:id', verifyJWT, getClientById);

router.put('/update-client/:id', verifyJWT, updateClientById);

router.delete('/delete-client/:id', verifyJWT, deleteClientById);

router.post('/create-staff', verifyJWT, createStaff);

router.get('/get-staff/:id', verifyJWT, getStaffById);

router.put('/update-staff/:id', verifyJWT, updateStaffById);

router.delete('/delete-staff/:id', verifyJWT, deleteStaffById);

export default router;

