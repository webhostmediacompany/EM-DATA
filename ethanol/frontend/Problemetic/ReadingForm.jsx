// src/App.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchReadings,
  createReading,
  updateReading,
  deleteReading,
} from "./api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import useReadingsSocket from "./useReadingsSocket";
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  printTable,
} from "./exportUtils";
import "./ReadingForm.css";
// snapshot import
// import html2canvas from "html2canvas";
// Recharts imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// // snapshot section
// const exportSnapshotJSON = async () => {
//   try {
//     const section = document.querySelector(".charts-section");

//     if (!section) {
//       console.error("Section not found");
//       return;
//     }

//     // Capture screenshot of entire section
//     const canvas = await html2canvas(section, { scale: 2 });
//     const image = canvas.toDataURL("image/png");

//     // Export as PDF (Featureistic!)
//     const pdf = new jsPDF("p", "mm", "a4");
//     const width = pdf.internal.pageSize.getWidth();
//     const height = (canvas.height * width) / canvas.width;

//     pdf.addImage(image, "PNG", 0, 10, width, height);
//     pdf.save("dashboard_snapshot.pdf");

//     // Export metadata as JSON
//     const metadata = {
//       period,
//       timestamp: new Date(),
//       message: "Snapshot taken successfully",
//     };

//     const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
//     const jsonUrl = URL.createObjectURL(jsonBlob);

//     const link = document.createElement("a");
//     link.href = jsonUrl;
//     link.download = "snapshot_metadata.json";
//     link.click();

//     console.log("Snapshot complete");

//   } catch (err) {
//     console.error("Snapshot failed:", err);
//   }
// };

