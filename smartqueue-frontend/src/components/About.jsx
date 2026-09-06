import React from "react";

import {
    FaCheckCircle,
    FaHeartbeat,
    FaArrowRight
} from "react-icons/fa";

import "./About.css";


function About() {

    return (

        <section className="about-section" id="about">

            <div className="about-container">

                {/* ================= LEFT : IMAGE ================= */}

                <div className="about-image-area">

                    <div className="about-image-card">

                        <img
                            src="/about-healthcare.jpg"
                            alt="SmartQueue Healthcare"
                        />

                    </div>


                    {/* Floating Card */}


                </div>


                {/* ================= RIGHT : CONTENT ================= */}

                <div className="about-content">

                    <span className="about-label">
                        <span></span>
                        About SmartQueue
                    </span>


                    <h2>
                        Making Every
                        <strong> Patient Visit Simpler</strong>
                    </h2>


                    <p className="about-description">

                        SmartQueue is a digital Hospital Queue &
                        Appointment Management System created to make
                        the hospital experience simpler for patients
                        and easier for healthcare staff.

                    </p>


                    <p className="about-description">

                        From booking an appointment to receiving a
                        digital token and reaching the doctor,
                        SmartQueue keeps the entire patient journey
                        organized in one connected platform.

                    </p>


                    {/* ================= HIGHLIGHT ================= */}

                    <div className="about-highlight">

                        <div className="highlight-icon">
                            <FaCheckCircle />
                        </div>

                        <div>

                            <strong>
                                Less Waiting. Better Experience.
                            </strong>

                            <p>
                                SmartQueue brings patients and
                                healthcare staff onto one simple
                                digital platform.
                            </p>

                        </div>

                    </div>


                    {/* ================= SMALL POINTS ================= */}

                    <div className="about-points">

                        <div className="about-point">
                            <FaCheckCircle />
                            <span>Digital & Paperless</span>
                        </div>

                        <div className="about-point">
                            <FaCheckCircle />
                            <span>Real-Time Queue Tracking</span>
                        </div>

                        <div className="about-point">
                            <FaCheckCircle />
                            <span>Connected Healthcare</span>
                        </div>

                    </div>


                    <a
                        href="#features"
                        className="about-link"
                    >
                        Explore SmartQueue
                        <FaArrowRight />
                    </a>

                </div>

            </div>

        </section>

    );

}


export default About;