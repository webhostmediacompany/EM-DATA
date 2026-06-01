import "./About.css";

export default function About() {
    return (
        <section className="about-container" id="about">
            <div className="about-wrapper">

                {/* Left Side — Image */}
                <div className="about-image"></div>

                {/* Right Side — Content */}
                <div className="about-content">
                    <h2 className="about-title">About the Real-Time Ethanol Production</h2>

                    <p className="about-text">
                        Our Real-Time Ethanol Production Dashboard delivers complete visibility
                        across production plants, feedstock utilization, water consumption,
                        emissions and supply chain metrics. Built for transparency,
                        optimization, and sustainability—this platform helps industries
                        track performance and make data-driven decisions at every step.
                    </p>

                    <ul className="about-list">
                        <li>✔ Live plant-wise ethanol production tracking</li>
                        <li>✔ Feedstock usage analytics for cost optimization</li>
                        <li>✔ Water consumption & sustainability insights</li>
                        <li>✔ Emission measurements for environmental compliance</li>
                        <li>✔ Region-wise supply chain transparency</li>
                    </ul>

                    <button className="about-btn">Learn More</button>
                </div>

            </div>
        </section>
    );
}
