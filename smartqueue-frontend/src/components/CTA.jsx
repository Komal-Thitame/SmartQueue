import React from "react";
import { FaArrowRight } from "react-icons/fa";
import "./CTA.css";

function CTA() {

    return (

        <section className="cta-section">

            <div className="cta-card">

                <span className="cta-badge">
                    Smart Healthcare Platform
                </span>

                <h2>
                    Ready to Transform
                    Hospital Queue Management?
                </h2>

                <p>
                    Experience faster appointments,
                    digital token management and
                    real-time queue updates with SmartQueue.
                </p>

                <div className="cta-buttons">

                    <a
                        href="/register"
                        className="cta-primary"
                    >
                        Get Started
                        <FaArrowRight/>
                    </a>

                    <a
                        href="/login"
                        className="cta-secondary"
                    >
                        Login
                    </a>

                </div>

            </div>

        </section>

    );

}

export default CTA;