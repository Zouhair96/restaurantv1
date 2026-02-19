/**
 * Order Number Generator Utility
 * Handles per-restaurant order numbering with automatic reset periods
 */

/**
 * Check if two dates are on the same day
 */
const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

/**
 * Check if weekly reset is needed
 * @param {string|null} lastResetDate - ISO date string of last reset
 * @param {number} weekStartDay - 0=Sunday, 1=Monday, etc.
 * @param {Date} now - Current date
 */
const shouldResetWeekly = (lastResetDate, weekStartDay, now) => {
    if (!lastResetDate) return true;

    const lastReset = new Date(lastResetDate);

    // Get the start of the current week based on weekStartDay
    const currentWeekStart = new Date(now);
    const daysSinceWeekStart = (now.getDay() - weekStartDay + 7) % 7;
    currentWeekStart.setDate(now.getDate() - daysSinceWeekStart);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Get the start of the week when last reset happened
    const lastResetWeekStart = new Date(lastReset);
    const daysSinceLastWeekStart = (lastReset.getDay() - weekStartDay + 7) % 7;
    lastResetWeekStart.setDate(lastReset.getDate() - daysSinceLastWeekStart);
    lastResetWeekStart.setHours(0, 0, 0, 0);

    // Reset if we're in a different week
    return currentWeekStart.getTime() !== lastResetWeekStart.getTime();
};

/**
 * Get next order number for a restaurant
 * @param {Object} config - Restaurant's order_number_config
 * @returns {Object} { order_number, new_current, last_reset_date }
 */
export const getNextOrderNumber = (config) => {
    const now = new Date();
    const {
        starting_number = 1,
        current_number = 1,
        reset_period = 'never',
        weekly_start_day = 1,
        last_reset_date = null
    } = config || {};

    // Check if reset is needed
    let shouldReset = false;

    if (reset_period === 'daily') {
        const lastReset = last_reset_date ? new Date(last_reset_date) : null;
        shouldReset = !lastReset || !isSameDay(lastReset, now);
    }
    else if (reset_period === 'weekly') {
        shouldReset = shouldResetWeekly(last_reset_date, weekly_start_day, now);
    }
    else if (reset_period === 'monthly') {
        const lastReset = last_reset_date ? new Date(last_reset_date) : null;
        shouldReset = !lastReset ||
            lastReset.getFullYear() !== now.getFullYear() ||
            lastReset.getMonth() !== now.getMonth();
    }

    if (shouldReset) {
        return {
            order_number: starting_number,
            new_current: starting_number + 1,
            last_reset_date: now.toISOString()
        };
    }

    return {
        order_number: current_number,
        new_current: current_number + 1,
        last_reset_date: last_reset_date
    };
};
