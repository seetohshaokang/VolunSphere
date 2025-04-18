import { useCallback, useEffect, useRef, useState } from "react";
import "./PlacesAutocomplete.css";

const PlacesAutocomplete = ({ onPlaceSelect, value }) => {
	// Define all state and refs first
	const [suggestions, setSuggestions] = useState([]);
	const [inputValue, setInputValue] = useState(value || "");
	const [loading, setLoading] = useState(false);
	const inputRef = useRef(null);
	const lastRequestTime = useRef(0);

	// Define callbacks
	const searchPlaces = useCallback(async (query) => {
		if (!query || query.length < 3) {
			setSuggestions([]);
			return;
		}

		const now = Date.now();
		const timeSinceLastRequest = now - lastRequestTime.current;

		if (timeSinceLastRequest < 1000) {
			await new Promise((resolve) =>
				setTimeout(resolve, 1000 - timeSinceLastRequest)
			);
		}

		setLoading(true);

		try {
			lastRequestTime.current = Date.now();

			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					query
				)}&limit=5&addressdetails=1`,
				{
					headers: {
						"Accept-Language": "en",
						"User-Agent": "VolunSphere/1.0",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const results = await response.json();
			setSuggestions(results || []);
		} catch (error) {
			console.error("Error fetching place suggestions:", error);
			setSuggestions([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSelect = useCallback(
		(place) => {
			setInputValue(place.display_name);
			setSuggestions([]);

			const selectedPlace = {
				place_id: place.place_id,
				name: place.name || place.display_name.split(",")[0],
				display_name: place.display_name,
				formatted_address: place.display_name,
				geometry: {
					location: {
						lat: parseFloat(place.lat),
						lng: parseFloat(place.lon),
					},
				},
			};

			onPlaceSelect(selectedPlace);
		},
		[onPlaceSelect]
	);

	// Effects
	useEffect(() => {
		const timer = setTimeout(() => {
			if (inputValue && inputValue !== value) {
				searchPlaces(inputValue);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [inputValue, value, searchPlaces]);

	useEffect(() => {
		if (value && value !== inputValue) {
			setInputValue(value);
		}
	}, [value, inputValue]);

	return (
		<div className="autocomplete-container">
			<input
				ref={inputRef}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				placeholder="Search for a location"
				className="autocomplete-input"
			/>

			{loading && <div className="loading-indicator">Loading...</div>}

			{suggestions.length > 0 && (
				<div className="suggestions-container">
					{suggestions.map((place) => (
						<div
							key={place.place_id}
							onClick={() => handleSelect(place)}
							className="suggestion-item"
						>
							{place.display_name}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default PlacesAutocomplete;
