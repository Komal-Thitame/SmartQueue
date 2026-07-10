import React from "react";
import {
    FaCheckCircle,
    FaBullseye,
    FaEye,
    FaShieldAlt
} from "react-icons/fa";

import "./About.css";

function About() {
    return (
        <section className="about-section" id="about">

            <div className="about-container">

                {/* LEFT */}

                <div className="about-image">

                    <img
                        src="/images/about-dashboard.png"
                        alt="SmartQueue Dashboard"
                    />

                    <div className="floating-card">

                        <h3>Smart Healthcare</h3>

                        <p>Digital Queue & Appointment Management</p>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="about-content">

                    <span>About SmartQueue</span>

                    <h2>
                        Modern Queue Management
                        For Better Healthcare
                    </h2>

                    <p>
                        SmartQueue is a Hospital Queue &
                        Appointment Management System designed
                        to simplify hospital operations through
                        digital appointments, real-time queue
                        tracking and efficient patient management.
                    </p>

                    <div className="about-feature">

                        <FaBullseye />

                        <div>

                            <h4>Our Mission</h4>

                            <p>
                                Reduce waiting time and improve
                                hospital efficiency using smart
                                digital solutions.
                            </p>

                        </div>

                    </div>

                    <div className="about-feature">

                        <FaEye />

                        <div>

                            <h4>Our Vision</h4>

                            <p>
                                Build a faster, transparent and
                                patient-friendly healthcare system.
                            </p>

                        </div>

                    </div>

                    <ul>

                        <li>
                            <FaCheckCircle />
                            Digital Appointment Booking
                        </li>

                        <li>
                            <FaCheckCircle />
                            Live Queue Tracking
                        </li>

                        <li>
                            <FaCheckCircle />
                            Role Based Dashboard
                        </li>

                        <li>
                            <FaCheckCircle />
                            Secure Patient Management
                        </li>

                        <li>
                            <FaShieldAlt />
                            Secure & Scalable Architecture
                        </li>

                    </ul>

                </div>

            </div>

        </section>
    );
}

export default About;