import { useEffect, useState } from "react";
import { api } from "../Problemetic/api";
import "./HistoryDashboard.css";

// Log helper function
export const logAction = async ({ userId, action, module, message, level = "info" }) => {
    try {
        await api.post("/log/add/", {
            user_id: userId,
            action,
            module,
            message,
            level,
        });
    } catch (err) {
        console.error("Log Error:", err);
    }
};

export default function HistoryDashboard() {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState("all");

    const loadLogs = async () => {
        try {
            const res = await api.get("/log/list/");
            // Sort latest first
            setLogs(res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (err) {
            console.error("Failed to load logs:", err);
        }
    };

    useEffect(() => {
        loadLogs();
        const interval = setInterval(loadLogs, 1500); // refresh every 1.5s
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = filter === "all"
        ? logs
        : logs.filter(log => log.module === filter);

    return (
        <div className="history-box">
            <div className="history-header">
                <h2>⚡ System Activity History</h2>

                <select
                    className="history-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Modules</option>
                    <option value="auth">Authentication</option>
                    <option value="reports">Reports</option>
                    <option value="data">Data</option>
                    <option value="dashboard">Dashboard</option>
                </select>
            </div>

            <div className="log-container">
                {filteredLogs.length === 0 && (
                    <div className="log-row info">No logs available.</div>
                )}
                {filteredLogs.map((log) => (
                    <div key={log.id} className={`log-row ${log.level || "info"}`}>
                        <div className="log-left">
                            <span className="dot"></span>
                            <div>
                                <div className="log-title">
                                    <b>{log.user || "System"}</b> • {log.action || "action"} • <span>{log.module || "module"}</span>
                                </div>
                                <div className="msg">{log.message || "-"}</div>
                            </div>
                        </div>
                        <div className="time">{log.created_at || "-"}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
