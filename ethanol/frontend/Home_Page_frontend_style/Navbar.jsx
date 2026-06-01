import { useState, useEffect } from "react";
import flamingoLogo from "../src/assets/flamingo.png";
import ProfileMenu from "./ProfileMenu";
import "./Navbar.css";

export default function Navbar() {
    const [open, setOpen] = useState(false); // mobile sidebar
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    // Track which sidebar dropdown is open
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        
        // Initialize theme on mount
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const handleSignIn = () => window.location.assign("/loginpage");
    const handleSignOut = () => {
        localStorage.removeItem("user");
        setUser(null);
        window.location.assign("/loginpage");
    };

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    return (
        <nav className="nav-container">
            <div className="nav-content">
                {/* Logo */}
                <div className="nav-logo-wrapper">
                    <a href="/">
                        <img src={flamingoLogo} alt="logo" className="nav-logo-img" />
                    </a>
                    <span className="nav-logo">Go-Flamingo</span>
                </div>

                {/* Desktop Menu */}
                <div className="nav-links">
                    {["Dashboard", "Nexus", "Ethanol", "Molasses", "Alerts", "Settings"].map((menu) => (
                        <div key={menu} className="nav-item-dropdown">
                            <button className="nav-link">{menu} ▾</button>
                            <div className="dropdown-menu">
                                {menu === "Dashboard" && (
                                    <>
                                        <a href="/dashboard">Overview</a>
                                        {/* <a href="/stats">Stats</a> */}
                                    </>
                                )}
                                {menu === "Nexus" && (
                                    <>
                                        <a href="/nexusdash">Live Data</a>
                                        {/* <a href="/reports">Reports</a> */}
                                    </>
                                )}
                                {menu === "Ethanol" && (
                                    <>
                                        <a href="/EthanolNavDash">Daily Status</a>
                                        {/* <a href="/ethanol-analytics">Analytics</a> */}
                                    </>
                                )}
                                {menu === "Molasses" && (
                                    <>
                                        <a href="/MolassesNavDash">Readings</a>
                                        {/* <a href="/molasses-trends">Trends</a> */}
                                    </>
                                )}
                                {menu === "Alerts" && (
                                    <>
                                        <a href="/Alertdash">Active</a>
                                        <a href="/historyDashboard">History</a>
                                    </>
                                )}
                                {menu === "Settings" && (
                                    <>
                                        <a href="/Settingsdash">Preferences</a>
                                        {/* <a href="/settings-manage">Manage</a> */}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Theme Toggle Button */}
                    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === "light" ? (
                            <svg className="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                                <circle cx="12" cy="12" r="5" fill="currentColor" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        ) : (
                            <svg className="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
                            </svg>
                        )}
                    </button>

                    <ProfileMenu
                        user={user}
                        onSignIn={handleSignIn}
                        onSignOut={handleSignOut}
                    />
                </div>

                {/* Mobile Toggle */}
                <button className="nav-toggle" onClick={() => setOpen(!open)}>
                    {open ? "✖" : "☰"}
                </button>
            </div>

            {/* Mobile Sidebar */}
            <div className={`mobile-menu ${open ? "active" : ""}`}>
                {[
                    { name: "Dashboard", links: [{ label: "Overview", href: "/dashboard" }, { label: "Stats", href: "/stats" }] },
                    { name: "Nexus", links: [{ label: "Live Data", href: "/nexusdash" }, { label: "Reports", href: "/reports" }] },
                    { name: "Ethanol", links: [{ label: "Daily Status", href: "/EthanolNavDash" }, { label: "Analytics", href: "/ethanol-analytics" }] },
                    { name: "Molasses", links: [{ label: "Readings", href: "/MolassesNavDash" }, { label: "Trends", href: "/molasses-trends" }] },
                    { name: "Alerts", links: [{ label: "Active", href: "/Alertdash" }, { label: "History", href: "/alerts-history" }] },
                    { name: "Settings", links: [{ label: "Preferences", href: "/Settingsdash" }, { label: "Manage", href: "/settings-manage" }] },
                ].map((menu) => (
                    <div key={menu.name} className="sidebar-item">
                        <span onClick={() => toggleDropdown(menu.name)}>{menu.name} ▾</span>
                        <div className="sidebar-dropdown" style={{ display: activeDropdown === menu.name ? "flex" : "none" }}>
                            {menu.links.map((link) => (
                                <a key={link.href} href={link.href}>{link.label}</a>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Mobile Theme Toggle */}
                <div className="mobile-theme-toggle-wrapper" style={{ margin: "20px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(0,0,0,0.02)", borderRadius: 10 }}>
                    <span className="mobile-toggle-label" style={{ fontWeight: 600, fontSize: 14 }}>{theme === "light" ? "Dark Theme" : "Light Theme"}</span>
                    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-light)" }}>
                        {theme === "light" ? (
                            <svg className="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                                <circle cx="12" cy="12" r="5" fill="currentColor" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        ) : (
                            <svg className="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
                            </svg>
                        )}
                    </button>
                </div>

                <ProfileMenu
                    user={user}
                    onSignIn={handleSignIn}
                    onSignOut={handleSignOut}
                />
            </div>
        </nav>
    );
}
