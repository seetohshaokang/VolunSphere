export const getEventImageUrl = (imageUrl, timestamp = Date.now()) => {
	const DEFAULT_IMAGE = "/src/assets/default-event.jpg";

	if (!imageUrl) return DEFAULT_IMAGE;

	const cacheBuster = `t=${timestamp}&r=${Math.random()}`;

	if (imageUrl.startsWith("http")) {
		return imageUrl.includes("?")
			? `${imageUrl}&${cacheBuster}`
			: `${imageUrl}?${cacheBuster}`;
	}

	const serverUrl = "http://localhost:8000";
	if (imageUrl.startsWith("/uploads")) {
		return `${serverUrl}${imageUrl}?${cacheBuster}`;
	}

	return DEFAULT_IMAGE;
};

export const getRemainingSpots = (maxVolunteers, registeredCount = 0) => {
	if (maxVolunteers) {
		const remainingSpots = maxVolunteers - registeredCount;
		return Math.max(0, remainingSpots);
	}
	return "N/A";
};

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
