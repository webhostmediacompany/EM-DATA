// EthanolMegaDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip,
    BarChart, Bar,
    PieChart, Pie, Cell
} from "recharts";
import "./EthanolMegaDashboard.css";

export default function EthanolMegaDashboard() {
    // ---------- Slider ----------
    const sliderImages = useMemo(
        () => [
            {
                src:
                    "https://i.pinimg.com/1200x/e2/69/f6/e269f6a6818738fe5b9635a8eff0825f.jpg",
                alt: "Sugarcane field"
            },
            {
                src:
                    "https://images.fineartamerica.com/images-medium-large-5/1-sugar-cane-factory-jonas-hamersreportersscience-photo-library.jpg",
                alt: "Ethanol plant"
            },
            {
                src:
                    "https://i.pinimg.com/1200x/4f/e5/76/4fe5764e250245d247e0ac3a24685fce.jpg",
                alt: "Distillation columns"
            }
        ],
        []
    );
    const [slideIdx, setSlideIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setSlideIdx((s) => (s + 1) % sliderImages.length), 4500);
        return () => clearInterval(t);
    }, [sliderImages.length]);

    // ---------- Products & Cart ----------
    const initialProducts = useMemo(
        () => [
            { id: "E100", name: "E100 Fuel Ethanol", volL: 1000, pricePerKL: 62000, desc: "Fuel-grade ethanol for transport & industry" },
            { id: "E85", name: "E85 Blend", volL: 1000, pricePerKL: 58000, desc: "High-ethanol blend for flex-fuel" },
            { id: "MOL", name: "Molasses Feedstock", volL: 5000, pricePerKL: 31000, desc: "Fermentation feedstock" },
            { id: "BAG", name: "Bagasse Pellets", volKg: 1000, pricePerKL: 4500, desc: "Biomass for cogeneration" }
        ],
        []
    );
    const [cart, setCart] = useState([]);
    function addToCart(p) { setCart((c) => [...c, p]); }
    function exportCartCSV() {
        if (!cart.length) return alert("Cart is empty");
        const rows = [["id", "name", "vol", "pricePerKL", "desc"], ...cart.map(p => [p.id, p.name, p.volL ?? p.volKg ?? "", p.pricePerKL ?? "", p.desc])];
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "ethanol_cart.csv"; a.click(); URL.revokeObjectURL(url);
    }

    // ---------- Realtime Chart (line) ----------
    const baseRevenue = 420000;
    const initLine = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({ name: `${i - 11}s`, revenue: Math.round(baseRevenue + Math.random() * 200000) })), []);
    const [lineData, setLineData] = useState(initLine);

    useEffect(() => {
        const iv = setInterval(() => {
            setLineData((prev) => {
                const last = prev[prev.length - 1]?.revenue ?? baseRevenue;
                const delta = Math.round((Math.random() - 0.45) * 150000);
                const nextVal = Math.max(80000, last + delta);
                const next = { name: `${prev.length - 11}s`, revenue: nextVal };
                const arr = [...prev.slice(-11), next].map((p, i) => ({ ...p, name: `${i - 11}s` }));
                return arr;
            });
        }, 3500);
        return () => clearInterval(iv);
    }, []);

    // ---------- Monthly Production (bar) & Feedstock (pie) ----------
    const monthly = useMemo(() => [
        { name: "Jan", value: 1.1 }, { name: "Feb", value: 1.6 }, { name: "Mar", value: 2.2 },
        { name: "Apr", value: 1.8 }, { name: "May", value: 2.6 }, { name: "Jun", value: 2.0 }
    ], []);
    const feedstock = useMemo(() => [
        { name: "Molasses", value: 55 },
        { name: "Cane Juice", value: 30 },
        { name: "B-Heavy", value: 15 }
    ], []);

    // ---------- Stock Ticker (simulated) ----------
    const [stocks, setStocks] = useState([
        { ticker: "SUGR.NS", name: "SugarCorp", price: 428.5, change: 0.8 },
        { ticker: "ETHB", name: "EthanolBev", price: 12.34, change: -0.3 },
        { ticker: "BIOF", name: "BioFuelCo", price: 34.12, change: 1.1 }
    ]);
    useEffect(() => {
        const iv = setInterval(() => {
            setStocks((s) => s.map(st => {
                const d = +(Math.random() - 0.5) * 2;
                return { ...st, price: +(st.price + d).toFixed(2), change: +d.toFixed(2) };
            }));
        }, 3200);
        return () => clearInterval(iv);
    }, []);

    // ---------- Telemetry (IoT, SDE/RDE) ----------
    const [telemetry, setTelemetry] = useState({ temp: 78.2, pressure: 2.8, level: 65 });
    useEffect(() => {
        const iv = setInterval(() => {
            setTelemetry(t => ({
                temp: +(t.temp + (Math.random() - 0.5) * 1.8).toFixed(1),
                pressure: +(t.pressure + (Math.random() - 0.5) * 0.12).toFixed(2),
                level: Math.max(10, Math.min(99, t.level + Math.round((Math.random() - 0.5) * 6)))
            }));
        }, 3000);
        return () => clearInterval(iv);
    }, []);

    // ---------- News (seeded) ----------
    const [news] = useState([
        { title: "Govt updates ethanol procurement window for 2025", source: "Policy" },
        { title: "Local mills report higher cane yields this season", source: "Agriculture" },
        { title: "International demand spike: blending targets push prices up", source: "Markets" }
    ]);

    // ---------- Marketing Tips ----------
    const marketingTips = useMemo(() => [
        "Offer 3% discount for first-time bulk orders (>= 10KL).",
        "Bundle bagasse + ethanol for energy buyers.",
        "Promote 'locally sourced' & 'sustainably produced' claims.",
    ], []);

    // ---------- Exports / snapshot ----------
    function exportSnapshotJSON() {
        const snapshot = {
            ts: new Date().toISOString(),
            telemetry,
            latestRealtime: lineData.slice(-6),
            carts: cartSummary(),
            stocks
        };
        const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "ethanol_snapshot.json"; a.click(); URL.revokeObjectURL(url);
    }

    function cartSummary() {
        const grouped = {};
        for (const p of cart) {
            grouped[p.id] = (grouped[p.id] || 0) + 1;
        }
        return Object.entries(grouped).map(([id, qty]) => ({ id, qty }));
    }

    // ---------- Helpers ----------
    const fmtCurrency = (n) => {
        if (n >= 1e6) return `₹${(n / 1e6).toFixed(2)}M`;
        if (n >= 1e3) return `₹${Math.round(n / 1000)}k`;
        return `₹${n}`;
    };

    const pieColors = ["#2563eb", "#10b981", "#60a5fa"];

    return (
        <div className="emd-root">
            {/* HERO */}
            <section className="emd-hero">
                <div className="emd-slider">
                    <img src={sliderImages[slideIdx].src} alt={sliderImages[slideIdx].alt} className="emd-slide-img" />
                    <div className="emd-slide-caption">
                        <h2>Growing Ethanol — Smart Analytics</h2>
                        <p>IoT-driven production insights • Market signals • Product catalog</p>
                    </div>

                    <div className="emd-slider-controls">
                        <button onClick={() => setSlideIdx(s => (s - 1 + sliderImages.length) % sliderImages.length)}>‹</button>
                        <div className="emd-dots">
                            {sliderImages.map((_, i) => <button key={i} className={i === slideIdx ? "active" : ""} onClick={() => setSlideIdx(i)} />)}
                        </div>
                        <button onClick={() => setSlideIdx(s => (s + 1) % sliderImages.length)}>›</button>
                    </div>
                </div>

                <aside className="emd-quick">
                    <div className="quick-card">
                        <h4>Realtime Revenue (rolling)</h4>
                        <div className="big">{fmtCurrency(lineData.reduce((a, b) => a + b.revenue, 0))}</div>
                        <div className="muted">Live ticks every ~3–4s</div>
                    </div>

                    <div className="quick-card">
                        <h4>Telemetry</h4>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 800 }}>{telemetry.temp}°C</div>
                                <div className="muted">Temp</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 800 }}>{telemetry.pressure} bar</div>
                                <div className="muted">Pressure</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 800 }}>{telemetry.level}%</div>
                                <div className="muted">Tank</div>
                            </div>
                        </div>
                    </div>

                    <div className="quick-card">
                        <h4>Market Ticker</h4>
                        <div className="stock-ticker" style={{ marginTop: 8 }}>
                            {stocks.map(s => (
                                <div key={s.ticker} className="stk">
                                    <strong style={{ marginRight: 8 }}>{s.ticker}</strong>
                                    <span>{s.price}</span>
                                    <span style={{ marginLeft: 8 }} className={s.change >= 0 ? "up" : "dn"}>{s.change >= 0 ? `+${s.change}` : s.change}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </section>

            {/* MAIN GRID */}
            <section className="emd-grid">

                {/* LEFT COLUMN */}
                <div className="emd-col">
                    {/* PRODUCTS */}
                    <div className="panel">
                        <h3 class='h3head'>Products & Pricing</h3>
                        <div className="products">
                            {initialProducts.map(p => (
                                <div className="product-card" key={p.id}>
                                    <div className="product-head">
                                        <div className="product-name">{p.name}</div>
                                        <div className="product-price">₹{(p.pricePerKL ?? 0).toLocaleString()}</div>
                                    </div>
                                    <div className="product-desc">{p.desc}</div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                        <button class="descbutton" onClick={() => addToCart(p)}>Add to Cart</button>
                                        <button class="buttondetail" className="ghost" onClick={() => alert(`${p.name}\n${p.desc}`)}>Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-panel" style={{ marginTop: 14 }}>
                            <div>
                                <strong>Cart:</strong> {cart.length} item(s)
                            </div>
                            <div className="cart-actions">
                                <button class='product-desc-button' onClick={exportCartCSV} disabled={!cart.length}>Export CSV</button>
                                <button class='buttonclear' className="ghost" onClick={() => setCart([])}>Clear</button>
                            </div>
                        </div>
                    </div>

                    {/* MARKETING & IOT */}
                    <div className="panel">
                        <h3 class='h3head'>Marketing & Pre-Condition Signals</h3>
                        <ul style={{ marginTop: 8 }}>
                            <li>Watch ESY procurement windows and blending policy announcements.</li>
                            <li>Offer quick delivery during demand peaks — use RDE alerts to trigger promos.</li>
                            <li>Bundle bagasse for energy buyers to increase conversion.</li>
                        </ul>

                        <h4 style={{ marginTop: 12 }}>Growth Tips</h4>
                        <ol style={{ marginTop: 8 }}>
                            {marketingTips.map((t, i) => <li key={i}>{t}</li>)}
                        </ol>
                    </div>

                    {/* FLOWCHART */}
                    <div className="panel">
                        <h3 class='h3head'>Production Flow</h3>
                        <svg className="flow-svg" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                                    <path d="M0,0 L8,4 L0,8 z" fill="#2563eb"></path>
                                </marker>
                            </defs>
                            <rect x="20" y="20" width="150" height="60" rx="8" fill="#fff" stroke="#e5e7eb"></rect>
                            <text x="95" y="55" textAnchor="middle" fill="#1f2937">Farming</text>

                            <rect x="210" y="10" width="200" height="90" rx="8" fill="#fff" stroke="#e5e7eb"></rect>
                            <text x="310" y="55" textAnchor="middle" fill="#1f2937">Crushing & Fermentation</text>

                            <rect x="440" y="20" width="150" height="60" rx="8" fill="#fff" stroke="#e5e7eb"></rect>
                            <text x="515" y="55" textAnchor="middle" fill="#1f2937">Distillation</text>

                            <rect x="610" y="20" width="180" height="60" rx="8" fill="#fff" stroke="#e5e7eb"></rect>
                            <text x="700" y="55" textAnchor="middle" fill="#1f2937">Storage & Logistics</text>

                            <line x1="170" y1="50" x2="210" y2="50" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arr)" />
                            <line x1="410" y1="50" x2="440" y2="50" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arr)" />
                            <line x1="590" y1="50" x2="610" y2="50" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arr)" />
                        </svg>
                        <p className="muted" style={{ marginTop: 8 }}>SDE aggregates sensor data at the gateway; RDE performs edge analytics and pushes alerts for demand spikes or anomalies.</p>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="emd-col">
                    {/* Charts */}
                    <div className="panel charts-panel">
                        <div>
                            <h3 class='h3head'>Realtime Revenue</h3>
                            <div style={{ width: "100%", height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData}>
                                        <XAxis dataKey="name" stroke="#64748b" />
                                        <YAxis stroke="#64748b" tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
                                        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                        <Line dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <h3 class='h3head' style={{ marginTop: 8 }}>Monthly Production (ML)</h3>
                            <div style={{ width: "100%", height: 160 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthly}>
                                        <XAxis dataKey="name" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <h4 style={{ marginTop: 8 }}>Feedstock Distribution</h4>
                            <div style={{ width: "100%", height: 120 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={feedstock} innerRadius={30} outerRadius={50} dataKey="value" nameKey="name">
                                            {feedstock.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* News */}
                    <div className="panel news-list">
                        <h3 class='h3head'>Daily News & Market Conditions</h3>
                        {news.map((n, i) => (
                            <div key={i} className="news-item">
                                <div>
                                    <div className="news-title">{n.title}</div>
                                    <div className="muted" style={{ fontSize: 12 }}>{n.source}</div>
                                </div>
                                <div className="news-actions">
                                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Open article (placeholder)"); }}>Read</a>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 12 }}>
                            <h4>Market pre-conditions</h4>
                            <p className="muted">Monitor procurement pricing, blending targets, and seasonal supply. Use RDE signals for time-limited promos to buyers.</p>
                        </div>
                    </div>

                    {/* Wave + Actions */}
                    <div className="panel wave-panel">
                        <div className="wave-bridge" style={{ alignItems: "stretch" }}>
                            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: "65%" }}>
                                <path className="wave-fill" d="M0,40 C200,120 400,0 600,60 C800,120 1000,20 1200,70 L1200,120 L0,120 Z" />
                            </svg>

                            <div className="wave-info">
                                <h3 class='h3head'>Realtime Demand Wave</h3>
                                <p className="muted">Wave visual highlights demand peaks; schedule promos and allocate inventory to match wave peaks.</p>
                                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                                    <button onClick={exportSnapshotJSON}>Export Snapshot</button>
                                    <button className="ghost" onClick={() => alert("Schedule promo (simulated)")}>Schedule Promo</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
