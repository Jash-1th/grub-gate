// SSR stub for react-leaflet - prevents "window is not defined" errors during server-side rendering
// This file is used as an alias for 'react-leaflet' during SSR build

import React from 'react';

// Stub components that render nothing during SSR
export const MapContainer = ({ children }) => {
  // Only render on client-side
  if (typeof window === 'undefined') {
    return null;
  }
  return React.createElement('div', { className: 'leaflet-map-container' }, children);
};

export const TileLayer = () => null;
export const Marker = ({ children }) => null;
export const Popup = ({ children }) => null;
export const Circle = () => null;
export const CircleMarker = () => null;
export const Polyline = () => null;
export const Polygon = () => null;
export const Rectangle = () => null;
export const useMap = () => ({});
export const useMapEvents = () => ({});
export const useMapLayer = () => ({});
export const useMapControl = () => ({});
export const LayerGroup = ({ children }) => null;
export const FeatureGroup = ({ children }) => null;
export const GeoJSON = () => null;
export const ImageOverlay = () => null;
export const VideoOverlay = () => null;
export const SVGOverlay = () => null;
export const Tooltip = ({ children }) => null;
export const ScaleControl = () => null;
export const ZoomControl = () => null;
export const AttributionControl = () => null;
export const LayersControl = () => null;
