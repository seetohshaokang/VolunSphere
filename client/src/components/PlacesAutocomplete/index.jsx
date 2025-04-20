import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

const PlacesAutocomplete = ({ onPlaceSelect, value }) => {
	const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
	const inputRef = useRef(null);
	const places = useMapsLibrary("places");
	const processedPlaces = useRef(new Set());

	useEffect(() => {
		// Clean up previous autocomplete instance if it exists
		if (placeAutocomplete) {
			if (window.google) {
				google.maps.event.clearInstanceListeners(placeAutocomplete);
			}
		}

		if (!places || !inputRef.current) return;

		const autocomplete = new window.google.maps.places.Autocomplete(
			inputRef.current,
			{
				fields: ["place_id", "name", "geometry", "formatted_address"],
			}
		);

		setPlaceAutocomplete(autocomplete);

		const handlePlace = () => {
			const selectedPlace = autocomplete.getPlace();
			if (!selectedPlace.geometry || !selectedPlace.place_id) {
				console.warn("Place missing critical data");
				return;
			}

			// Check if we've already processed this place
			if (processedPlaces.current.has(selectedPlace.place_id)) {
				console.log(
					"Skipping already processed place:",
					selectedPlace.place_id
				);
				return;
			}
			processedPlaces.current.add(selectedPlace.place_id);

			console.log("🔍 Place selected from autocomplete:", selectedPlace);
			onPlaceSelect(selectedPlace);
		};

		autocomplete.addListener("place_changed", handlePlace);

		return () => {
			if (autocomplete && window.google) {
				google.maps.event.clearInstanceListeners(autocomplete);
			}
		};
	}, [places]); // Only recreate when places library changes

	// Reset processed places when component unmounts
	useEffect(() => {
		return () => {
			processedPlaces.current.clear();
		};
	}, []);

	// Update input value when prop changes
	useEffect(() => {
		if (inputRef.current && value) {
			inputRef.current.value = value;
		}
	}, [value]);

	return (
		<div className="autocomplete-container">
			<input
				ref={inputRef}
				placeholder="Where would you like to go?"
				style={{
					width: "300px",
					height: "30px",
					textAlign: "center",
					padding: "0 8px",
					borderRadius: "4px",
					border: "1px solid #ccc",
				}}
			/>
		</div>
	);
};

export default PlacesAutocomplete;
