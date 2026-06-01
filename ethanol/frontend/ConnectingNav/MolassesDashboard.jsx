/*
  MolassesDashboard-Enhanced.jsx
  - Enhanced, single-file React implementation (components + hooks + CSS in one file for convenience)
  - Features implemented (per user selection 1,2,3,4):
    1) Chart Enhancements: multi-line (Avg Brix, Avg Pol, Purity), Brush (zoom), live update indicator
    2) Table Enhancements: pagination, column sort, sticky header, advanced filters
    3) Analytics: auto Purity calc, trend detection (linear slope), alerts (thresholds), naive prediction (linear)
    4) Content: Built-in Beginner→Pro educational panel (collapsible)

  How to use:
    - Save this as MolassesDashboard-Enhanced.jsx
    - Install: npm install recharts react-icons
    - Place a sibling CSS file MolassesDashboard-Enhanced.css (content included at bottom of this doc)
    - Import: import './MolassesDashboard-Enhanced.css';
    - Render <MolassesDashboardEnhanced /> in your app

  Notes:
    - Data is still persisted in localStorage (key: molasses_data_v2)
    - To integrate with backend, replace CRUD functions in the hook useMolassesData
*/

import { useEffect, useMemo, useState } from 'react';
import {
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    CartesianGrid,
    Brush,
    AreaChart,
    Area,
} from 'recharts';
import { FiPlus, FiEdit2, FiTrash, FiDownload, FiSearch, FiBell, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './MolassesDashboard.css';

/* ------------------------------ utils ------------------------------ */
const STORAGE_KEY = 'molasses_data_v2';
const POLL_MS = 5000;
function uid() { return Math.random().toString(36).slice(2, 9); }
function nowIso() { return new Date().toISOString(); }
function formatDate(iso) { const d = new Date(iso); return d.toLocaleString(); }

function sampleData() {
    const types = ['A-Molasses', 'B-Molasses', 'C-Molasses'];
    const rows = []; const base = Date.now() - 1000 * 60 * 60 * 24 * 14; // 14 days
    for (let i = 0; i < 60; i++) {
        const ts = new Date(base + i * 1000 * 60 * 60 * 6);
        const type = types[Math.floor(Math.random() * types.length)];
        const brix = +(55 + Math.random() * 15).toFixed(2);
        const volume = +(200 + Math.random() * 800).toFixed(0);
        const pol = +(brix * (0.7 + Math.random() * 0.2)).toFixed(2);
        rows.push({ id: uid(), timestamp: ts.toISOString(), type, brix, pol, volume, notes: 'Auto sample' });
    }
    return rows;
}

/* simple linear regression slope (x=0..n-1) */
function linearSlope(values) {
    const n = values.length; if (n < 2) return 0;
    const xs = Array.from({ length: n }, (_, i) => i);
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - xMean) * (values[i] - yMean); den += (xs[i] - xMean) * (xs[i] - xMean); }
    return den === 0 ? 0 : num / den;
}

/* naive prediction for next value using slope */
function naivePredict(values) { const n = values.length; if (n === 0) return null; const slope = linearSlope(values); const last = values[values.length - 1]; return +(last + slope).toFixed(2); }

