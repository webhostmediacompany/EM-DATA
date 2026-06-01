import "./Molasses.css";

export default function Molasses() {
    return (
        <section className="molasses-container" id="molasses">
            <div className="molasses-wrapper">

                {/* Title */}
                <h2 className="molasses-title">Real-Time Sugarcane Molasses Dashboard</h2>
                <p className="molasses-subtext">
                    Monitor molasses production, quality parameters, logistics,
                    storage levels, and supply chain transparency in real time.
                </p>

                {/* Cards */}
                <div className="molasses-grid">

                    <div className="mol-card">
                        <h3 className="card-label">Daily Molasses Output</h3>
                        <p className="card-value">48,200 L</p>
                        <p className="card-info">Updated 2 mins ago</p>
                    </div>

                    <div className="mol-card">
                        <h3 className="card-label">Average Brix Level</h3>
                        <p className="card-value">37.8 °Bx</p>
                        <p className="card-info">High-grade fermentable sugar</p>
                    </div>

                    <div className="mol-card">
                        <h3 className="card-label">Current Storage Capacity</h3>
                        <p className="card-value">68%</p>
                        <p className="card-info">Tanks 3 & 4 near full capacity</p>
                    </div>

                    <div className="mol-card">
                        <h3 className="card-label">Supply Chain Dispatch</h3>
                        <p className="card-value">12 Shipments</p>
                        <p className="card-info">Across 4 regions</p>
                    </div>

                </div>

                {/* Bottom Info Section */}
                <div className="molasses-details">
                    <h3 className="details-title">Detailed Insights</h3>

                    <ul className="details-list">
                        <li> Monitoring molasses viscosity & fermentable sugar levels</li>
                        <li> Tracking batch-wise storage and transfer between tanks</li>
                        <li> Real-time updates for distillery integration</li>
                        <li> Quality checks: Color index, Ash %, pH, and Purity levels</li>
                        <li> Logistics tracking for tanker movement and dispatch schedules</li>
                    </ul>

                    <button className="mol-btn">View Full Analytics</button>
                </div>

            </div>
        </section>
    );
}
