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