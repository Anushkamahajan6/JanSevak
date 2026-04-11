import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const AdminHeatmap = () => {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [77.1025, 28.7041], // Delhi
            zoom: 10
        });

        map.current.on('load', () => {
            map.current.addSource('issues-source', {
                type: 'geojson',
                data: 'http://localhost:5000/api/heatmap'
            });

            map.current.addLayer({
                id: 'heat-layer',
                type: 'heatmap',
                source: 'issues',
                paint: {
                    'heatmap-weight': ['get', 'weight'],
                    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
                    'heatmap-color': [
                        'interpolate', ['linear'], ['heatmap-density'],
                        0, 'rgba(0,0,255,0)',
                        0.2, 'rgb(0,255,255)',
                        0.6, 'rgb(255,255,0)',
                        1, 'rgb(255,0,0)'
                    ],
                    'heatmap-radius':50,
                    'heatmap-opacity': 0.9
                }
            });
        });

        return () => map.remove();
    }, []);

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900">
            <h1 className="text-2xl font-bold text-white mb-4">Admin Hotspot Monitor</h1>
            <div ref={mapContainer} className="flex-grow rounded-xl shadow-2xl overflow-hidden border-2 border-gray-700" />
        </div>
    );
};

export default AdminHeatmap;