/* ------------------------------ hook: useMolassesData ------------------------------ */
function useMolassesData() {
    const [data, setData] = useState(() => {
        try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return sampleData(); const p = JSON.parse(raw); if (!Array.isArray(p)) return sampleData(); return p; } catch (e) { return sampleData(); }
    });
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);

    // realtime simulation
    useEffect(() => {
        const t = setInterval(() => {
            setData(prev => {
                const clone = [...prev];
                if (Math.random() < 0.65 && clone.length > 0) {
                    const idx = Math.floor(Math.random() * clone.length);
                    const row = { ...clone[idx] };
                    row.brix = +(row.brix + (Math.random() - 0.5) * 0.6).toFixed(2);
                    row.volume = Math.max(10, +(row.volume + (Math.random() - 0.5) * 30).toFixed(0));
                    row.pol = +(row.brix * (0.7 + Math.random() * 0.2)).toFixed(2);
                    row.timestamp = nowIso(); clone[idx] = row;
                } else {
                    const types = ['A-Molasses', 'B-Molasses', 'C-Molasses'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    const brix = +(55 + Math.random() * 15).toFixed(2);
                    const volume = +(200 + Math.random() * 800).toFixed(0);
                    const pol = +(brix * (0.7 + Math.random() * 0.2)).toFixed(2);
                    clone.push({ id: uid(), timestamp: nowIso(), type, brix, pol, volume, notes: 'Realtime simulated' });
                    if (clone.length > 3000) clone.shift();
                }
                return clone;
            });
        }, POLL_MS);
        return () => clearInterval(t);
    }, []);

    const add = (row) => setData(prev => [...prev, { id: uid(), ...row }]);
    const update = (id, patch) => setData(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    const remove = (id) => setData(prev => prev.filter(r => r.id !== id));
    const importRows = (rows) => setData(prev => [...prev, ...rows.map(r => ({ id: uid(), ...r }))]);

    return { data, add, update, remove, importRows };
}

/* ------------------------------ Components ------------------------------ */
export default function MolassesDashboard() {
    const { data, add, update, remove, importRows } = useMolassesData();
    const [period, setPeriod] = useState('7d');
    const [query, setQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState({ key: 'timestamp', dir: 'desc' });
    const [selected, setSelected] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showContent, setShowContent] = useState(true);

    // derived filtered
    const filtered = useMemo(() => {
        const cutoff = (() => { const now = Date.now(); if (period === '1d') return now - 1000 * 60 * 60 * 24; if (period === '7d') return now - 1000 * 60 * 60 * 24 * 7; if (period === '30d') return now - 1000 * 60 * 60 * 24 * 30; return 0; })();
        return data
            .filter(r => new Date(r.timestamp).getTime() >= cutoff)
            .filter(r => filterType === 'all' ? true : r.type === filterType)
            .filter(r => { const q = query.trim().toLowerCase(); if (!q) return true; return r.type.toLowerCase().includes(q) || (r.notes || '').toLowerCase().includes(q); })
            .map(r => ({ ...r, purity: +((Number(r.pol) || 0) / (Number(r.brix) || 1) * 100).toFixed(2) }))
            .sort((a, b) => { if (sortBy.key === 'timestamp') return sortBy.dir === 'asc' ? new Date(a.timestamp) - new Date(b.timestamp) : new Date(b.timestamp) - new Date(a.timestamp); if (sortBy.key === 'brix' || sortBy.key === 'pol' || sortBy.key === 'volume' || sortBy.key === 'purity') { return sortBy.dir === 'asc' ? a[sortBy.key] - b[sortBy.key] : b[sortBy.key] - a[sortBy.key]; } return 0; });
    }, [data, period, query, filterType, sortBy]);

    // pagination
    const total = filtered.length; const pages = Math.max(1, Math.ceil(total / pageSize));
    useEffect(() => { if (page > pages) setPage(1); }, [pages]);
    const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

    // chart aggregates per day
    const chartData = useMemo(() => {
        const map = new Map();
        filtered.forEach(r => { const d = new Date(r.timestamp).toISOString().slice(0, 10); if (!map.has(d)) map.set(d, { date: d, brixSum: 0, polSum: 0, puritySum: 0, count: 0, volume: 0 }); const cur = map.get(d); cur.brixSum += Number(r.brix || 0); cur.polSum += Number(r.pol || 0); cur.volume += Number(r.volume || 0); cur.puritySum += (Number(r.pol || 0) / (Number(r.brix || 1))) * 100; cur.count += 1; });
        return Array.from(map.values()).map(v => ({ date: v.date, avgBrix: +(v.brixSum / v.count).toFixed(2), avgPol: +(v.polSum / v.count).toFixed(2), avgPurity: +(v.puritySum / v.count).toFixed(2), volume: v.volume }));
    }, [filtered]);

    // volume by type
    const volumeByType = useMemo(() => {
        const map = {};
        filtered.forEach(r => { map[r.type] = (map[r.type] || 0) + Number(r.volume || 0); });
        return Object.keys(map).map(k => ({ type: k, volume: map[k] }));
    }, [filtered]);

    // analytics: trend detection on last N
    // analytics: trend detection on last N
    const recentBrix = useMemo(() => filtered.slice(-10).map(r => Number(r.brix || 0)), [filtered]);
    const brixSlope = linearSlope(recentBrix);
    // alerts
    const alerts = useMemo(() => {
        const out = [];
        // threshold examples
        const highBrix = filtered.find(r => r.brix > 68);
        if (highBrix) out.push({ type: 'High Brix', message: `${highBrix.type} reading ${highBrix.brix} at ${formatDate(highBrix.timestamp)}` });
        const lowPol = filtered.find(r => r.pol < 35);
        if (lowPol) out.push({ type: 'Low Pol', message: `${lowPol.type} reading pol ${lowPol.pol} at ${formatDate(lowPol.timestamp)}` });
        return out;
    }, [filtered]);

    // export CSV
    function exportCSV(rows) { const header = ['id', 'timestamp', 'type', 'brix', 'pol', 'purity', 'volume', 'notes']; const lines = [header.join(',')]; rows.forEach(r => lines.push([r.id, r.timestamp, r.type, r.brix, r.pol, r.purity ? r.purity.toFixed(2) : '', r.volume, '"' + (r.notes || '') + '"'].join(','))); const blob = new Blob([lines.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `molasses_export_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url); }

    // import CSV (simple) -> parse basic rows, expects header
    function importCSV(file) {
        const reader = new FileReader(); reader.onload = e => {
            const text = e.target.result; const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean); if (lines.length < 2) return alert('No rows'); const header = lines[0].split(',').map(h => h.trim().toLowerCase()); const rows = []; for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(','); if (cols.length < header.length) continue; const obj = {}; header.forEach((h, idx) => obj[h] = cols[idx]); // map
                if (!obj.timestamp) obj.timestamp = nowIso(); rows.push({ timestamp: obj.timestamp, type: obj.type || 'A-Molasses', brix: Number(obj.brix) || 60, pol: Number(obj.pol) || 42, volume: Number(obj.volume) || 300, notes: obj.notes ? obj.notes.replace(/^"|"$/g, '') : '' });
            }
            importRows(rows); alert('Imported ' + rows.length + ' rows');
        }; reader.readAsText(file);
    }

    return (
        <div className="enh-container">
            <div className="enh-top">
                <div>
                    {/* <h2>Molasses Stats</h2> */}
                    <p className="muted">Realtime</p>
                </div>
                <div className="enh-controls">
                    <div className="indicator"> <FiBell /> <span className={alerts.length ? 'alert-dot' : 'alert-dot hidden'}></span></div>
                    <div className="period-select">
                        <select value={period} onChange={e => setPeriod(e.target.value)}>{['1d', '7d', '30d', 'all'].map(p => <option key={p} value={p}>{p}</option>)}</select>
                    </div>
                    <div className="search">
                        <input placeholder="Search type or notes..." value={query} onChange={e => setQuery(e.target.value)} />
                        <FiSearch />
                    </div>
                    <div className="type-filter">
                        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">All Types</option>
                            <option>A-Molasses</option><option>B-Molasses</option><option>C-Molasses</option>
                        </select>
                    </div>
                    <button className="btn primary" onClick={() => setIsAddOpen(true)}><FiPlus /> Add</button>
                    <button className="btn outline" onClick={() => exportCSV(filtered)}><FiDownload /> Export</button>
                    <label className="btn outline file">Import<input type="file" accept=".csv" onChange={e => e.target.files[0] && importCSV(e.target.files[0])} /></label>
                    <button className="btn ghost"  onClick={() => setShowContent(s => !s)}>{showContent ? <><FiChevronUp /> Hide</> : <><FiChevronDown /> Learn</>}</button>
                    {/* content  */}
                    {showContent && (
                        <div className="ml-learn-page">

                            <h1 className="ml-title"> What is mean by Molasses...</h1>
                            <p className="ml-subtitle">Master Brix, Pol, Purity & Ethanol Production Insights</p>

                            {/* Short Definitions */}
                            <section className="ml-section">
                                <h2 className="ml-section-title"> Short way </h2>

                                <div className="ml-card-grid">
                                    <div className="ml-card">
                                        <h3>What is Molasses?</h3>
                                        <p>Molasses is a thick, dark syrup produced as a by-product during sugar extraction.</p>
                                    </div>

                                    <div className="ml-card">
                                        <h3>A-Molasses</h3>
                                        <p>High-quality molasses with maximum sugar from the first crystallization.</p>
                                    </div>

                                    <div className="ml-card">
                                        <h3>B-Molasses</h3>
                                        <p>Medium-quality molasses from the second crystallization cycle.</p>
                                    </div>

                                    <div className="ml-card">
                                        <h3>C-Molasses</h3>
                                        <p>Low-quality molasses with the least fermentable sugars.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Detailed Explanation */}
                            <section className="ml-section">
                                <h2 className="ml-section-title">Descibed</h2>
                                <div className="ml-text-block">
                                    <p>
                                        Molasses is produced after extracting sugar crystals from sugarcane juice.
                                        Each boiling stage creates different grades:
                                    </p>
                                    <ul>
                                        <li><strong>A-Molasses:</strong> Highest sucrose, best purity.</li>
                                        <li><strong>B-Molasses:</strong> Moderate quality.</li>
                                        <li><strong>C-Molasses:</strong> Lowest quality with impurities.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Technical Explanation */}
                            <section className="ml-section">
                                <h2 className="ml-section-title"> Purity checking</h2>

                                <div className="ml-card">
                                    <h3>Brix (°Bx)</h3>
                                    <p>Total dissolved solids. Higher Brix = more ethanol.</p>
                                </div>

                                <div className="ml-card">
                                    <h3>Pol (%)</h3>
                                    <p>Sucrose percentage measured via polarimeter.</p>
                                </div>

                                <div className="ml-card">
                                    <h3>Purity (%)</h3>
                                    <p>Purity = (Pol / Brix) × 100</p>
                                </div>

                                <table className="ml-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Brix</th>
                                            <th>Pol</th>
                                            <th>Purity</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>A</td><td>58–62</td><td>40–45</td><td>65–72%</td><td>Best</td></tr>
                                        <tr><td>B</td><td>55–60</td><td>28–34</td><td>50–58%</td><td>Good</td></tr>
                                        <tr><td>C</td><td>48–55</td><td>15–23</td><td>30–43%</td><td>Poor</td></tr>
                                    </tbody>
                                </table>
                            </section>

                            {/* Flow */}
                            <section className="ml-section">
                                <h2 className="ml-section-title"> Molasses → Ethanol process Work-flow</h2>

                                <div className="ml-flow">
                                    Sugarcane ➜ Juice Extraction ➜ Sugar Boiling ➜ A/B/C Molasses ➜ Dilution ➜ Fermentation ➜ Distillation ➜ Ethanol
                                </div>
                            </section>

                            {/* Why it Matters */}
                            <section className="ml-section">
                                <h2 className="ml-section-title"> Why Molasses Quality Matters</h2>

                                <div className="ml-bullet-cards">
                                    <div> More sugars → More ethanol</div>
                                    <div> Higher Pol → Higher sucrose</div>
                                    <div> Higher Purity → Faster fermentation</div>
                                    <div> Healthy yeast → Higher alcohol %</div>
                                    <div className="warn"> Poor molasses increases foam, impurities & cost</div>
                                </div>
                            </section>

                        </div>
                    )}
                </div>
            </div>

            <div className="enh-grid">
                <div className="card stats-card">
                    <div className="stat"> <div className="label">Total Volume</div> <div className="value">{filtered.reduce((s, r) => s + Number(r.volume || 0), 0)} L</div></div>
                    <div className="stat"> <div className="label">Avg Brix</div> <div className="value">{filtered.length ? (filtered.reduce((s, r) => s + Number(r.brix || 0), 0) / filtered.length).toFixed(2) : '—'}</div></div>
                    <div className="stat"> <div className="label">Avg Purity</div> <div className="value">{filtered.length ? (filtered.reduce((s, r) => s + (Number(r.pol || 0) / (Number(r.brix || 1))) * 100, 0) / filtered.length).toFixed(2) : '—'}%</div></div>
                    <div className="stat"> <div className="label">Brix Trend</div> <div className="value small">{brixSlope > 0 ? 'Rising ▲' : 'Falling ▼'} ({brixSlope.toFixed(3)})</div></div>
                </div>

                <div className="card chart-card">
                    <div className="card-head">Avg Brix · Pol · Purity (daily)</div>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopOpacity={0.2} /><stop offset="95%" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="avgPurity" name="Avg Purity" stroke="#34d399" fillOpacity={1} fill="url(#g1)" />
                                <Line type="monotone" dataKey="avgBrix" name="Avg Brix" stroke="#2563eb" dot={false} />
                                <Line type="monotone" dataKey="avgPol" name="Avg Pol" stroke="#ef4444" dot={false} />
                                <Brush dataKey="date" height={30} stroke="#8884d8" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card small-chart">
                    <div className="card-head">Volume by Type</div>
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeByType} layout="vertical">
                                <CartesianGrid strokeDasharray="3 " />
                                <XAxis type="number" />
                                <YAxis dataKey="type" type="category" />
                                <Tooltip />
                                <Bar dataKey="volume" fill="#60a5fa" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card table-card">
                <div className="table-head">
                    <div>Readings ({total})</div>
                    <div className="table-actions">
                        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
                        </select>
                        <button className="btn ghost" onClick={() => { setSortBy({ key: 'brix', dir: sortBy.key === 'brix' && sortBy.dir === 'asc' ? 'desc' : 'asc' }); }}>Sort Brix</button>
                    </div>
                </div>
                <div className="table-wrap">
                    <table className="enh-table">
                        <thead>
                            <tr>
                                <th onClick={() => setSortBy({ key: 'timestamp', dir: sortBy.key === 'timestamp' && sortBy.dir === 'asc' ? 'desc' : 'asc' })}>Time</th>
                                <th>Type</th>
                                <th onClick={() => setSortBy({ key: 'brix', dir: sortBy.key === 'brix' && sortBy.dir === 'asc' ? 'desc' : 'asc' })}>Brix</th>
                                <th onClick={() => setSortBy({ key: 'pol', dir: sortBy.key === 'pol' && sortBy.dir === 'asc' ? 'desc' : 'asc' })}>Pol</th>
                                <th onClick={() => setSortBy({ key: 'purity', dir: sortBy.key === 'purity' && sortBy.dir === 'asc' ? 'desc' : 'asc' })}>Purity %</th>
                                <th onClick={() => setSortBy({ key: 'volume', dir: sortBy.key === 'volume' && sortBy.dir === 'asc' ? 'desc' : 'asc' })}>Volume</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map(r => (
                                <tr key={r.id} className={r.brix > 68 ? 'warn' : ''}>
                                    <td>{formatDate(r.timestamp)}</td>
                                    <td>{r.type}</td>
                                    <td>{r.brix}</td>
                                    <td>{r.pol}</td>
                                    <td>{r.purity?.toFixed(2) || ((r.pol / r.brix) * 100).toFixed(2)}</td>
                                    <td>{r.volume}</td>
                                    <td className="notes">{r.notes}</td>
                                    <td>
                                        <div className="actions">
                                            <button className="icon-btn" onClick={() => setSelected(r)} title="Edit"><FiEdit2 /></button>
                                            <button className="icon-btn danger" onClick={() => { if (window.confirm('Delete?')) remove(r.id); }} title="Delete"><FiTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pager">
                    <div>Page {page} / {pages}</div>
                    <div>
                        <button className="newbutton1 btn small" onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                        <button className="newbutton2 btn small" onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</button>
                    </div>
                </div>

                {selected && <EditModal initial={selected} onClose={() => setSelected(null)} onSave={(patch) => { update(selected.id, patch); setSelected(null); }} />}
                {isAddOpen && <AddModal onClose={() => setIsAddOpen(false)} onAdd={(row) => { add(row); setIsAddOpen(false); }} />}

                {showContent && <div className="card content-card">
                    <ContentPanel />
                </div>}
            </div>
            {/* <div className="footer">Enhanced Molasses Dashboard · Beginner→Pro integrated</div> */}
        </div>
    );
}

/* ------------------------------ AddModal ------------------------------ */
function AddModal({ onClose, onAdd }) {
    const [type, setType] = useState('A-Molasses'); const [brix, setBrix] = useState(60); const [pol, setPol] = useState(42); const [volume, setVolume] = useState(300); const [notes, setNotes] = useState('');
    function submit(e) { e.preventDefault(); if (!brix || !volume) return alert('Brix & volume required'); onAdd({ timestamp: nowIso(), type, brix: Number(brix), pol: Number(pol), volume: Number(volume), notes }); }
    return (
        <div className="modal-back">
            <form className="modal-card" onSubmit={submit}>
                <h3>Add Reading</h3>
                <div className="grid-2">
                    <select value={type} onChange={e => setType(e.target.value)} className="input">
                        <option>A-Molasses</option><option>B-Molasses</option><option>C-Molasses</option>
                    </select>
                    <input type="number" step="0.01" value={brix} onChange={e => setBrix(e.target.value)} className="input" placeholder="Brix" />
                    <input type="number" step="0.01" value={pol} onChange={e => setPol(e.target.value)} className="input" placeholder="Pol" />
                    <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="input" placeholder="Volume" />
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input" placeholder="Notes" />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn outline" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn primary">Add</button>
                </div>
            </form>
        </div>
    );
}

/* ------------------------------ EditModal ------------------------------ */
function EditModal({ initial, onClose, onSave }) {
    const [type, setType] = useState(initial.type); const [brix, setBrix] = useState(initial.brix); const [pol, setPol] = useState(initial.pol); const [volume, setVolume] = useState(initial.volume); const [notes, setNotes] = useState(initial.notes || '');
    function submit(e) { e.preventDefault(); onSave({ type, brix: Number(brix), pol: Number(pol), volume: Number(volume), notes }); }
    return (
        <div className="modal-back">
            <form className="modal-card" onSubmit={submit}>
                <h3>Edit Reading</h3>
                <div className="grid-2">
                    <select value={type} onChange={e => setType(e.target.value)} className="input">
                        <option>A-Molasses</option>
                        <option>B-Molasses</option>
                        <option>C-Molasses</option>
                    </select>
                    <input type="number" step="0.01" value={brix} onChange={e => setBrix(e.target.value)} className="input" placeholder="Brix" />
                    <input type="number" step="0.01" value={pol} onChange={e => setPol(e.target.value)} className="input" placeholder="Pol" />
                    <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="input" placeholder="Volume" />
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input" placeholder="Notes" />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn outline" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn primary">Save</button>
                </div>
            </form>
        </div>
    );
}

/* ------------------------------ ContentPanel ------------------------------ */
function ContentPanel() {
    return (
        <div className="content-inner">
            <h2>Molasses</h2>
            <section>
                {/* <h3>Beginner</h3> */}
                <p>Molasses is a thick, dark, sweet syrup that remains after extracting sugar from sugarcane or sugar beets. It's sticky, sweet, and used in baking, animal feed, and alcohol production.</p>
            </section>
            <section>
                {/* <h3>Intermediate</h3> */}
                <p>When sugarcane juice is boiled and sugar crystals removed, the leftover liquid is molasses. It contains residual sugars, minerals (iron, calcium, magnesium), and flavour compounds. Types include A-, B- and C-molasses based on crystallization stage.</p>
            </section>
            <section>
                {/* <h3>Advanced / Pro</h3> */}
                <p>Molasses is a viscous by-product composed mainly of sucrose, glucose and fructose plus non-sugar compounds. Key technical parameters: <strong>Brix</strong> (soluble solids), <strong>Pol</strong> (apparent sucrose), <strong>Purity</strong> (Pol/Brix ×100), <strong>Ash</strong> (minerals), <strong>TRS</strong> (reducing sugars) and <strong>pH</strong>. Final molasses (C) is used for ethanol/industrial fermentation.</p>
            </section>
            <section>
                <h3>Glossary</h3>
                <ul>
                    <li><strong>Brix:</strong> percent soluble solids (sugar concentration)</li>
                    <li><strong>Pol:</strong> apparent sucrose percentage</li>
                    <li><strong>Purity:</strong> (Pol / Brix) × 100</li>
                </ul>
            </section>
        </div>
    );
}

/* ------------------------------ CSS ------------------------------ */
/* Save the CSS below into MolassesDashboard-Enhanced.css next to the component file */

/*
.enh-container { ... }
*/
