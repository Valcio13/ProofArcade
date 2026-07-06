/**
 * Time Utilities
 * 
 * Helper functions for date and time operations.
 * Focuses on UTC date handling for daily competitions and time-based features.
 */

/**
 * Converts microseconds timestamp to UTC date string (YYYY-MM-DD)
 */
export function utcDateFromMicros(nowMicros: number): string {
    if (nowMicros <= 0) {
        return new Date().toISOString().slice(0, 10);
    }
    return new Date(Math.floor(nowMicros / 1000)).toISOString().slice(0, 10);
}

/**
 * Converts microseconds timestamp to UTC month string (YYYY-MM)
 */
export function utcMonthFromMicros(nowMicros: number): string {
    if (nowMicros <= 0) {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
    const date = new Date(Math.floor(nowMicros / 1000));
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Checks if a UTC day has ended relative to current time
 */
export function hasUtcDayEnded(utcDate: string, nowMicros: number): boolean {
    if (!utcDate) {
        return false;
    }
    const endMillis = Date.parse(`${utcDate}T00:00:00.000Z`) + 24 * 60 * 60 * 1000;
    return nowMicros >= endMillis * 1000;
}

/**
 * Get the previous UTC date (one day before)
 * 
 * Given a UTC date string (YYYY-MM-DD), returns the date for the previous day.
 * Used for checking consecutive login streaks.
 * 
 * @param utcDate - UTC date string in YYYY-MM-DD format
 * @returns Previous day in YYYY-MM-DD format, or empty string if invalid
 */
export function previousUtcDate(utcDate: string): string {
    const baseMillis = Date.parse(`${utcDate}T00:00:00.000Z`);
    if (Number.isNaN(baseMillis)) {
        return '';
    }
    return new Date(baseMillis - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
