import ExpenseDetail from "../models/expenseModel.js";
import { formatDate } from "../utilityFunctions.js";

export const createExpense = async (req, res) => {
	const { amountPaid, amountPaidOn, paidFor } = req.body;
	// console.log("User : ", req.user);
	try {
		const newExpense = new ExpenseDetail({
			amountPaid,
			amountPaidOn: formatDate(amountPaidOn),
			paidFor,
			belongsTo: req.user.userId,
		});

		const savedExpense = await newExpense.save();
		res.status(201).json(savedExpense);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const updateExpense = async (req, res) => {
	const { id } = req.params;
	const { amountPaid, amountPaidOn, paidFor } = req.body;

	try {
		const updatedExpense = await ExpenseDetail.findByIdAndUpdate(
			id,
			{
				amountPaid,
				amountPaidOn: formatDate(amountPaidOn),
				paidFor,
				belongsTo: req.user.userId,
			},
			{ new: true }
		);

		if (!updatedExpense) {
			return res.status(404).json({ message: "Expense not found" });
		}

		res.status(200).json(updatedExpense);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const getExpenses = async (req, res) => {
	try {
		const expenses = await ExpenseDetail.find({ belongsTo: req.user.userId }).populate("belongsTo");
		res.status(200).json(expenses);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get a single expense by ID
export const getExpenseById = async (req, res) => {
	const { id } = req.params;

	try {
		const expense = await ExpenseDetail.findOne({ _id: id, belongsTo: req.user.userId }).populate("belongsTo");
		if (!expense) {
			return res.status(404).json({ message: "Expense not found" });
		}
		res.status(200).json(expense);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Delete an expense by ID
export const deleteExpense = async (req, res) => {
	const { id } = req.params;

	try {
		const deletedExpense = await ExpenseDetail.findOneAndDelete({ _id: id, belongsTo: req.user.userId });

		if (!deletedExpense) {
			return res.status(404).json({ message: "Expense not found or does not belong to the user" });
		}

		res.status(200).json({ message: "Expense deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
