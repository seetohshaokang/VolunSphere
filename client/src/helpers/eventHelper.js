/**
 * Gets the event's image URL with cache busting
 * 
 * @param {string|null} imageUrl
 * @param {number} timestamp
 * @returns {string}
 */
export const getEventImageUrl = (imageUrl, timestamp = Date.now()) => {
    const DEFAULT_IMAGE = "/src/assets/default-event.jpg";
    
    if (!imageUrl) return DEFAULT_IMAGE;

    const cacheBuster = `t=${timestamp}&r=${Math.random()}`;

    if (imageUrl.startsWith("http")) {
        return imageUrl.includes('?') 
            ? `${imageUrl}&${cacheBuster}` 
            : `${imageUrl}?${cacheBuster}`;
    }

    const serverUrl = "http://localhost:8000";
    if (imageUrl.startsWith("/uploads")) {
        return `${serverUrl}${imageUrl}?${cacheBuster}`;
    }

    return DEFAULT_IMAGE;
};

/**
 * Calculate remaining spots for an event
 * 
 * @param {number} maxVolunteers
 * @param {number} registeredCount
 * @returns {string|number}
 */
export const getRemainingSpots = (maxVolunteers, registeredCount = 0) => {
    if (maxVolunteers) {
        const remainingSpots = maxVolunteers - registeredCount;
        return Math.max(0, remainingSpots);
    }
    return "N/A";
};

/**
 * Format event date for display
 * 
 * @param {Object} event
 * @returns {string}
 */
export const getFormattedEventDate = (event) => {
    if (event.is_recurring && event.recurrence_start_date) {
        return new Date(event.recurrence_start_date).toLocaleDateString();
    } else if (event.start_datetime) {
        return new Date(event.start_datetime).toLocaleDateString();
    } else if (event.start_date) {
        return new Date(event.start_date).toLocaleDateString();
    }
    return "Date TBD";
}; 