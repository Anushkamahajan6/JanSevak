import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const AdminHeatmap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openPanel = useCallback(async (issueId) => {
    console.log('Opening panel for issue:', issueId);
    setPanelLoading(true);
    setPanel(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/issue/${issueId}/volunteers`, {
        credentials: 'include',
      });
      console.log('Panel response status:', res.status);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      console.log('Panel data:', data);
      setPanel(data);
    } catch (err) {
      console.error('Panel error:', err);
      showToast(`Failed to load: ${err.message}`, 'error');
    } finally {
      setPanelLoading(false);
    }
  }, []);

  const handleApprove = async (volunteerId) => {
    if (!panel?.issue?._id) return;
    setApproving(volunteerId);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/issue/${panel.issue._id}/approve/${volunteerId}`,
        { method: 'POST', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');
      showToast(`✅ ${data.message}`);
      await openPanel(panel.issue._id);

      if (mapRef.current?.getSource('issues-source')) {
        const src = mapRef.current.getSource('issues-source');
        const gj = src._data;
        src.setData({
          ...gj,
          features: gj.features.map(f =>
            f.properties.id === panel.issue._id
              ? { ...f, properties: { ...f.properties, status: 'in-progress' } }
              : f
          )
        });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      setError('Mapbox token not found.');
      setLoading(false);
      return;
    }
    mapboxgl.accessToken = token;
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [77.5092, 28.4621], // centered on your actual data
      zoom: 12,
    });
    mapRef.current = map;

    map.on('load', () => {
      fetch('http://localhost:5000/api/heatmap')
        .then(r => r.json())
        .then(geojson => {
          console.log('Loaded features:', geojson.features?.length);

          map.addSource('issues-source', { type: 'geojson', data: geojson });

          // Heatmap layer
          map.addLayer({
            id: 'heat-layer',
            type: 'heatmap',
            source: 'issues-source',
            maxzoom: 14,
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 14, 3],
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,255,0)',
                0.2, 'rgb(0,255,255)',
                0.6, 'rgb(255,255,0)',
                1, 'rgb(255,0,0)'
              ],
              'heatmap-radius': 50,
              'heatmap-opacity': 0.85,
            },
          });

          // ✅ NO minzoom — pins visible at ALL zoom levels
          map.addLayer({
            id: 'issues-pins',
            type: 'circle',
            source: 'issues-source',
            paint: {
              'circle-color': [
                'match', ['get', 'status'],
                'pending', '#EF4444',
                'open', '#EF4444',
                'in-progress', '#FBBF24',
                'resolved', '#10B981',
                '#EF4444'
              ],
              'circle-radius': 10,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.9,
            },
          });

          // Cursor
          map.on('mouseenter', 'issues-pins', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'issues-pins', () => {
            map.getCanvas().style.cursor = '';
          });

          // ✅ Click on pin → open panel
          map.on('click', 'issues-pins', (e) => {
            e.preventDefault();
            const feature = e.features[0];
            console.log('Clicked feature:', feature.properties);
            openPanel(feature.properties.id);
          });

          // Click on empty space → close panel
          map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['issues-pins'] });
            if (features.length === 0) {
              setPanel(null);
            }
          });

          setLoading(false);
        })
        .catch(err => {
          console.error('Heatmap fetch error:', err);
          setError(`Failed to load data: ${err.message}`);
          setLoading(false);
        });
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
      setError('Map failed to load.');
      setLoading(false);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [openPanel]);

  const statusBadge = (status) => {
    const colors = {
      open: 'bg-red-500/20 text-red-400',
      pending: 'bg-red-500/20 text-red-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      resolved: 'bg-green-500/20 text-green-400',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">

      {/* ── MAP ── */}
      <div className="relative flex-1 flex flex-col p-4 min-w-0">
        <h1 className="text-xl font-bold text-white mb-3 shrink-0 flex items-center gap-2">
          🗺️ Admin Hotspot Monitor
          <span className="text-xs font-normal text-gray-500">Click a pin to manage volunteers</span>
        </h1>

        <div className="relative flex-1 min-h-0">
          {error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/95 rounded-xl">
              <p className="text-red-400 font-semibold">⚠️ {error}</p>
            </div>
          )}
          {loading && !error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/70 rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
                <p className="text-gray-300 text-sm">Loading heatmap...</p>
              </div>
            </div>
          )}

          {/* Legend */}
          {!error && (
            <div className="absolute top-4 left-4 z-10 bg-gray-800/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Live Hotspots
              </h3>
              <p className="text-gray-400 text-xs mt-1">Click any pin to assign volunteers</p>
              <div className="mt-3 space-y-1.5">
                {[['#EF4444', 'Open / Pending'], ['#FBBF24', 'In Progress'], ['#10B981', 'Resolved']].map(([color, label]) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="h-3 w-3 rounded-full shrink-0 border border-white/30" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl" />
        </div>
      </div>

      {/* ── SIDE PANEL ── */}
      <div
        className="flex flex-col border-l border-gray-700 transition-all duration-300 overflow-hidden shrink-0"
        style={{ width: panel || panelLoading ? '22rem' : '0', background: '#111827' }}
      >
        {panelLoading && (
          <div className="w-88 flex-1 flex items-center justify-center" style={{ width: '22rem' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
              <p className="text-gray-400 text-sm">Loading...</p>
            </div>
          </div>
        )}

        {panel && !panelLoading && (
          <div className="flex flex-col h-full" style={{ width: '22rem' }}>

            {/* Header */}
            <div className="p-5 border-b border-gray-700 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Issue Details</p>
                  <h2 className="text-white font-bold text-base leading-snug">
                    {panel.issue.title || panel.issue.category}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {statusBadge(panel.issue.status)}
                    <span className="text-yellow-400 text-xs">
                      {'★'.repeat(panel.issue.severity)}{'☆'.repeat(5 - panel.issue.severity)}
                    </span>
                  </div>
                  {panel.issue.location?.address && (
                    <p className="text-xs text-gray-500 mt-1">📍 {panel.issue.location.address}</p>
                  )}
                  {panel.issue.assignedVolunteer && (
                    <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                      <p className="text-yellow-400 text-xs font-semibold">
                        ✅ Assigned: {panel.issue.assignedVolunteer.name}
                      </p>
                    </div>
                  )}
                </div>
                <button onClick={() => setPanel(null)} className="text-gray-500 hover:text-white text-xl shrink-0">✕</button>
              </div>
            </div>

            {/* Volunteer list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Interested Volunteers ({panel.interestedVolunteers.length})
              </p>

              {panel.interestedVolunteers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-3xl mb-3">🙋</p>
                  <p className="text-gray-400 text-sm font-medium">No volunteers yet</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Volunteers appear here after clicking<br />"I want to help" on this issue.
                  </p>
                </div>
              ) : (
                panel.interestedVolunteers.map((v) => {
                  const isAssigned =
                    panel.issue.assignedVolunteer?._id === v._id ||
                    panel.issue.assignedVolunteer === v._id;
                  const isApproving = approving === v._id;
                  const taskTaken = panel.issue.status === 'in-progress' && !isAssigned;

                  return (
                    <div key={v._id} className={`rounded-xl border p-4 ${isAssigned ? 'border-green-500/50 bg-green-500/10' : 'border-gray-700 bg-gray-800/50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-sm">{v.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>⭐ {v.rating?.toFixed(1) ?? '0.0'}</span>
                            <span>🏆 {v.points ?? 0} pts</span>
                          </div>
                          {v.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {v.skills.map(s => (
                                <span key={s} className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 mt-1">
                          {isAssigned ? (
                            <span className="text-green-400 text-xs font-bold">✔ Assigned</span>
                          ) : taskTaken ? (
                            <span className="text-gray-500 text-xs">Taken</span>
                          ) : (
                            <button
                              onClick={() => handleApprove(v._id)}
                              disabled={isApproving}
                              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {isApproving ? 'Approving...' : '✓ Approve'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminHeatmap;