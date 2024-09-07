import { Error } from "mongoose";
import User from "./models/userModel.js";
import Client from "./models/clientModel.js";

export function capitalizeEachWord(str) {
    return str
        .split(' ') // Split the string into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(' '); // Join the words back into a string
}

export function endDateGenerator(startDate, period) {
    const [year, month, day] = startDate?.split('-').map(Number); // Convert to number
    let endDate = new Date(year, month - 1, day); // Month is zero-indexed

    switch (period) {
        case "monthly":
            endDate.setMonth(endDate.getMonth() + 1);
            break;
        case "twomonths":
            endDate.setMonth(endDate.getMonth() + 2);
            break;
        case "quarterly":
            endDate.setMonth(endDate.getMonth() + 3);
            break;
        case "halfyearly":
            endDate.setMonth(endDate.getMonth() + 6);
            break;
        case "yearly":
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        default:
            return "N/A";
    }

    // Format the end date as DD/MM/YYYY
    const dayString = String(endDate.getDate()).padStart(2, '0');
    const monthString = String(endDate.getMonth() + 1).padStart(2, '0');
    const yearString = endDate.getFullYear();

    const formattedEndDate = `${yearString}-${monthString}-${dayString}`;
    // console.log(formattedEndDate);

    return formattedEndDate;
}

export const generateCustomId = async (belongsToUserId) => {
    const user = await User.findById(belongsToUserId);
    if (!user) {
        throw new Error('User not found');
    }

    const gymName = user.gymTitle || ''; //Elite Fitness >> EF0001
    const gymShortform = user.gymShortform || gymName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();

    const lastClient = await Client.findOne({ providedId: new RegExp(`^${gymShortform}\\d+$`) }).sort({ providedId: -1 });

    const lastId = lastClient ? parseInt(lastClient.providedId.replace(gymShortform, ''), 10) : 0;
    const nextId = (lastId + 1).toString();

    const paddedNextId = nextId.padStart(4, '0');

    return `${gymShortform}${paddedNextId}`;
};