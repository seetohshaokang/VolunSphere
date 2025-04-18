import { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

const PlacesAutocomplete = ({ onPlaceSelect, value }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  // In PlacesAutocomplete.jsx
  useEffect(() => {
    // Clean up previous autocomplete instance if it exists
    if (placeAutocomplete) {
      google.maps.event.clearInstanceListeners(placeAutocomplete);
    }

    if (!places || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['place_id', 'name', 'geometry', 'formatted_address']
    });

    setPlaceAutocomplete(autocomplete);

    const handlePlace = () => {
      const selectedPlace = autocomplete.getPlace();
      if (!selectedPlace.geometry || !selectedPlace.place_id) {
        console.warn("Place missing critical data");
        return;
      }
      onPlaceSelect(selectedPlace);
    };

    autocomplete.addListener('place_changed', handlePlace);

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [places]); // Only recreate when places library changes

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
          width: '300px',
          height: '30px',
          textAlign: 'center',
          padding: '0 8px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />
    </div>
  );
};

export default PlacesAutocomplete;
