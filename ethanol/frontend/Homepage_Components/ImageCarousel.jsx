import { useState, useEffect } from "react";
import "./ImageCarousel.css";

export default function ImageCarousel() {
    const slides = [
        {
            id: 1,
            img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
            title: "Real-Time Ethanol Production",
            desc: "Live monitoring across plants & regions."
        },
        {
            id: 2,
            img: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
            title: "Feedstock Usage Optimization",
            desc: "Track grain, sugarcane, sorghum utilization."
        },
        {
            id: 3,
            img: "https://i.pinimg.com/1200x/33/db/be/33dbbe844878b2431492eceba380fd1f.jpg",
            title: "Sustainability Metrics",
            desc: "Monitor water use, emissions & energy."
        }
    ];

    const [index, setIndex] = useState(0);

    // Auto-slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000);
        return () => clearInterval(interval);
    }, [index]);

    const nextSlide = () => {
        setIndex(index === slides.length - 1 ? 0 : index + 1);
    };

    const prevSlide = () => {
        setIndex(index === 0 ? slides.length - 1 : index - 1);
    };

    return (
        <div className="carousel-container">
            <div
                className="carousel-slide"
                style={{ backgroundImage: `url(${slides[index].img})` }}
            >
                <div className="carousel-overlay">
                    <h2>{slides[index].title}</h2>
                    <p>{slides[index].desc}</p>
                </div>

                {/* Navigation buttons */}
                <button className="carousel-btn left" onClick={prevSlide}>❮</button>
                <button className="carousel-btn right" onClick={nextSlide}>❯</button>

                {/* Dots Indicator */}
                <div className="carousel-dots">
                    {slides.map((_, i) => (
                        <span
                            key={i}
                            className={`dot ${i === index ? "active" : ""}`}
                            onClick={() => setIndex(i)}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    );
}
