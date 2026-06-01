import React, { useState } from "react";
import "./Settings.css";

const Settings = () => {
    const [settings, setSettings] = useState({
        ethanolTarget: 85,
        molassesStockLimit: 120,
        resourceThreshold: 75,
        revenueGoal: 500000,
    });

    const handleChange = (e) => {
        setSettings({
            ...settings,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="ems-page">
            <h1 className="ems-title">Ethanol & Molasses Settings Dashboard</h1>
            <p className="ems-subtitle">
                Configuration panel for real-time monitoring of production efficiency, resource utilization & revenue impact
            </p>

            <div className="ems-grid">

                {/* Production Efficiency */}
                <div className="ems-card card-efficiency">
                    <h2>Production Efficiency Settings</h2>
                    <label>Target Ethanol Efficiency (%)</label>
                    <input
                        type="number"
                        name="ethanolTarget"
                        value={settings.ethanolTarget}
                        onChange={handleChange}
                    />
                    <p className="ems-info">
                        Current Target: <strong>{settings.ethanolTarget}%</strong>
                    </p>
                </div>

                {/* Resource Utilization */}
                <div className="ems-card card-resources">
                    <h2>Molasses Resource Utilization</h2>
                    <label>Stock Warning Limit (Tonnes)</label>
                    <input
                        type="number"
                        name="molassesStockLimit"
                        value={settings.molassesStockLimit}
                        onChange={handleChange}
                    />
                    <label>Maximum Utilization Threshold (%)</label>
                    <input
                        type="number"
                        name="resourceThreshold"
                        value={settings.resourceThreshold}
                        onChange={handleChange}
                    />
                    <p className="ems-info">
                        Alert when utilization exceeds <strong>{settings.resourceThreshold}%</strong>
                    </p>
                </div>

                {/* Revenue Impact */}
                <div className="ems-card card-revenue">
                    <h2>Revenue Impact Configuration</h2>
                    <label>Daily Revenue Goal (₹)</label>
                    <input
                        type="number"
                        name="revenueGoal"
                        value={settings.revenueGoal}
                        onChange={handleChange}
                    />
                    <p className="ems-info">
                        Current Goal: <strong>₹{settings.revenueGoal.toLocaleString()}</strong>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Settings;
