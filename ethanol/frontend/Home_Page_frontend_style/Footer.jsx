import { useState } from "react";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import flamingoLogo from "../src/assets/flamingo.png";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");

    const handleSubscribe = async () => {
        if (!email.trim()) {
            setStatus("Please enter an email.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus("Invalid email format.");
            return;
        }

        setStatus("Subscribing...");

        try {
            // Connect backend API here if needed
            setTimeout(() => {
                setStatus("Subscribed successfully! 🎉");
            }, 1000);
        } catch (error) {
            setStatus("Subscription failed. Try again.");
        }
    };

    return (
        <footer className="footer-container">
            <div className="footer-wrapper">

                {/* Column 1: Logo + About */}
                <div className="footer-section">
                    <h2 className="footer-logo">
                        <img
                            src={flamingoLogo}
                            alt="Go-Flamingo Logo"
                            className="nav-logo-img"
                        />
                        Go-Flamingo
                    </h2>

                    <p className="footer-description">
                        Real-Time Ethanol & Molasses Monitoring Dashboard
                        delivering insights, analytics, and plant performance intelligence.
                    </p>

                    <div className="footer-social">
                        <a href="#"><FaFacebook /></a>
                        <a href="#"><FaInstagram /></a>
                        <a href="#"><FaLinkedin /></a>
                        <a href="#"><FaTwitter /></a>
                        <a href="#"><FaYoutube /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-section">
                    <h4 className="footer-heading">Quick Links</h4>
                    <a href="#" className="footer-link">Dashboard</a>
                    <a href="#" className="footer-link">Ethanol Production</a>
                    <a href="#" className="footer-link">Molasses Stats</a>
                    <a href="#" className="footer-link">Alerts</a>
                    <a href="#" className="footer-link">Settings</a>
                </div>

                {/* Support */}
                <div className="footer-section">
                    <h4 className="footer-heading">Support</h4>
                    <a href="#" className="footer-link">Help Center</a>
                    <a href="#" className="footer-link">Documentation</a>
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms & Conditions</a>
                    <a href="#" className="footer-link">Contact Us</a>
                </div>

                {/* Newsletter */}
                <div className="footer-section">
                    <h4 className="footer-heading">Stay Updated</h4>
                    <p className="footer-news-text">
                        Subscribe to get production alerts and industry insights.
                    </p>

                    <div className="newsletter-box">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button onClick={handleSubscribe}>
                            Subscribe
                        </button>
                    </div>

                    {status && <p className="newsletter-status">{status}</p>}
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} Go-Flamingo. All Rights Reserved.
            </div>
        </footer>
    );
}
