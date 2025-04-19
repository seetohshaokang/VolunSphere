import {
	AdvancedMarker,
	APIProvider,
	ControlPosition,
	Map,
	MapControl,
	useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PlacesAutocomplete from "../PlacesAutocomplete";
import "./GoogleMaps.css";

// MapHandler component to manage map interactions
const MapHandler = ({ place, onCoordinatesChange }) => {
	const map = useMap();
	// Track the last processed place to prevent loops
	const lastProcessedPlace = useRef(null);

	useEffect(() => {
		if (
			!place ||
			!map ||
			!place.geometry ||
			(lastProcessedPlace.current &&
				lastProcessedPlace.current.place_id === place.place_id)
		) {
			return;
		}

		// Remember this place so we don't process it again
		lastProcessedPlace.current = place;

		const location = new google.maps.LatLng(
			place.geometry.location.lat(),
			place.geometry.location.lng()
		);

		map.panTo(location);
		map.setZoom(15);

		setTimeout(() => {
			if (map.get("draggable") !== true) {
				map.setOptions({ draggable: true });
			}
		}, 500);

		if (onCoordinatesChange) {
			onCoordinatesChange(location);
		}
	}, [place, map, onCoordinatesChange]);

	return null;
};

// Main component
const GoogleMaps = ({ trigger, setTrigger, extractData }) => {
	const [selectedPlace, setSelectedPlace] = useState(null);
	const [marker, setMarker] = useState(null);
	const [placeId, setPlaceId] = useState("");
	const [selectedCoordinates, setSelectedCoordinates] = useState(null);
	const [location, setLocation] = useState(null);
	const [mapInstance, setMapInstance] = useState(null);
	const [autocompleteInput, setAutocompleteInput] = useState("");

	// Create a single PlacesService instance reference
	const placesServiceRef = useRef(null);
	// Track already processed places
	const processedPlaceIds = useRef(new Set());

	// Initialize PlacesService once when needed
	const getPlacesService = () => {
		if (!placesServiceRef.current) {
			placesServiceRef.current = new google.maps.places.PlacesService(
				document.createElement("div")
			);
		}
		return placesServiceRef.current;
	};

	// Don't render anything if trigger is false
	if (!trigger) return null;

	const generateGoogleMapsUrl = (location) => {
		if (!location) return "";

		// If we have a place ID (preferred)
		if (placeId) {
			return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
		}

		// Fallback to coordinates if available
		if (selectedCoordinates) {
			const lat = selectedCoordinates.lat();
			const lng = selectedCoordinates.lng();
			return `https://www.google.com/maps?q=${lat},${lng}`;
		}

		// Fallback to address if no coordinates or place ID
		if (location.address) {
			return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
				location.address
			)}`;
		}

		return "";
	};

	const handleMapClick = (e) => {
		if (!e?.detail?.latLng) {
			console.log("Error: latLng is not available in the event.");
			toast.error("Could not get location.");
			// alert("Could not get location.");
			return;
		}
		const { lat, lng } = e.detail.latLng;
		console.log("Latitude:", lat);
		console.log("Longitude:", lng);

		// Clear previous placeId
		setPlaceId("");
		setSelectedCoordinates(new google.maps.LatLng(lat, lng));

		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ location: { lat, lng } }, (results, status) => {
			if (status === "OK" && results[0]) {
				const result = results[0];
				// Get the new placeId from results
				const newPlaceId = result.place_id || e.detail.placeId;

				// If we've already processed this place, don't do it again
				if (processedPlaceIds.current.has(newPlaceId)) {
					console.log(
						"Skipping already processed place:",
						newPlaceId
					);
					return;
				}
				processedPlaceIds.current.add(newPlaceId);

				// Set all data from this single request
				const locationUrl = `https://www.google.com/maps/place/?q=place_id:${newPlaceId}`;
				const formattedAddress = result.formatted_address;
				const placeName = result.name || formattedAddress.split(",")[0];

				console.log(
					"Setting location from map click:",
					formattedAddress
				);

				// Update all state in one place
				setPlaceId(newPlaceId);
				setLocation({
					name: placeName,
					address: formattedAddress,
					locationUrl: locationUrl,
					latitude: lat,
					longitude: lng,
				});

				setSelectedPlace({
					place_id: newPlaceId,
					geometry: {
						location: {
							lat: () => lat,
							lng: () => lng,
						},
					},
				});

				setAutocompleteInput(formattedAddress);
			} else {
				console.error("Geocoder failed due to:", status);
				toast.error("Could not get address for this location.");
				// alert("Could not get address for this location.");
			}
		});
	};

	const handleMarkerRef = (ref) => {
		if (ref) {
			setMarker(ref);
		}
	};

	const handlePlaceSelect = (place) => {
		console.log("Place selected:", place);

		if (!place || !place.place_id) {
			console.log("Invalid place selection, missing place_id");
			return;
		}

		// If we've already processed this place, don't do it again
		if (processedPlaceIds.current.has(place.place_id)) {
			console.log("Skipping already processed place:", place.place_id);
			return;
		}
		processedPlaceIds.current.add(place.place_id);

		// Set selected place and place ID in one go
		setSelectedPlace(place);
		setPlaceId(place.place_id);

		// Get all location details in a single request
		const service = getPlacesService();
		service.getDetails(
			{
				placeId: place.place_id,
				fields: ["name", "formatted_address", "geometry"],
			},
			(placeDetails, status) => {
				if (status === "OK" && placeDetails) {
					console.log("Place details:", placeDetails);

					// Update all location state at once
					const locationUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

					setLocation({
						name: placeDetails.name || place.name,
						address: placeDetails.formatted_address,
						locationUrl: locationUrl,
						latitude: placeDetails.geometry?.location.lat(),
						longitude: placeDetails.geometry?.location.lng(),
					});

					// Set autocomplete input value
					setAutocompleteInput(placeDetails.formatted_address);

					// Set coordinates if available
					if (placeDetails.geometry?.location) {
						setSelectedCoordinates(placeDetails.geometry.location);
					}
				}
			}
		);
	};

	const handleData = () => {
		if (location) {
			extractData([location]);
			setLocation(null);
			setTrigger(false);
			// Reset state for next use
			processedPlaceIds.current.clear();
		}
	};

	const handleCoordinatesChange = (coordinates) => {
		setSelectedCoordinates(coordinates);
	};

	const handleMapLoad = (map) => {
		console.log("Map Loaded:", map);
		console.log("Map is draggable:", map.get("draggable"));
		setMapInstance(map);
	};

	return (
		<div className="display-container">
			<div className="display">
				<APIProvider
					apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
				>
					<div
						className="map-container"
						style={{ borderRadius: "20px" }}
					>
						<Map
							defaultZoom={15}
							defaultCenter={{ lat: 1.304833, lng: 103.831833 }}
							mapId={"d0eff4764a055a98"}
							tilt={0}
							streetViewControl={false}
							fullscreenControl={false}
							mapTypeControl={false}
							zoomControl={true}
							mapTypeId={"roadmap"}
							disableDefaultUI={true}
							minZoom={8}
							maxZoom={20}
							onClick={handleMapClick}
							gestureHandling="cooperative"
							onLoad={handleMapLoad}
						>
							{selectedCoordinates && (
								<AdvancedMarker
									ref={handleMarkerRef}
									position={selectedCoordinates}
								/>
							)}
							<MapControl position={ControlPosition.TOP_CENTER}>
								<div
									className="autocomplete-control"
									style={{ display: "grid" }}
								>
									<PlacesAutocomplete
										value={autocompleteInput}
										onPlaceSelect={handlePlaceSelect}
									/>
								</div>
							</MapControl>
							<MapHandler
								place={selectedPlace}
								onCoordinatesChange={handleCoordinatesChange}
							/>
						</Map>
					</div>
				</APIProvider>

				{/* Location display and controls */}
				<div className="list_header">
					<h4>
						1. Type in your desired location or click on the map
						<br />
						2. Check that the location and name is correct
						<br />
						3. Click on "Add to Event!"
						<br />
					</h4>

					<div
						className="list_container"
						style={{
							textAlign: "center",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							padding: "20px",
							maxHeight: "50vh",
						}}
					>
						{location ? (
							<div style={{ width: "100%" }}>
								<p
									className="list_heading"
									style={{
										fontSize: "22px",
										fontWeight: "bold",
										marginBottom: "15px",
									}}
								>
									Selected Location
								</p>
								<div
									className="list_items"
									style={{
										padding: "20px",
										boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
										borderRadius: "8px",
										marginBottom: "25px",
									}}
								>
									<p
										className="content"
										style={{
											fontSize: "18px",
											margin: "10px 0",
										}}
									>
										<strong>Name:</strong> {location.name}
									</p>
									<p
										className="content"
										style={{
											fontSize: "18px",
											margin: "10px 0",
										}}
									>
										<strong>Address:</strong>{" "}
										{location.address}
									</p>
									<p
										className="content"
										style={{
											fontSize: "18px",
											margin: "15px 0 10px 0",
										}}
									>
										<a
											href={generateGoogleMapsUrl(
												location
											)}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												color: "#1a73e8",
												textDecoration: "none",
												display: "inline-flex",
												alignItems: "center",
												fontWeight: "500",
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="#1a73e8"
												style={{ marginRight: "6px" }}
											>
												<path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
											</svg>
											View on Google Maps
										</a>
									</p>
								</div>
							</div>
						) : (
							<div style={{ marginBottom: "20px" }}>
								<p
									className="list_heading"
									style={{
										fontSize: "20px",
										fontWeight: "bold",
									}}
								>
									No Location Selected
								</p>
							</div>
						)}

						<button
							style={{
								backgroundColor: "blue",
								color: "white",
								borderRadius: "8px",
								padding: "10px 15px",
								width: "300px",
								height: "50px",
								textAlign: "center",
								fontSize: "16px",
								fontWeight: "bold",
								border: "none",
								cursor: "pointer",
								marginTop: "20px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
								transition: "background-color 0.3s ease",
							}}
							onClick={handleData}
							type="button"
							disabled={!location}
						>
							Add to Event!
						</button>
					</div>

					<div className="close-popup">
						<button type="button" onClick={() => setTrigger(false)}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GoogleMaps;