// ========================= CLEAN HD SNAPSHOT =========================
const exportSnapshotJSON = async (period) => {
  try {
    const section = document.querySelector(".charts-section");

    if (!section) {
      console.error("Section not found");
      return;
    }

    // Disable animations to avoid blur
    section.style.transition = "none";
    section.style.animation = "none";

    // Timestamp (clean)
    const now = new Date();
    const timestampString = now.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
    });

    // =======================
    // IMPORTANT:
    // No overlay, no badge, no UI interference
    // =======================

    await new Promise(res => setTimeout(res, 100));

    // Capture screenshot (Ultra HD)
    const canvas = await html2canvas(section, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
    });

    const image = canvas.toDataURL("image/png");

    // PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    // Clean header
    pdf.setFontSize(14);
    pdf.text("Molasses Dashboard", 10, 10);

    pdf.setFontSize(11);
    pdf.text(`Timestamp: ${timestampString}`, 10, 17);

    // Add captured image
    pdf.addImage(image, "PNG", 0, 25, width, height);
    pdf.save(`dashboard_snapshot_${now.getTime()}.pdf`);

    // Metadata JSON
    const metadata = {
      period,
      timestamp: timestampString,
      snapshot_taken: true,
      captured_at: now,
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapshot_metadata_${now.getTime()}.json`;
    a.click();

    console.log("Snapshot completed successfully.");

  } catch (err) {
    console.error("Snapshot failed:", err);
  }
};

/* -----------------------------
   Utility helpers
----------------------------- */

// format date label by period
function formatLabel(date, period) {
  const d = new Date(date);
  if (period === "day") return d.toLocaleTimeString([], { hour: "2-digit" });
  if (period === "week") {
    // Week label = "Mon 14"
    return d.toLocaleDateString([], { weekday: "short", day: "numeric" });
  }
  if (period === "month") return d.toLocaleDateString([], { day: "numeric", month: "short" });
  if (period === "year") return d.toLocaleDateString([], { month: "short", year: "numeric" });
  return d.toLocaleString();
}

// bucket readings by period (day, week, month, year)
function aggregate(readings = [], period = "day") {
  // create key function based on period
  const map = new Map();

  for (const r of readings) {
    const ts = r.timestamp ? new Date(r.timestamp) : new Date();
    let key;
    if (period === "day") {
      // group by hour - label like "14:00"
      key = `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}-${ts.getHours()}`;
    } else if (period === "week") {
      // group by day
      const weekDay = ts.getDay(); // 0-6
      const monday = new Date(ts);
      // compute Monday date of this week for consistent grouping
      monday.setDate(ts.getDate() - ((weekDay + 6) % 7));
      key = `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}-${ts.getDate()}`;
    } else if (period === "month") {
      key = `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}`; // daily groups inside month
    } else {
      // year
      key = `${ts.getFullYear()}-${ts.getMonth()}`;
    }

    if (!map.has(key)) map.set(key, { count: 0, brix: 0, pol: 0, purity: 0, volume: 0, sourceCounts: {} });
    const entry = map.get(key);
    const n = 1;
    entry.count += n;
    if (typeof r.brix === "number") entry.brix += r.brix;
    if (typeof r.pol === "number") entry.pol += r.pol;
    if (typeof r.purity === "number") entry.purity += r.purity;
    if (typeof r.volume === "number") entry.volume += r.volume;
    const src = r.source || r.type || "unknown";
    entry.sourceCounts[src] = (entry.sourceCounts[src] || 0) + 1;
    map.set(key, entry);
  }

  // convert map to sorted array
  const arr = Array.from(map.entries()).map(([key, val]) => {
    // parse approximate timestamp for label
    // we stored parts earlier — for simplicity just take first reading timestamp for label fallback
    return {
      key,
      count: val.count,
      avgBrix: val.count ? val.brix / val.count : null,
      avgPol: val.count ? val.pol / val.count : null,
      avgPurity: val.count ? val.purity / val.count : null,
      totalVolume: val.volume,
      sources: val.sourceCounts,
    };
  });

  // Try to sort by key by extracting date parts - coarse but consistent with creation order
  arr.sort((a, b) => {
    // attempt to extract a date-like from key tokens
    const pa = a.key.split("-").map((x) => parseInt(x, 10));
    const pb = b.key.split("-").map((x) => parseInt(x, 10));
    for (let i = 0; i < Math.min(pa.length, pb.length); i++) {
      if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
  });

  // build final chart array with labels
  const chartData = arr.map((item) => {
    // derive label from key pieces - approximate
    const parts = item.key.split("-");
    let label = item.key;
    try {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const hour = parts[3] ? parseInt(parts[3], 10) : null;
      const date = new Date(y, m, d, hour || 0);
      label = date.toLocaleString();
    } catch (e) {
      label = item.key;
    }
    return {
      label,
      ...item,
    };
  });

  return chartData;
}

// histogram bins for brix
function histogramBins(readings = [], binCount = 8) {
  const values = readings.map((r) => r.brix).filter((v) => typeof v === "number");
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / binCount || 1;
  const bins = Array.from({ length: binCount }, (_, i) => ({ bin: i, x0: min + i * binSize, x1: min + (i + 1) * binSize, count: 0 }));
  for (const v of values) {
    let idx = Math.floor((v - min) / binSize);
    if (idx < 0) idx = 0;
    if (idx >= binCount) idx = binCount - 1;
    bins[idx].count++;
  }
  return bins.map((b) => ({ name: `${b.x0.toFixed(1)}-${b.x1.toFixed(1)}`, count: b.count }));
}

/* -----------------------------
   Charts Panel component
----------------------------- */
function ChartsPanel({ readings }) {
  const [period, setPeriod] = useState("month"); // day, week, month, year
  const [showHeatmapUnits, setShowHeatmapUnits] = useState("weekday"); // simple toggle for heatmap axis

  // aggregated data memoized
  const agg = useMemo(() => aggregate(readings, period), [readings, period]);
  const histogram = useMemo(() => histogramBins(readings, 10), [readings]);
  const pieSources = useMemo(() => {
    const counts = {};
    for (const r of readings) {
      const s = r.source || r.type || "unknown";
      counts[s] = (counts[s] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [readings]);

  // prepare data for stacked area: brix/pol/purity over time
  const stackedData = agg.map((a, i) => ({
    name: `P${i + 1}`,
    brix: a.avgBrix ?? 0,
    pol: a.avgPol ?? 0,
    purity: a.avgPurity ?? 0,
    volume: a.totalVolume ?? 0,
  }));

  // line data: average brix
  const lineData = agg.map((a, i) => ({ name: `P${i + 1}`, avgBrix: a.avgBrix ?? 0, avgPol: a.avgPol ?? 0 }));

  // scatter / bubble: brix vs pol, size = volume
  const scatterData = readings
    .filter((r) => typeof r.brix === "number" && typeof r.pol === "number")
    .map((r) => ({ x: r.brix, y: r.pol, z: r.volume || 1, label: r.source }));

  // radar: averages
  const radarData = [
    { subject: "Brix", A: readings.reduce((s, r) => s + (r.brix || 0), 0) / Math.max(1, readings.length) },
    { subject: "Pol", A: readings.reduce((s, r) => s + (r.pol || 0), 0) / Math.max(1, readings.length) },
    { subject: "Purity", A: readings.reduce((s, r) => s + (r.purity || 0), 0) / Math.max(1, readings.length) },
    { subject: "Volume", A: readings.reduce((s, r) => s + (r.volume || 0), 0) / Math.max(1, readings.length) },
    { subject: "Count", A: readings.length },
  ];

  // simple heatmap: weekday (0..6) vs hourly average purity
  const heatmapMatrix = useMemo(() => {
    // rows: weekday 0..6, cols: hours 0..23
    const rows = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ sum: 0, count: 0 })));
    for (const r of readings) {
      if (!r.timestamp) continue;
      const d = new Date(r.timestamp);
      const wd = d.getDay();
      const hr = d.getHours();
      if (typeof r.purity === "number") {
        rows[wd][hr].sum += r.purity;
        rows[wd][hr].count += 1;
      }
    }
    return rows.map((row) => row.map((cell) => (cell.count ? cell.sum / cell.count : 0)));
  }, [readings]);

  const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#e29d6bff"];

  return (
    <section className="rf-section charts-section" >
      <div className="charts-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h2 className="section-title" class="section-title">Data Analytics</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rf-input" style={{ minWidth: 120 }}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          <button className="rf-btn" onClick={() => exportSnapshotJSON(period)}>
            Snapshot
          </button>
        </div>
      </div>
    

      <div className="charts-grid">
        {/* LINE CHART - Avg Brix */}
        <div className="chart-card">
          <h4>Avg Brix / Avg Pol</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgBrix" stroke="#4f46e5" dot={false} />
              <Line type="monotone" dataKey="avgPol" stroke="#06b6d4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* STACKED AREA - Brix/Pol/Purity */}
        <div className="chart-card">
          <h4>Stacked Area (Brix / Pol / Purity)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stackedData}>
              <defs>
                <linearGradient id="colorBrix" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorPol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorPurity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="brix" stackId="1" stroke="#4f46e5" fill="url(#colorBrix)" />
              <Area type="monotone" dataKey="pol" stackId="1" stroke="#06b6d4" fill="url(#colorPol)" />
              <Area type="monotone" dataKey="purity" stackId="1" stroke="#10b981" fill="url(#colorPurity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RADAR */}
        <div className="chart-card">
          <h4>Radar (Overall averages)</h4>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, Math.max(...radarData.map((d) => d.A)) || 10]} />
              <Radar name="Avg" dataKey="A" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* SCATTER / BUBBLE */}
        <div className="chart-card">
          <h4>Bubble Chart (Brix vs Pol, size = Volume)</h4>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Brix" />
              <YAxis type="number" dataKey="y" name="Pol" />
              <ZAxis dataKey="z" range={[50, 800]} name="Volume" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Readings" data={scatterData} fill="#4f46e5" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART - volume by period */}
        <div className="chart-card">
          <h4>Volume by Period</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stackedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="volume" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE chart for source distribution */}
        <div className="chart-card">
          <h4>Source Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieSources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieSources.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* HISTOGRAM (Brix distribution) */}
        <div className="chart-card">
          <h4>Brix Distribution (Histogram)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HEATMAP (weekday vs hour purity) */}
        <div className="chart-card" style={{ padding: 12 }}>
          <h4>Heatmap — Avg Purity (weekday × hour)</h4>
          <div style={{ overflowX: "auto" }}>
            <table className="heatmap-table" style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ padding: 6 }}>Weekday / Hour</th>
                  {Array.from({ length: 24 }, (_, hr) => (
                    <th style={{ padding: 6, fontSize: 11 }} key={hr}>{hr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapMatrix.map((row, wd) => (
                  <tr key={wd}>
                    <td style={{ padding: 6, fontWeight: 600 }}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][wd]}</td>
                    {row.map((val, hr) => {
                      // map val to color intensity
                      const v = Math.round(val); // purity roughly
                      const intensity = Math.min(1, v / 100);
                      const bg = `rgba(79,70,229, ${intensity})`;
                      const textCol = intensity > 0.5 ? "#ffffff" : "#111111";
                      return <td key={hr} className="heatmap-cell" style={{ padding: 4, background: bg, "--cell-color": textCol, color: textCol, textAlign: "center", fontSize: 12 }}>{val ? val.toFixed(1) : "-"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -----------------------------
   ReadingForm (kept same)
----------------------------- */
function ReadingForm({ onSubmit, initial = {}, onCancel }) {
  const [form, setForm] = useState({
    source: initial.source || "molasses",
    brix: initial.brix ?? "",
    pol: initial.pol ?? "",
    purity: initial.purity ?? "",
    volume: initial.volume ?? "",
    notes: initial.notes || "",
  });

  useEffect(() => {
    if (initial) setForm((f) => ({ ...f, ...initial }));
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      brix: form.brix ? parseFloat(form.brix) : null,
      pol: form.pol ? parseFloat(form.pol) : null,
      purity: form.purity ? parseFloat(form.purity) : null,
      volume: form.volume ? parseFloat(form.volume) : null,
    });
    if (!initial.id) {
      setForm({
        source: "molasses",
        brix: "",
        pol: "",
        purity: "",
        volume: "",
        notes: "",
      });
    }
  };

  return (
    // <form className="rf-form" onSubmit={submit}>
    //   <select className="rf-input" name="source" value={form.source} onChange={handleChange}>
    //     <option value="molasses">Molasses</option>
    //     <option value="ethanol">Ethanol</option>
    //     <option value="sensor">Sensor</option>
    //   </select>

    //   <input className="rf-input" name="brix" value={form.brix} onChange={handleChange} placeholder="Brix" />
    //   <input className="rf-input" name="pol" value={form.pol} onChange={handleChange} placeholder="Pol" />
    //   <input className="rf-input" name="purity" value={form.purity} onChange={handleChange} placeholder="Purity" />
    //   <input className="rf-input" name="volume" value={form.volume} onChange={handleChange} placeholder="Volume" />
    //   <input className="rf-input" name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />

    //   <div className="rf-actions">
    //     <button className="rf-btn primary" type="submit">Save</button>
    //     {onCancel && <button className="rf-btn danger" type="button" onClick={onCancel}>Cancel</button>}
    //   </div>
    // </form>
    <form className="rf-form enhanced" onSubmit={submit}>
      {/* Row 1 */}
      <div className="rf-row">
        <select className="rf-input modern" name="source" class="DropdownOpt" value={form.source} onChange={handleChange}>
          <option value="molasses">Molasses</option>
          <option value="ethanol">Ethanol</option>
          {/* <option value="sensor">Sensor</option> */}
        </select>
      </div>

      {/* Row 2 */}
      <div className="rf-row">
        <input className="rf-input modern" name="brix" value={form.brix} onChange={handleChange} placeholder="Brix" />
        <input className="rf-input modern" name="pol" value={form.pol} onChange={handleChange} placeholder="Pol" />
      </div>

      {/* Row 3 */}
      <div className="rf-row">
        <input className="rf-input modern" name="purity" value={form.purity} onChange={handleChange} placeholder="Purity" />
        <input className="rf-input modern" name="volume" value={form.volume} onChange={handleChange} placeholder="Volume" />
      </div>

      {/* Notes full width */}
      <div className="rf-row full ">
        <input className="rf-input modern" name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
      </div>

      {/* Action buttons */}
      <div className="rf-actions">
        <button className="rf-btn primary glow" type="submit">Save</button>
        {onCancel && (
          <button className="rf-btn danger soft" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>

  );
}

/* -----------------------------
   Main App (keeps your CRUD)
----------------------------- */
export default function App() {
  const [readings, setReadings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Load readings from API
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReadings();
      setReadings(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // WebSocket updates
  useReadingsSocket((payload) => {
    if (payload.event === 'created')
      setReadings(r => [payload.data, ...r]);

    if (payload.event === 'updated')
      setReadings(r => r.map(x => x.id === payload.data.id ? payload.data : x));

    if (payload.event === 'deleted')
      setReadings(r => r.filter(x => x.id !== payload.data.id));
  });

  // Create reading
  async function handleCreate(payload) {
    try {
      const newReading = await createReading(payload);
      setReadings(r => [newReading, ...r]);
    } catch {
      alert("Create failed");
    }
  }

  // Update reading
  async function handleUpdate(id, payload) {
    try {
      const updatedReading = await updateReading(id, payload);
      setReadings(r => r.map(x => x.id === id ? updatedReading : x));
      setEditing(null);
    } catch {
      alert("Update failed");
    }
  }

  // Delete reading
  async function handleDelete(id) {
    if (!confirm("Delete this reading?")) return;
    try {
      await deleteReading(id);
      setReadings(r => r.filter(x => x.id !== id));
    } catch {
      alert("Delete failed");
    }
  }

  // Filter and paginate
  const filtered = readings.filter(r =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setPage(1); // reset to first page when search changes
  }, [search]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rf-container">
      <h1 className="rf-title">Realtime Ethanol & Molasses Production Dashboard</h1>
      {/* Charts Panel */}
      <ChartsPanel readings={readings} />

      <section className="rf-section">
        <h2>Add New Reading</h2>
        <ReadingForm onSubmit={handleCreate} />
      </section>

      <section className="rf-section">
        <div className="dashboard-toolbar">
          <input
            className="search-box"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="export-buttons">
            <button onClick={() => exportToExcel(filtered)} className="rf-btn">Excel</button>
            <button onClick={() => exportToCSV(filtered)} className="rf-btn">CSV</button>
            <button onClick={() => exportToPDF(filtered)} className="rf-btn">PDF</button>
            <button onClick={printTable} className="rf-btn">Print</button>
          </div>
        </div>

        <div className="rf-table-wrapper">
          <table className="rf-table" id="data-table">
            <thead>
              <tr>
                <th>Time</th><th>Source</th><th>Brix</th>
                <th>Pol</th><th>Purity</th><th>Volume</th><th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td>{r.source}</td>
                  <td>{r.brix}</td>
                  <td>{r.pol}</td>
                  <td>{r.purity}</td>
                  <td>{r.volume}</td>
                  <td>
                    <button className="rf-btn small" onClick={() => setEditing(r)}>Edit</button>
                    <button className="rf-btn small danger" onClick={() => handleDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr><td colSpan={7}>No results</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          {Array.from({ length: Math.ceil(filtered.length / pageSize) }, (_, i) => (
            <button
              key={i}
              className={page === i + 1 ? "page-btn active" : "page-btn"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>

      {editing && (
        <div className="rf-edit-card">
          <h3>Edit Reading</h3>
          <ReadingForm
            initial={editing}
            onSubmit={(payload) => handleUpdate(editing.id, payload)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}
