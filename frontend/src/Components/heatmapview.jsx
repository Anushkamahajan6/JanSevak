import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { expressInterestInIssue } from '../api/volunteerApi';

// Pass currentUser from VolunteerPage so we know the volunteerId
const HeatmapView = ({ currentUser }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Side panel
  const [panel, setPanel] = useState(null); // selected issue properties
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [alreadyInterested, setAlreadyInterested] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleICanHelp = async () => {
    if (!currentUser?._id) {
      showToast('Please register as a volunteer first.', 'error');
      return;
    }
    if (!panel?.id) return;

    setSubmitting(true);
    try {
      const data = await expressInterestInIssue(currentUser._id, panel.id);
      setAlreadyInterested(true);
      showToast('✅ Request sent! Admin will review and assign you.');
    } catch (err) {
      if (err.message?.includes('Already')) {
        setAlreadyInterested(true);
        showToast('You already expressed interest in this issue.', 'info');
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      setError('Mapbox token not configured. Add VITE_MAPBOX_TOKEN to .env');
      setLoading(false);
      return;
    }
    if (!mapContainer.current) return;
    if (map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [77.5092, 28.4621],
      zoom: 12,
    });

    map.current.on('load', () => {
      fetch('http://localhost:5000/api/heatmap')
        .then(r => { if (!r.ok) throw new Error(`Server ${r.status}`); return r.json(); })
        .then(geojson => {
          map.current.addSource('issues-data', { type: 'geojson', data: geojson });

          // Heatmap layer
          map.current.addLayer({
            id: 'issues-heat',
            type: 'heatmap',
            source: 'issues-data',
            maxzoom: 14,
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 14, 3],
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0,   'rgba(0,0,255,0)',
                0.2, 'rgb(0,255,255)',
                0.4, 'rgb(0,255,0)',
                0.6, 'rgb(255,255,0)',
                1,   'rgb(255,0,0)'
              ],
              'heatmap-radius': 50,
              'heatmap-opacity': 0.85,
            },
          });

          // Clickable pins — no minzoom so always visible
          map.current.addLayer({
            id: 'issues-pins',
            type: 'circle',
            source: 'issues-data',
            paint: {
              'circle-color': [
                'match', ['get', 'status'],
                'pending',     '#EF4444',
                'open',        '#EF4444',
                'in-progress', '#FBBF24',
                'resolved',    '#10B981',
                '#EF4444'
              ],
              'circle-radius': 10,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.95,
            },
          });

          map.current.on('mouseenter', 'issues-pins', () => {
            map.current.getCanvas().style.cursor = 'pointer';
          });
          map.current.on('mouseleave', 'issues-pins', () => {
            map.current.getCanvas().style.cursor = '';
          });

          // ✅ Click pin → show issue details panel
          map.current.on('click', 'issues-pins', (e) => {
            const props = e.features[0].properties;
            setAlreadyInterested(false); // reset for new issue
            setPanel(props);
          });

          // Click empty space → close panel
          map.current.on('click', (e) => {
            const features = map.current.queryRenderedFeatures(e.point, { layers: ['issues-pins'] });
            if (features.length === 0) setPanel(null);
          });

          setLoading(false);
        })
        .catch(err => {
          setError(`Failed to load data: ${err.message}`);
          setLoading(false);
        });
    });

    map.current.on('error', () => {
      setError('Map failed to load. Check Mapbox token.');
      setLoading(false);
    });

    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, []);

  const statusColor = (status) => ({
    open:          { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', label: 'Open' },
    pending:       { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', label: 'Pending' },
    'in-progress': { bg: 'rgba(251,191,36,0.15)', text: '#FBBF24', label: 'In Progress' },
    resolved:      { bg: 'rgba(16,185,129,0.15)', text: '#10B981', label: 'Resolved' },
  }[status] || { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF', label: status });

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '14px', overflow: 'hidden' }}>

      {/* Map container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Loading */}
      {loading && !error && (
        <div style={overlayStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '12px' }}>Loading heatmap...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={overlayStyle}>
          <p style={{ color: '#f87171', fontWeight: 600 }}>⚠️ {error}</p>
        </div>
      )}

      {/* Legend */}
      {!error && (
        <div style={legendStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Live Hotspots</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>Click a pin to volunteer</p>
        </div>
      )}

      {/* ✅ ISSUE DETAIL PANEL — slides in from right */}
      {panel && (
        <div style={panelStyle}>
          {/* Close */}
          <button onClick={() => setPanel(null)} style={closeBtnStyle}>✕</button>

          {/* Status badge */}
          <div style={{ marginBottom: '6px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 10px',
              borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em',
              background: statusColor(panel.status).bg,
              color: statusColor(panel.status).text,
            }}>
              {statusColor(panel.status).label}
            </span>
          </div>

          {/* Title */}
          <h3 style={{ margin: '8px 0 4px', color: '#fff', fontSize: '16px', fontWeight: 700 }}>
            {panel.title || panel.category}
          </h3>

          {/* Category */}
          <p style={{ margin: '0 0 10px', color: '#94a3b8', fontSize: '13px' }}>
            📂 {panel.category}
          </p>

          {/* Severity stars */}
          <p style={{ margin: '0 0 12px', fontSize: '14px' }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ color: i <= panel.severity ? '#FBBF24' : '#374151' }}>★</span>
            ))}
            <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '6px' }}>Severity {panel.severity}/5</span>
          </p>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />

          {/* Already assigned notice */}
          {panel.status === 'in-progress' || panel.status === 'resolved' ? (
            <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ margin: 0, color: '#FBBF24', fontSize: '13px', fontWeight: 600 }}>
                {panel.status === 'resolved' ? '✅ This issue is already resolved.' : '⏳ A volunteer is already working on this.'}
              </p>
            </div>
          ) : alreadyInterested ? (
            <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ margin: 0, color: '#a5b4fc', fontSize: '13px', fontWeight: 600 }}>
                ✋ Request sent! Admin will review and assign you.
              </p>
            </div>
          ) : (
            <button
              onClick={handleICanHelp}
              disabled={submitting}
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: '12px',
                background: submitting ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                color: '#fff', fontWeight: 700, fontSize: '14px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {submitting ? (
                <><span style={{ ...miniSpinner }} />  Sending...</>
              ) : (
                '🙋 I Can Help!'
              )}
            </button>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, padding: '10px 20px', borderRadius: '12px',
          background: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#4f46e5' : '#16a34a',
          color: '#fff', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const overlayStyle = {
  position: 'absolute', inset: 0, zIndex: 20,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)',
};

const spinnerStyle = {
  width: '36px', height: '36px', borderRadius: '50%',
  border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #ef4444',
  animation: 'spin 1s linear infinite',
};

const miniSpinner = {
  width: '14px', height: '14px', borderRadius: '50%', display: 'inline-block',
  border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
  animation: 'spin 0.8s linear infinite',
};

const legendStyle = {
  position: 'absolute', top: '12px', left: '12px', zIndex: 10,
  background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px',
};

const panelStyle = {
  position: 'absolute', top: '12px', right: '12px', bottom: '12px',
  zIndex: 20, width: '240px',
  background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px',
  padding: '18px 16px', overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

const closeBtnStyle = {
  position: 'absolute', top: '10px', right: '12px',
  background: 'none', border: 'none', color: '#6b7280',
  fontSize: '16px', cursor: 'pointer', lineHeight: 1,
};

export default HeatmapView;