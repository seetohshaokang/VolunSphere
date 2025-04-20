// GoogleMapDisplay.jsx - A memoized component
import {
	AdvancedMarker,
	APIProvider,
	ControlPosition,
	Map,
	MapControl,
} from "@vis.gl/react-google-maps";
import { memo } from "react";
import PlacesAutocomplete from "../PlacesAutocomplete";
import MapHandler from "./MapHandler";

const GoogleMapDisplay = memo(
	({
		selectedCoordinates,
		handleMapClick,
		handleMarkerRef,
		selectedPlace,
		handleCoordinatesChange,
		autocompleteInput,
		onPlaceSelect,
	}) => {
		return (
			<APIProvider
				apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
			>
				<div className="map-container" style={{ borderRadius: "20px" }}>
					<Map
						defaultZoom={15}
						defaultCenter={{ lat: 1.304833, lng: 103.831833 }}
						mapId={"d0eff4764a055a98"}
						gestureHandling="auto"
						onClick={handleMapClick}
						options={{
							tilt: 0,
							streetViewControl: false,
							fullscreenControl: false,
							mapTypeControl: false,
							zoomControl: true,
							mapTypeId: "roadmap",
							disableDefaultUI: true,
							minZoom: 8,
							maxZoom: 20,
							draggable: true,
						}}
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
									onPlaceSelect={onPlaceSelect}
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
		);
	}
);

GoogleMapDisplay.displayName = "GoogleMapDisplay";

export default GoogleMapDisplay;
