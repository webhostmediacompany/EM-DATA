import "./Dashboard.css";
import { FaIndustry, FaTint, FaLeaf, FaTruck, FaGlobeAsia } from "react-icons/fa";

export default function Dashboard() {
    return (
        <div className="dashboard-container">

            {/* HEADER SECTION */}
            <div className="dashboard-header">
                <h1>Real-Time Ethanol Production Dashboard</h1>
                <p>
                    Track ethanol production, feedstock usage, water consumption, emissions,
                    and supply chain metrics across regions — enabling transparency, optimization
                    and sustainability.
                </p>
            </div>

            {/* KPI CARDS */}
            <div className="dashboard-cards">

                <div className="dash-card">
                    <FaIndustry className="dash-icon" />
                    <h3>Ethanol Production</h3>
                    <p className="dash-value">82,450 L/day</p>
                    <span className="dash-trend positive">+4.6% ↑</span>
                </div>

                <div className="dash-card">
                    <FaLeaf className="dash-icon" />
                    <h3>Feedstock Usage</h3>
                    <p className="dash-value">65,120 kg</p>
                    <span className="dash-trend negative">-2.1% ↓</span>
                </div>

                <div className="dash-card">
                    <FaTint className="dash-icon" />
                    <h3>Water Consumption</h3>
                    <p className="dash-value">12,800 L</p>
                    <span className="dash-trend positive">+1.3% ↑</span>
                </div>

                <div className="dash-card">
                    <FaGlobeAsia className="dash-icon" />
                    <h3>Emissions</h3>
                    <p className="dash-value">740 kg CO₂e</p>
                    <span className="dash-trend negative">-3.8% ↓</span>
                </div>

                <div className="dash-card">
                    <FaTruck className="dash-icon" />
                    <h3>Supply Chain Efficiency</h3>
                    <p className="dash-value">92.4%</p>
                    <span className="dash-trend positive">+2.7% ↑</span>
                </div>

            </div>

            {/* REGION SECTION */}
            <div className="region-section">
                <h2>Region-Wise Performance</h2>
                <p className="region-text">
                    Compare ethanol production and sustainability indicators across different
                    geographic regions.
                </p>

                {/* Region Cards */}
                <div className="region-grid">
                    <div className="region-card">
                        <h4>North Region</h4>
                        <p>Production: <strong>22,400 L/day</strong></p>
                        <p>Emissions: 210 kg</p>
                    </div>

                    <div className="region-card">
                        <h4>South Region</h4>
                        <p>Production: <strong>19,850 L/day</strong></p>
                        <p>Emissions: 185 kg</p>
                    </div>

                    <div className="region-card">
                        <h4>East Region</h4>
                        <p>Production: <strong>20,700 L/day</strong></p>
                        <p>Emissions: 175 kg</p>
                    </div>

                    <div className="region-card">
                        <h4>West Region</h4>
                        <p>Production: <strong>19,500 L/day</strong></p>
                        <p>Emissions: 170 kg</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
