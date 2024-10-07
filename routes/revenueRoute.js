import express from "express";
import { countMembershipsByDay, countMembershipsByMonth, countMembershipsByMonthAndPeriod, countMembershipsByYear, countMembershipsByYearAndPeriod, getAllYearlyMonthlyExpenseTotals, getAllYearlyMonthlyTotals, getTotalExpensePayments, getTotalPayments, testing } from "../controllers/revenueController.js";

const router = express.Router();

router.get("/test", testing);

router.get("/get-mem-by-year", countMembershipsByYear)
router.get("/get-mem-by-month", countMembershipsByMonth)
router.get("/get-mem-by-day", countMembershipsByDay)
router.get("/get-mem-by-month-and-period", countMembershipsByMonthAndPeriod)
router.get("/get-mem-by-year-and-period", countMembershipsByYearAndPeriod)
router.get("/get-all-yearly-monthly-total", getAllYearlyMonthlyTotals)
router.get("/get-total-payment", getTotalPayments)
router.get("/get-all-expenses", getAllYearlyMonthlyExpenseTotals)
router.get("/get-all-expenses-payments", getTotalExpensePayments)

export default router;