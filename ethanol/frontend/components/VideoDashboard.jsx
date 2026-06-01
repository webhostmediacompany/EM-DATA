// ===== VideoDashboard.jsx =====
import React from "react";
import "./VideoDashboard.css";

export default function VideoDashboard() {
    return (
        <div className="vd-container">
            <h2 className="vd-title">Video Dashboard</h2>

            <div className="vd-grid">
                {/* Video Card */}
                <div className="vd-card">
                    <video className="vd-video" controls>
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                    </video>
                    <div className="vd-info">
                        <h3 className="vd-video-title">Sample HD Video</h3>
                        <p className="vd-caption">A clean dashboard-style video with full controls.</p>
                    </div>
                </div>

                {/* Duplicate cards for layout demo */}
                <div className="vd-card">
                    <video className="vd-video" controls>
                        <source src="https://www.w3schools.com/html/movie.mp4" type="video/mp4" />
                    </video>
                    <div className="vd-info">
                        <h3 className="vd-video-title">Nature Footage</h3>
                        <p className="vd-caption">Smooth playback with custom styling.</p>
                    </div>
                </div>

                <div className="vd-card">
                    <video className="vd-video" controls>
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                    </video>
                    <div className="vd-info">
                        <h3 className="vd-video-title">City Timelapse</h3>
                        <p className="vd-caption">Supports all default video controls.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

