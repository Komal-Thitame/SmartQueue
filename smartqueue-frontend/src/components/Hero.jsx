import React from "react";

import {
    FaArrowRight,
    FaUserClock,
    FaCalendarCheck,
    FaHeartbeat,
    FaCheckCircle,
    FaClock,
    FaUserMd
} from "react-icons/fa";

import "./Hero.css";

function Hero() {

    return (

        <section className="hero" id="home">

            {/* Background decorations */}
            <div className="hero-bg-circle one"></div>
            <div className="hero-bg-circle two"></div>

            <div className="hero-grid"></div>

            <div className="hero-container">

                {/* =====================================================
                    LEFT CONTENT
                ===================================================== */}

                <div className="hero-content">

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


                    <h1>

                        SmartQueue

                        <span>
                            Smart Waiting,
                            <br />
                            Better Healthcare
                        </span>

                    </h1>


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


                    {/* Trust */}

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

                    {/* Decorative circle */}

                    <div className="queue-orbit"></div>


                    {/* TOP FLOATING CARD */}

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

                        </div>

                    </div>


                    {/* MAIN QUEUE CARD */}

                    <div className="queue-card">

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


                        {/* Current serving */}

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


                        {/* Queue information */}

                        <div className="queue-info">

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


                        {/* Progress */}

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


                    {/* BOTTOM FLOATING CARD */}

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

                        </div>

                        <span className="floating-check">
                            ✓
                        </span>

                    </div>


                    {/* SMALL DECORATIVE DOTS */}

                    <span className="visual-dot dot-one"></span>
                    <span className="visual-dot dot-two"></span>
                    <span className="visual-dot dot-three"></span>

                </div>

            </div>

        </section>

    );

}

export default Hero;