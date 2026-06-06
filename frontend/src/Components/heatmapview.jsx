import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { expressInterestInIssue } from '../api/volunteerApi';
import { useIssueNotifications } from '../hooks/useIssueNotifications';

const HeatmapView = ({ volunteer }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [alreadyInterested, setAlreadyInterested] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [proofNote, setProofNote] = useState('');
  const [proofSubmitting, setProofSubmitting] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshMap = useCallback(() => {
    if (!map.current?.getSource('issues-data')) return;
    fetch(`${apiBase}/api/heatmap`)
      .then(r => r.json())
      .then(geojson => map.current.getSource('issues-data').setData(geojson))
      .catch(() => { });
  }, [apiBase]);

  useIssueNotifications({
    onStatusUpdated: refreshMap,
    onNewIssue: refreshMap,
  });

  const handleICanHelp = async () => {
    if (!volunteer?._id) { showToast('Volunteer profile not found', 'error'); return; }
    if (!panel?.id) return;
    setSubmitting(true);
    try {
      await expressInterestInIssue(volunteer._id, panel.id);
      setAlreadyInterested(true);
      showToast('Request sent. Admin will review and assign you.');
    } catch (err) {
      if (err.message?.includes('Already')) {
        setAlreadyInterested(true);
        showToast('Already expressed interest.', 'info');
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofSubmit = async () => {
    if (!proofNote.trim()) { showToast('Add a progress note', 'error'); return; }
    setProofSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/issues/${panel.id}/proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ proofNote, status: 'in-progress' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast('Progress update submitted.');
      setProofNote('');
      setShowProof(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProofSubmitting(false);
    }
  };

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) { setError('Mapbox token not configured. Add VITE_MAPBOX_TOKEN to .env'); setLoading(false); return; }
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [77.5092, 28.4621],
      zoom: 12,
    });

    map.current.on('load', () => {
      fetch(`${apiBase}/api/heatmap`)
        .then(r => { if (!r.ok) throw new Error(`Server ${r.status}`); return r.json(); })
        .then(geojson => {
          map.current.addSource('issues-data', { type: 'geojson', data: geojson });

          map.current.addLayer({
            id: 'issues-heat',
            type: 'heatmap',
            source: 'issues-data',
            maxzoom: 15,
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
              'heatmap-radius': 50,
              'heatmap-opacity': 0.8,
            },
          });

          map.current.addLayer({
            id: 'issues-pins',
            type: 'circle',
            source: 'issues-data',
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
              'circle-opacity': 0.95,
            },
          });

          map.current.on('mouseenter', 'issues-pins', () => map.current.getCanvas().style.cursor = 'pointer');
          map.current.on('mouseleave', 'issues-pins', () => map.current.getCanvas().style.cursor = '');

          map.current.on('click', 'issues-pins', (e) => {
            const props = e.features[0].properties;
            setAlreadyInterested(false);
            setShowProof(false);
            setProofNote('');
            setPanel(props);
          });

          map.current.on('click', (e) => {
            const hits = map.current.queryRenderedFeatures(e.point, { layers: ['issues-pins'] });
            if (hits.length === 0) setPanel(null);
          });

          setLoading(false);
        })
        .catch(err => { setError(`Failed to load data: ${err.message}`); setLoading(false); });
    });

    map.current.on('error', () => { setError('Map failed to load. Check Mapbox token.'); setLoading(false); });

    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [apiBase]);

  const statusColor = (status) => ({
    open: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', label: 'Open' },
    pending: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', label: 'Pending' },
    'in-progress': { bg: 'rgba(251,191,36,0.15)', text: '#FBBF24', label: 'In Progress' },
    resolved: { bg: 'rgba(16,185,129,0.15)', text: '#10B981', label: 'Resolved' },
  }[status] || { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF', label: status });

  const isAssigned = panel && volunteer && panel.assignedTo === volunteer._id?.toString();

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '14px', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {loading && !error && (
        <div style={overlayStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '12px' }}>Loading heatmap...</p>
        </div>
      )}

      {error && (
        <div style={overlayStyle}>
          <p style={{ color: '#f87171', fontWeight: 600, textAlign: 'center', padding: '0 20px' }}>{error}</p>
        </div>
      )}

      {!error && (
        <div style={legendStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>Live Issues</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>Click a pin to volunteer</p>
        </div>
      )}

      {panel && (
        <div style={panelStyle}>
          <button onClick={() => setPanel(null)} style={closeBtnStyle}>✕</button>

          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
            background: statusColor(panel.status).bg, color: statusColor(panel.status).text,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {statusColor(panel.status).label}
          </span>

          {panel.requiresAuthority === 'true' || panel.requiresAuthority === true ? (
            <span style={{ marginLeft: 8, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: 'rgba(251,191,36,0.15)', color: '#FBBF24' }}>
              Authority Required
            </span>
          ) : (
            <span style={{ marginLeft: 8, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
              Direct Action
            </span>
          )}

          <h3 style={{ margin: '10px 0 4px', color: '#fff', fontSize: '15px', fontWeight: 700 }}>
            {panel.title || panel.category}
          </h3>

          <p style={{ margin: '0 0 6px', color: '#94a3b8', fontSize: '12px' }}>{panel.category}</p>

          {panel.description && (
            <p style={{ margin: '0 0 10px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5 }}>
              {panel.description}
            </p>
          )}

          {panel.address && (
            <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '12px' }}>
              {panel.address}
            </p>
          )}

          <p style={{ margin: '0 0 12px', fontSize: '13px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} style={{ color: i <= panel.severity ? '#FBBF24' : '#374151' }}>★</span>
            ))}
            <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '6px' }}>Severity {panel.severity}/5</span>
          </p>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '10px 0' }} />

          {/* Assigned — show proof submission */}
          {isAssigned && !showProof && (
            <button
              onClick={() => setShowProof(true)}
              style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: 8 }}
            >
              Update Progress / Add Proof
            </button>
          )}

          {isAssigned && showProof && (
            <div>
              <textarea
                value={proofNote}
                onChange={e => setProofNote(e.target.value)}
                placeholder="Describe what you did, current status..."
                rows={3}
                style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '13px', padding: '10px', resize: 'none', outline: 'none', marginBottom: 8 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowProof(false)}
                  style={{ flex: 1, padding: '9px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProofSubmit}
                  disabled={proofSubmitting}
                  style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px', opacity: proofSubmitting ? 0.5 : 1 }}
                >
                  {proofSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {/* Not assigned — show interest button */}
          {!isAssigned && (panel.status === 'resolved' ? (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ margin: 0, color: '#10B981', fontSize: '13px', fontWeight: 600 }}>Issue resolved.</p>
            </div>
          ) : panel.status === 'in-progress' && !isAssigned ? (
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ margin: 0, color: '#FBBF24', fontSize: '13px', fontWeight: 600 }}>A volunteer is already working on this.</p>
            </div>
          ) : alreadyInterested ? (
            <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ margin: 0, color: '#a5b4fc', fontSize: '13px', fontWeight: 600 }}>Request sent. Admin will review.</p>
            </div>
          ) : (
            <button
              onClick={handleICanHelp}
              disabled={submitting}
              style={{ width: '100%', padding: '11px', border: 'none', borderRadius: '10px', background: submitting ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Sending...' : 'I Can Help'}
            </button>
          ))}
        </div>
      )}

      {toast && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, padding: '10px 20px', borderRadius: '12px', whiteSpace: 'nowrap',
          background: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#4f46e5' : '#16a34a',
          color: '#fff', fontWeight: 600, fontSize: '13px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

const overlayStyle = { position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)' };
const spinnerStyle = { width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #ef4444', animation: 'spin 1s linear infinite' };
const legendStyle = { position: 'absolute', top: '12px', left: '12px', zIndex: 10, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px' };
const panelStyle = { position: 'absolute', top: '12px', right: '12px', bottom: '12px', zIndex: 20, width: '240px', background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '16px', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' };
const closeBtnStyle = { position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', color: '#6b7280', fontSize: '16px', cursor: 'pointer', lineHeight: 1 };

export default HeatmapView;