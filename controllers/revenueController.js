import ExpenseDetail from "../models/expenseModel.js";
import MembershipDetail from "../models/membershipModel.js";
import PaymentDetail from "../models/paymentModel.js";

// export const countMembershipsByWeek = async () => {
//     const results = await MembershipDetail.aggregate([
//         {
//             $addFields: {
//                 startDateConverted: {
//                     $dateFromString: {
//                         dateString: "$startDate",
//                         format: "%b %d, %Y" // Specify the format
//                     }
//                 }
//             }
//         },
//         {
//             $group: {
//                 _id: {
//                     year: { $year: "$startDateConverted" },
//                     week: { $week: "$startDateConverted" }
//                 },
//                 count: { $sum: 1 }
//             }
//         },
//         {
//             $project: {
//                 _id: 0,
//                 year: "$_id.year",
//                 week: "$_id.week",
//                 count: 1
//             }
//         },
//         {
//             $sort: { year: 1, week: 1 }
//         }
//     ]);
//     return results;
// };

export const countMembershipsByYear = async () => {
    const results = await MembershipDetail.aggregate([
        {
            $addFields: {
                startDateConverted: {
                    $dateFromString: {
                        dateString: "$startDate",
                        format: "%b %d, %Y" // Specify the format
                    }
                }
            }
        },
        {
            $group: {
                _id: { $year: "$startDateConverted" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id",
                count: 1
            }
        },
        {
            $sort: { year: 1 }
        }
    ]);
    return results;
};

export const countMembershipsByMonth = async () => {
    const results = await MembershipDetail.aggregate([
        {
            $addFields: {
                startDateConverted: {
                    $dateFromString: {
                        dateString: "$startDate",
                        format: "%b %d, %Y" // Specify the format
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$startDateConverted" },
                    month: { $month: "$startDateConverted" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                count: 1
            }
        },
        {
            $sort: { year: 1, month: 1 }
        }
    ]);
    return results;
};

export const countMembershipsByDay = async () => {
    const results = await MembershipDetail.aggregate([
        {
            $addFields: {
                startDateConverted: {
                    $dateFromString: {
                        dateString: "$startDate",
                        format: "%b %d, %Y" // Specify the format
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$startDateConverted" },
                    month: { $month: "$startDateConverted" },
                    day: { $dayOfMonth: "$startDateConverted" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
                count: 1
            }
        },
        {
            $sort: { year: 1, month: 1, day: 1 }
        }
    ]);
    return results;
};

export const countMembershipsByMonthAndPeriod = async () => {
    const results = await MembershipDetail.aggregate([
        {
            $addFields: {
                startDateConverted: {
                    $dateFromString: {
                        dateString: "$startDate",
                        format: "%b %d, %Y" // Specify the format
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$startDateConverted" },
                    month: { $month: "$startDateConverted" },
                    membershipPeriod: "$membershipPeriod"
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                membershipPeriod: "$_id.membershipPeriod",
                count: 1
            }
        },
        {
            $sort: { year: 1, month: 1, membershipPeriod: 1 }
        }
    ]);
    return results;
};

export const countMembershipsByYearAndPeriod = async () => {
    const results = await MembershipDetail.aggregate([
        {
            $addFields: {
                startDateConverted: {
                    $dateFromString: {
                        dateString: "$startDate",
                        format: "%b %d, %Y" // Specify the format
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$startDateConverted" },
                    membershipPeriod: "$membershipPeriod"
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                membershipPeriod: "$_id.membershipPeriod",
                count: 1
            }
        },
        {
            $sort: { year: 1, membershipPeriod: 1 }
        }
    ]);
    return results;
};

const getAllYearlyMonthlyTotals = async () => {
    const result = await PaymentDetail.aggregate([
        {
            $addFields: {
                amountPaidOnConverted: {
                    $dateFromString: {
                        dateString: "$amountPaidOn",
                        format: "%b %d, %Y" // Specify the format
                    }
                }
            }
        },
        {
            $match: {
                amountPaidOnConverted: { $exists: true, $ne: null } // Ensure amountPaidOn is not null
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$amountPaidOnConverted" }, // Group by year
                    month: { $month: "$amountPaidOnConverted" } // Group by month
                },
                totalAmount: { $sum: "$amountPaid" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
        }
    ]);

    // Format the result into a more accessible structure
    const monthlyTotals = {};
    result.forEach(item => {
        const year = item._id.year;
        const month = item._id.month;
        if (!monthlyTotals[year]) {
            monthlyTotals[year] = Array(12).fill(0); // Initialize array for each year
        }
        monthlyTotals[year][month - 1] = item.totalAmount; // Map total amounts to the correct month index
    });

    return monthlyTotals;
};

const getTotalPayments = async () => {
    const result = await PaymentDetail.aggregate([
        {
            $group: {
                _id: null, // No specific grouping
                totalAmount: { $sum: "$amountPaid" }
            }
        }
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
};

const getAllYearlyMonthlyExpenseTotals = async () => {
    const result = await ExpenseDetail.aggregate([
        {
            $addFields: {
                amountPaidOnConverted: {
                    $dateFromString: {
                        dateString: "$amountPaidOn",
                        format: "%b %d, %Y" // Specify the format
                    }
                }
            }
        },
        {
            $match: {
                amountPaidOnConverted: { $exists: true, $ne: null } // Ensure amountPaidOn is not null
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$amountPaidOnConverted" }, // Group by year
                    month: { $month: "$amountPaidOnConverted" } // Group by month
                },
                totalAmount: { $sum: "$amountPaid" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
        }
    ]);

    // Format the result into a more accessible structure
    const monthlyTotals = {};
    result.forEach(item => {
        const year = item._id.year;
        const month = item._id.month;
        if (!monthlyTotals[year]) {
            monthlyTotals[year] = Array(12).fill(0); // Initialize array for each year
        }
        monthlyTotals[year][month - 1] = item.totalAmount; // Map total amounts to the correct month index
    });

    return monthlyTotals;
};

const getTotalExpensePayments = async () => {
    const result = await ExpenseDetail.aggregate([
        {
            $group: {
                _id: null, // No specific grouping
                totalAmount: { $sum: "$amountPaid" }
            }
        }
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
};

export const testing = async () => {
    const monthlyCounts = await countMembershipsByMonth();
    const yearlyCounts = await countMembershipsByYear();
    // const weeklyCounts = await countMembershipsByWeek();
    const dayCounts = await countMembershipsByDay();

    console.log("monthlyCounts",monthlyCounts);
    console.log("yearlyCounts",yearlyCounts);
    // console.log("weeklyCounts",weeklyCounts);
    console.log("dayCounts",dayCounts);

    const monthlyCountsWithPeriod = await countMembershipsByMonthAndPeriod();
    const yearlyCountsWithPeriod = await countMembershipsByYearAndPeriod();

    console.log(monthlyCountsWithPeriod);
    console.log(yearlyCountsWithPeriod);

    const allMonthlyTotals = await getAllYearlyMonthlyTotals();
    console.log("Monthly totals for all years:", allMonthlyTotals);

    const totalPayments = await getTotalPayments();
    console.log(`Total payments across all time: ${totalPayments}`);

    const allMonthlyETotals = await getAllYearlyMonthlyExpenseTotals();
    console.log("Monthly totals expense for all years:", allMonthlyETotals);

    const totalEPayments = await getTotalExpensePayments();
    console.log(`Total Expense payments across all time: ${totalEPayments}`);
};
