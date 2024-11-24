/**
 * Converts a time string in the format "HH:MM AM/PM" to minutes from midnight.
 * @param {string} time - The time string to convert.
 * @returns {number} The total minutes from midnight.
 */
export const parseTime = (time: string): number => {
    // Split the time string into hours and minutes, and the period (AM/PM).
    const [hourMinute, period] = time.split(' ');
    // Split the hours and minutes into separate numbers.
    let [hours, minutes] = hourMinute.split(':').map(Number);

    // If the period is PM and the hours are not 12, add 12 to the hours.
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    // If the period is AM and the hours are 12, set the hours to 0.
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes; // Return the total minutes from midnight.
};
