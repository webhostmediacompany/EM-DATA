import React from "react";
import "./Alertpage.css";

const Alertpage = () => {
    const alerts = [
        {
            title: "Production Efficiency",
            status: "critical",
            message: "Production efficiency has dropped below 65%. Immediate attention required!",
            value: "62%",
        },
        {
            title: "Resource Utilization",
            status: "warning",
            message: "Resource utilization is nearing capacity. Consider load balancing.",
            value: "88%",
        },
        {
            title: "Revenue Impact",
            status: "info",
            message: "Minor fluctuations detected in hourly revenue projections.",
            value: "$120k / hr",
        },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case "critical":
                return "alert-card critical";
            case "warning":
                return "alert-card warning";
            case "info":
                return "alert-card info";
            default:
                return "alert-card";
        }
    };

    return (
        <div className="alert-dashboard">
            <h1 className="header">Real-Time System Alerts</h1>
            <p className="sub-header">
                Monitoring production efficiency, resource utilization & revenue impact
            </p>

            <div className="alerts-container">
                {alerts.map((alert, index) => (
                    <div key={index} className={getStatusClass(alert.status)}>
                        <h2>{alert.title}</h2>
                        <div className="alert-value">{alert.value}</div>
                        <p>{alert.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Alertpage;
