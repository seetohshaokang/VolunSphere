import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import PlacesAutocomplete from "../PlacesAutocomplete";
import "./LeafletMap.css";

// Fix for default marker icons in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Map handler for updating view when location changes
const MapHandler = ({ place, onCoordinatesChange }) => {
	const map = useMap();
	const processedPlaceRef = useRef(null);

	useEffect(() => {
		if (
			place &&
			place.geometry &&
			JSON.stringify(place) !== JSON.stringify(processedPlaceRef.current)
		) {
			processedPlaceRef.current = place;

			const lat =
				typeof place.geometry.location.lat === "function"
					? place.geometry.location.lat()
					: place.geometry.location.lat;

			const lng =
				typeof place.geometry.location.lng === "function"
					? place.geometry.location.lng()
					: place.geometry.location.lng;

			const location = [lat, lng];
			map.setView(location, 15, { animate: true });

			if (onCoordinatesChange) {
				onCoordinatesChange(location);
			}
		}
	}, [place, map, onCoordinatesChange]);

	return null;
};

// Helper component to add event listeners to the map
const MapEvents = ({ onClick }) => {
	const map = useMap();

	useEffect(() => {
		if (!map) return;

		const handleClick = (e) => {
			onClick(e);
		};

		map.on("click", handleClick);

		return () => {
			map.off("click", handleClick);
		};
	}, [map, onClick]);

	return null;
};

const LeafletMap = ({ trigger, setTrigger, extractData }) => {
	// Define all state and refs at the top, no conditional hooks
	const [selectedPlace, setSelectedPlace] = useState(null);
	const [selectedCoordinates, setSelectedCoordinates] = useState(null);
	const [location, setLocation] = useState(null);
	const [autocompleteInput, setAutocompleteInput] = useState("");
	const mapRef = useRef(null);
	const lastRequestTime = useRef(0);

	// Define all callbacks before any conditional returns
	const generateLocationUrl = useCallback(
		(loc) => {
			if (!loc) return "";

			// Use coordinates for OpenStreetMap URL
			if (selectedCoordinates) {
				const lat = Array.isArray(selectedCoordinates)
					? selectedCoordinates[0]
					: selectedCoordinates.lat;
				const lng = Array.isArray(selectedCoordinates)
					? selectedCoordinates[1]
					: selectedCoordinates.lng;

				return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
			}

			// Fallback to address search
			if (loc.address) {
				return `https://www.openstreetmap.org/search?query=${encodeURIComponent(
					loc.address
				)}`;
			}

			return "";
		},
		[selectedCoordinates]
	);

	const handleMapClick = useCallback(async (e) => {
		const { lat, lng } = e.latlng;
		setSelectedCoordinates([lat, lng]);

		try {
			const now = Date.now();
			const timeSinceLastRequest = now - lastRequestTime.current;

			if (timeSinceLastRequest < 1000) {
				await new Promise((resolve) =>
					setTimeout(resolve, 1000 - timeSinceLastRequest)
				);
			}

			lastRequestTime.current = Date.now();

			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
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

			const data = await response.json();

			if (data) {
				const placeName = data.name || data.display_name.split(",")[0];
				const formattedAddress = data.display_name;
				const locationUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

				setLocation({
					name: placeName,
					address: formattedAddress,
					locationUrl: locationUrl,
				});

				setSelectedPlace({
					place_id: data.place_id,
					geometry: {
						location: {
							lat: lat,
							lng: lng,
						},
					},
				});

				setAutocompleteInput(formattedAddress);
			}
		} catch (error) {
			console.error("Reverse geocoding failed:", error);
			alert("Could not get address for this location.");
		}
	}, []);

	const handlePlaceSelect = useCallback((place) => {
		setSelectedPlace(place);

		if (place && place.geometry) {
			const lat = place.geometry.location.lat;
			const lng = place.geometry.location.lng;

			setSelectedCoordinates([lat, lng]);

			const locationUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

			setLocation({
				name: place.name || place.display_name.split(",")[0],
				address: place.formatted_address || place.display_name,
				locationUrl: locationUrl,
			});

			setAutocompleteInput(place.formatted_address || place.display_name);
		}
	}, []);

	const handleCoordinatesChange = useCallback((coordinates) => {
		setSelectedCoordinates(coordinates);
	}, []);

	const handleData = useCallback(() => {
		if (location) {
			extractData([location]);
			setLocation(null);
			setTrigger(false);
		}
	}, [location, extractData, setTrigger]);

	// NOW we can have conditional rendering, after all hooks are defined
	if (!trigger) return null;

	return (
		<div className="display-container">
			<div className="display">
				<div className="map-container" style={{ borderRadius: "20px" }}>
					<MapContainer
						center={[1.304833, 103.831833]} // Singapore coordinates
						zoom={15}
						style={{ height: "600px", width: "100%" }}
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>

						{selectedCoordinates && (
							<Marker position={selectedCoordinates}>
								<Popup>
									{location?.name || "Selected location"}
									<br />
									{location?.address || ""}
								</Popup>
							</Marker>
						)}

						<MapHandler
							place={selectedPlace}
							onCoordinatesChange={handleCoordinatesChange}
						/>

						<MapEvents onClick={handleMapClick} />
					</MapContainer>

					<div className="autocomplete-control">
						<PlacesAutocomplete
							value={autocompleteInput}
							onPlaceSelect={handlePlaceSelect}
						/>
					</div>
				</div>

				<div className="info-panel">
					<h3>Selected Location</h3>
					{location ? (
						<div>
							<p>
								<strong>Name:</strong> {location.name}
							</p>
							<p>
								<strong>Address:</strong> {location.address}
							</p>
							<p>
								<a
									href={location.locationUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									View on OpenStreetMap
								</a>
							</p>
							<button onClick={handleData}>Add Location</button>
						</div>
					) : (
						<p>
							Click on the map or search for a place to select a
							location.
						</p>
					)}
				</div>
			</div>

			<button onClick={() => setTrigger(false)} className="close-btn">
				Close
			</button>
		</div>
	);
};

export default LeafletMap;
