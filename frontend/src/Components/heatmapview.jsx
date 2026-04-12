import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

const HeatmapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token is available
    if (!mapboxToken) {
      setError('Mapbox token is not configured. Please add VITE_MAPBOX_TOKEN to your .env file');
      setLoading(false);
      return;
    }

    // Check if container exists
    if (!mapContainer.current) {
      setError('Map container is not available');
      setLoading(false);
      return;
    }

    // Prevent double initialization
    if (map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      // Clear container before initialization
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '';
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [77.1025, 28.7041], // Delhi
        zoom: 11,
      });

      map.current.on('load', () => {
        if (!map.current.getSource('issues-data')) {
          map.current.addSource('issues-data', {
            type: 'geojson',
            data: 'http://localhost:5000/api/heatmap'
          });
        }

        // Check if layer already exists
        if (!map.current.getLayer('issues-heat')) {
          map.current.addLayer({
            id: 'issues-heat',
            type: 'heatmap',
            source: 'issues-data',
            maxzoom: 12, // Zoom badhne par heatmap gayab ho jayegi
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
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
        }

        if (!map.current.getLayer('issues-pins')) {
          map.current.addLayer({
            id: 'issues-pins',
            type: 'circle',
            source: 'issues-data',
            minzoom: 8, // Kam zoom par bhi pins dikhenge
            paint: {
              // PIN COLOR BASED ON STATUS
              'circle-color': [
                'match',
                ['get', 'status'],
                'pending', '#EF4444',     // Red
                'in-progress', '#FBBF24',  // Yellow
                'resolved', '#10B981',    // Green
                '#888888'                 // Default Gray if status missing
              ],
              // PIN SIZE
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 6,
                15, 12
              ],
              // WHITE BORDER (McDonald's style)
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });
        }

        setLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map. Please check your Mapbox token.');
        setLoading(false);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err.message);
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm gap-4 p-6">
          <div className="text-center">
            <h3 className="text-red-400 font-bold text-lg mb-2">⚠️ Map Error</h3>
            <p className="text-slate-300 text-sm">{error}</p>
            <p className="text-slate-400 text-xs mt-3">
              ⚡ To fix: Add your Mapbox token to <code className="bg-slate-800 px-2 py-1 rounded inline-block">.env</code>
            </p>
            <p className="text-slate-400 text-xs mt-2">Steps:</p>
            <ol className="text-slate-400 text-xs mt-2 space-y-1 text-left inline-block">
              <li>1. Get a free token from mapbox.com</li>
              <li>2. Create <code className="bg-slate-800 px-2 py-1 rounded">.env</code> in frontend folder</li>
              <li>3. Add: <code className="bg-slate-800 px-2 py-1 rounded">VITE_MAPBOX_TOKEN=your_token</code></li>
              <li>4. Restart dev server</li>
            </ol>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-slate-300 text-sm">Loading heatmap...</p>
          </div>
        </div>
      )}

      {/* Map UI Overlay */}
      {!error && (
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
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default HeatmapView;