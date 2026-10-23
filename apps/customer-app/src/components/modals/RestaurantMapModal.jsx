import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';

// Custom marker icon using FontAwesome styling
const customIcon = new L.DivIcon({
  html: `<div style="
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    border: 3px solid white;
  ">
    <span style="
      color: white;
      font-size: 14px;
      transform: rotate(45deg);
      font-weight: bold;
    ">📍</span>
  </div>`,
  className: 'custom-map-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const RestaurantMapModal = ({ isOpen, onClose, restaurantName, lat, lng }) => {
  // Ensure coordinates are valid numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const isValidCoords = !isNaN(latitude) && !isNaN(longitude);

  // Default to a central location if coords are invalid (should not happen with good data)
  const center = isValidCoords ? [latitude, longitude] : [1.3521, 103.8198]; // Singapore default

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faLocationDot} className="text-red-500 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {restaurantName}
              </h3>
              <p className="text-sm text-gray-500">
                {isValidCoords ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Location unavailable'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
            aria-label="Close map"
          >
            <FontAwesomeIcon icon={faXmark} className="text-gray-600" />
          </button>
        </div>
        
        {/* Map Container - Only render when isOpen is true */}
        <div className="relative w-full h-[400px] sm:h-[500px]">
          {isValidCoords ? (
            <MapContainer
              center={center}
              zoom={16}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center} icon={customIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{restaurantName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faLocationDot} className="text-red-400 text-2xl" />
              </div>
              <p className="text-gray-600 font-medium">Location data unavailable</p>
              <p className="text-gray-400 text-sm mt-1">This restaurant does not have valid coordinates</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Map data &copy; <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">OpenStreetMap</a> contributors
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMapModal;
