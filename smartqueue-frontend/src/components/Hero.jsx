import React from "react";

import {
    FaArrowRight,
    FaUserClock,
    FaCalendarCheck,
    FaHeartbeat,
    FaCheckCircle,
    FaClock,
    FaUserMd,
    FaUsers,
    FaStethoscope
} from "react-icons/fa";

import "./Hero.css";

function Hero() {
    return (
        <section className="hero" id="home">

            {/* =====================================================
                BACKGROUND DECORATIONS
            ===================================================== */}

            <div className="hero-bg-circle one"></div>
            <div className="hero-bg-circle two"></div>

            <div className="hero-grid"></div>


            <div className="hero-container">

                {/* =====================================================
                    LEFT CONTENT
                ===================================================== */}

                <div className="hero-content">

                    {/* Badge */}

                    <div className="hero-badge">

                        <span className="badge-icon">
                            <FaHeartbeat />
                        </span>

                        <span>
                            Smart Healthcare Queue System
                        </span>

                        <span className="badge-live">
                            LIVE
                        </span>

                    </div>


                    {/* Heading */}

                    <h1>
                        SmartQueue

                        <span>
                            Smart Waiting,
                            <br />
                            Better Healthcare
                        </span>
                    </h1>


                    {/* Description */}

                    <p className="hero-description">
                        A smarter way to manage hospital queues.
                        Book appointments, track your token and
                        stay updated with real-time queue information
                        without waiting unnecessarily.
                    </p>


                    {/* Buttons */}

                    <div className="hero-buttons">

                        <a
                            href="/register"
                            className="primary-btn"
                        >
                            Get Started

                            <span className="btn-icon">
                                <FaArrowRight />
                            </span>
                        </a>


                        <a
                            href="#features"
                            className="secondary-btn"
                        >
                            Explore Features
                        </a>

                    </div>


                    {/* Trust Items */}

                    <div className="hero-trust">

                        <div className="trust-item">

                            <span className="trust-icon">
                                <FaCheckCircle />
                            </span>

                            <div>
                                <strong>
                                    Real-Time
                                </strong>

                                <small>
                                    Queue Updates
                                </small>
                            </div>

                        </div>


                        <div className="trust-item">

                            <span className="trust-icon">
                                <FaCheckCircle />
                            </span>

                            <div>
                                <strong>
                                    Secure
                                </strong>

                                <small>
                                    Healthcare Platform
                                </small>
                            </div>

                        </div>


                        <div className="trust-item">

                            <span className="trust-icon">
                                <FaCheckCircle />
                            </span>

                            <div>
                                <strong>
                                    Easy
                                </strong>

                                <small>
                                    Appointment Booking
                                </small>
                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    RIGHT QUEUE VISUAL
                ===================================================== */}

                <div className="queue-preview">

                    {/* Background Orbit */}

                    <div className="queue-orbit"></div>


                    {/* =================================================
                        TOP FLOATING CARD
                    ================================================= */}

                    <div className="floating-card top">

                        <div className="floating-icon">
                            <FaUserClock />
                        </div>

                        <div className="floating-content">

                            <strong>
                                120+
                            </strong>

                            <small>
                                Patients Today
                            </small>

                            {/* Mini Patient Avatars */}

                            <div className="mini-patient-row">

                                <span>
                                    <FaUsers />
                                </span>

                                <span>
                                    <FaUserMd />
                                </span>

                                <span>
                                    <FaStethoscope />
                                </span>

                                <b>
                                    +117
                                </b>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        MAIN QUEUE CARD
                    ================================================= */}

                    <div className="queue-card">

                        {/* Top Accent */}

                        <div className="queue-accent"></div>


                        {/* Header */}

                        <div className="queue-header">

                            <div className="queue-title">

                                <span className="queue-title-icon">
                                    <FaUserMd />
                                </span>

                                <div>

                                    <h3>
                                        Live Queue
                                    </h3>

                                    <small>
                                        Cardiology Department
                                    </small>

                                </div>

                            </div>


                            <div className="online-status">

                                <span></span>

                                ONLINE

                            </div>

                        </div>


                        {/* Divider */}

                        <div className="queue-divider"></div>


                        {/* =================================================
                            QUEUE VISUAL / DOCTOR
                        ================================================= */}

                        <div className="doctor-visual">

                            <div className="doctor-glow"></div>

                            <div className="doctor-avatar">

                                <FaUserMd />

                            </div>

                            <div className="doctor-status-dot"></div>

                            <div className="doctor-mini-badge">
                                <FaHeartbeat />
                            </div>

                        </div>


                        {/* Current Serving */}

                        <div className="serving">

                            <p>
                                NOW SERVING
                            </p>

                            <h2>
                                A102
                            </h2>

                            <div className="doctor-room">

                                <FaUserMd />

                                Dr. Sharma

                                <span>•</span>

                                Room 03

                            </div>

                        </div>


                        {/* Queue Information */}

                        <div className="queue-info">

                            {/* Waiting */}

                            <div className="queue-info-item">

                                <span className="info-icon">
                                    <FaUserClock />
                                </span>

                                <div>

                                    <small>
                                        Waiting
                                    </small>

                                    <strong>
                                        08
                                    </strong>

                                    <span>
                                        Patients
                                    </span>

                                </div>

                            </div>


                            <div className="queue-info-divider"></div>


                            {/* Estimated Wait */}

                            <div className="queue-info-item">

                                <span className="info-icon clock">
                                    <FaClock />
                                </span>

                                <div>

                                    <small>
                                        Estimated Wait
                                    </small>

                                    <strong>
                                        15
                                        <em>
                                            min
                                        </em>
                                    </strong>

                                    <span>
                                        Approx.
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* Queue Progress */}

                        <div className="queue-progress">

                            <div className="progress-header">

                                <span>
                                    Queue Progress
                                </span>

                                <strong>
                                    72%
                                </strong>

                            </div>


                            <div className="progress-bar">

                                <span></span>

                            </div>

                        </div>


                        {/* Next Patient */}

                        <div className="next-patient">

                            <div className="next-patient-icon">
                                <FaUserClock />
                            </div>

                            <div className="next-patient-content">

                                <small>
                                    NEXT PATIENT
                                </small>

                                <strong>
                                    A103
                                </strong>

                            </div>

                            <span className="next-arrow">
                                →
                            </span>

                        </div>


                        {/* Footer */}

                        <div className="queue-footer">

                            <span>

                                <span className="footer-dot"></span>

                                Queue is moving smoothly

                            </span>

                            <span>
                                Updated just now
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        BOTTOM FLOATING CARD
                    ================================================= */}

                    <div className="floating-card bottom">

                        <div className="floating-icon calendar">
                            <FaCalendarCheck />
                        </div>

                        <div className="floating-content">

                            <strong>
                                98%
                            </strong>

                            <small>
                                Appointment Success
                            </small>

                            <div className="success-progress">
                                <span></span>
                            </div>

                        </div>

                        <span className="floating-check">
                            ✓
                        </span>

                    </div>


                    {/* =================================================
                        DECORATIVE DOTS
                    ================================================= */}

                    <span className="visual-dot dot-one"></span>

                    <span className="visual-dot dot-two"></span>

                    <span className="visual-dot dot-three"></span>

                    <span className="visual-dot dot-four"></span>

                </div>

            </div>

        </section>
    );
}

export default Hero;