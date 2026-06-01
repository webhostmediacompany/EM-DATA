import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";

export default function ProfileMenu({ user, onSignOut }) {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [profilePic, setProfilePic] = useState(user?.profilePic);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => setProfilePic(user?.profilePic), [user]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !e.target.classList.contains("pm-avatar")
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Auto-refresh helpers ---

    // Try to activate a waiting service worker (if present) and reload when activated.
    const activateWaitingServiceWorkerAndReload = async () => {
        if (!("serviceWorker" in navigator)) {
            // no service worker support, simple reload
            window.location.reload();
            return;
        }

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.waiting) {
                // Tell waiting SW to skip waiting and become active
                registration.waiting.postMessage({ type: "SKIP_WAITING" });

                // Wait for it to activate then reload
                registration.waiting.addEventListener("statechange", (e) => {
                    const sw = e.target;
                    if (sw && sw.state === "activated") {
                        window.location.reload();
                    }
                });

                // As a fallback in case statechange doesn't fire, reload after a short timeout
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                // No waiting SW — just reload
                window.location.reload();
            }
        } catch (err) {
            // Any error -> fallback to normal reload
            console.error("SW refresh failed, falling back to reload:", err);
            window.location.reload();
        }
    };

    // Listen for storage changes (cross-tab) — if another tab updates 'user', refresh this page
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "user") {
                // If user removed (signed out) or changed (photo), refresh to pick up new UI / precache
                // Small debounce to avoid rapid refreshes
                setTimeout(() => {
                    activateWaitingServiceWorkerAndReload();
                }, 200);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Also listen for controllerchange (another SW took control) and then reload
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;
        const onControllerChange = () => {
            // when a new service worker controls the page, reload to use the new assets
            window.location.reload();
        };
        navigator.serviceWorker.addEventListener?.("controllerchange", onControllerChange);
        return () =>
            navigator.serviceWorker.removeEventListener?.("controllerchange", onControllerChange);
    }, []);

    // --- Photo and signout handlers ---

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imageURL = URL.createObjectURL(file);
        setProfilePic(imageURL);

        // Persist to localStorage (other tabs will pick this up and refresh)
        const updatedUser = { ...user, profilePic: imageURL };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // If you want immediate reload in this tab to pick new precache assets:
        // activateWaitingServiceWorkerAndReload();
    };

    const handleRemovePhoto = () => {
        setProfilePic(null);
        const updatedUser = { ...user, profilePic: null };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // activateWaitingServiceWorkerAndReload(); // optional
    };

    const handleSignOut = () => {
        localStorage.removeItem("user");
        if (onSignOut) onSignOut();

        // First navigate to login route so React Router shows the login UI,
        // then force a reload that attempts to activate waiting SW (ensures precache refresh).
        navigate("/loginpage");

        // Small delay to allow navigation to take effect before reload
        setTimeout(() => {
            activateWaitingServiceWorkerAndReload();
        }, 50);
    };

    return (
        <div className="pm-container">
            <div className="pm-wrapper">
                <img
                    src={profilePic || "/default-avatar.png"}
                    alt="profile"
                    className="pm-avatar"
                    onClick={() => setOpen(!open)}
                />

                {open && (
                    <div className="pm-dropdown" ref={dropdownRef}>
                        <div className="pm-info">
                            <img src={profilePic || "/default-avatar.png"} alt="profile-pic" />

                            <h3>{user.fullname}</h3>
                            <p>{user.email}</p>
                            <span>User ID: {user.uid}</span>

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                style={{ display: "none" }}
                            />

                            <div className="pm-photo-actions">
                                <button
                                    className="pm-upload-btn"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Change Photo
                                </button>

                                {profilePic && (
                                    <button className="pm-remove-btn" onClick={handleRemovePhoto}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        <ul className="pm-options">
                            <li>My Profile</li>
                            <li>Settings</li>
                            <li onClick={handleSignOut} className="pm-logout">
                                Sign Out
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
