import React from "react";
import "./ContactSection.css";
import Plant from "../src/assets/flamingo.png"; // Correct import

const ContactSection = () => {
    return (
        <div className="contact-wrapper">
            <div className="contact-container">

                <div className="contact-image">
                    {/* Use the SAME variable name as the import */}
                    <img src={Plant} alt="Contact" />
                </div>

                <p className="contact-subtitle">Contact US</p>

                <h1 className="contact-number">1800 4254 177</h1>

                <div className="divider"></div>

                <p className="contact-text">Or Get a Free Estimate</p>

                <button className="contact-btn">Contact Us Today</button>
            </div>
        </div>
    );
};

export default ContactSection;
