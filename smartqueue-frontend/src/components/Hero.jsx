import React from "react";
import { FaCalendarCheck, FaClock, FaUserDoctor } from "react-icons/fa6";
import { FiArrowRight, FiPlay } from "react-icons/fi"; // Added modern premium action icons
import "./Hero.css";

function Hero() {
    return (
        <section className="hero">
            <div className="hero-wrapper">

                {/* Left Side (Content & Dynamic Control Block) */}
                <div className="hero-content">
                    <span className="hero-tag">
                        ✨ Intelligent Queue Management
                    </span>

                    <h1>
                        Healthcare Queues
                        <br />
                        <span>Made Simple</span>
                    </h1>

                    <p>
                        SmartQueue helps hospitals manage appointments, digital tokens,
                        and patient flows with real-time updates for an elite healthcare ecosystem.
                    </p>

                    <div className="hero-buttons">
                        <button className="primary-hero-btn">
                            <span>Get Started</span>
                            <FiArrowRight className="btn-icon" />
                        </button>

                        <button className="secondary-hero-btn">
                            <FiPlay className="btn-icon-play" />
                            <span>Explore Demo</span>
                        </button>
                    </div>

                    {/* Transformed Features into Glass Pills */}
                    <div className="hero-features">
                        <div className="feature-pill">
                            <FaCalendarCheck className="feature-icon" />
                            <span>Easy Appointment</span>
                        </div>

                        <div className="feature-pill">
                            <FaClock className="feature-icon" />
                            <span>Live Tracking</span>
                        </div>

                        <div className="feature-pill">
                            <FaUserDoctor className="feature-icon" />
                            <span>Doctor Hub</span>
                        </div>
                    </div>
                </div>

                {/* Right Side (Advanced Overlapping Layer Workspace) */}
                <div className="hero-dashboard">

                    {/* The Main Frosted Dashboard Box */}
                    <div className="dashboard-box">
                        <div className="dashboard-header">
                            <h3>Smart<span>Queue</span></h3>
                            <span className="live-badge">
                                <span className="pulse-dot"></span> Live Operational
                            </span>
                        </div>

                        <div className="token-display-box">
                            <p>Current Token Number</p>
                            <h1>#102</h1>
                            <div className="waiting-time-tag">
                                <span>Estimated Wait Time: 5 min</span>
                            </div>
                        </div>

                        <div className="doctor-profile-card">
                            <div className="doctor-avatar-wrapper">
                                👨‍⚕️
                            </div>
                            <div className="doctor-info">
                                <h4>Dr. Sharma</h4>
                                <p className="status-online">Available Now</p>
                            </div>
                        </div>
                    </div>

                    {/* High Depth Floating Notification Cards */}
                    <div className="floating alert-success">
                        <span className="alert-check">✓</span> Appointment Confirmed
                    </div>

                    <div className="floating alert-warning">
                        <span className="alert-bell">🔔</span> Queue Updated
                    </div>

                </div>

            </div>
        </section>
    );
}

export default Hero;