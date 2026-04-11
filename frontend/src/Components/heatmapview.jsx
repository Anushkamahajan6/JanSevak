import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Use your token from .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const HeatmapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (map.current) return; // Prevent double initialization

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Best for Heatmaps
      center: [77.1025, 28.7041], // Default: Delhi
      zoom: 11,
    });

    map.current.on('load', () => {
      // 1. Add Source from your working Backend
      map.current.addSource('issues-data', {
        type: 'geojson',
        data: 'http://localhost:5000/api/heatmap'
      });

      // 2. Add Heatmap Layer
      map.current.addLayer({
        id: 'issues-heat',
        type: 'heatmap',
        source: 'issues-data',
        maxzoom: 15,
        paint: {
          // Weight: Severity 5 points glow more than Severity 1
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
          // Intensity: Scales the "glow" as you zoom
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          // Color: Blue (Low) -> Green -> Yellow -> Red (High Density)
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,255,0)',
            0.2, 'rgb(0,255,255)',
            0.4, 'rgb(0,255,0)',
            0.6, 'rgb(255,255,0)',
            1, 'rgb(255,0,0)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
          'heatmap-opacity': 0.8
        }
      });

      setLoading(false);
    });

    // Clean up on unmount
    return () => map.current.remove();
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
      
      {/* 🟢 Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}

      {/* 🔴 Map UI Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Live Issue Hotspots
          </h3>
          <p className="text-slate-400 text-xs mt-1">Real-time density from MongoDB Atlas</p>
          
          {/* Heatmap Legend */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-tighter">
              <span>Low Density</span>
              <span>High Density</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-600"></div>
          </div>
        </div>
      </div>

      {/* 🗺️ The Map Instance */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default HeatmapView;