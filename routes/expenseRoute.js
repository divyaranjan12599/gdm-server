import express from "express";
import { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createExpense);
router.get("/get-expense", protect, getExpenses);
router.get("/get-expense/:id", protect, getExpenseById);
router.put("/update/:id", protect, updateExpense);
router.delete("/delete/:id", protect, deleteExpense);

export default router;
