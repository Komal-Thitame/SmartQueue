import React from "react";

import {
    FaHeartbeat,
    FaGithub,
    FaLinkedin,
    FaEnvelope,
    FaArrowUp,
    FaMapMarkerAlt
} from "react-icons/fa";

import "./Footer.css";

function Footer() {

    const scrollToTop = () => {

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

    return (

        <footer className="footer">

            <div className="footer-container">

                {/* ================= Left ================= */}

                <div className="footer-about">

                    <div className="footer-logo">

                        <div className="footer-icon">

                            <FaHeartbeat/>

                        </div>

                        <h2>
                            Smart<span>Queue</span>
                        </h2>

                    </div>

                    <p>

                        SmartQueue is a Hospital Queue &
                        Appointment Management System that
                        helps hospitals reduce waiting time,
                        improve patient experience and manage
                        appointments efficiently.

                    </p>

                    <div className="footer-social">

                        <a
                            href="https://github.com/Komal-Thitame"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <FaGithub/>
                        </a>

                        <a
                            href="https://www.linkedin.com/in/komal-thitame-404548385"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <FaLinkedin/>
                        </a>

                        <a href="mailto:your-email@gmail.com">

                            <FaEnvelope/>

                        </a>

                    </div>

                </div>





                {/* ================= Quick Links ================= */}

                <div className="footer-links">

                    <h3>

                        Quick Links

                    </h3>

                    <a href="#home">Home</a>

                    <a href="#features">Features</a>

                    <a href="#how">How It Works</a>

                    <a href="#solutions">Solutions</a>

                    <a href="#about">About</a>

                    <a href="#faq">FAQ</a>

                </div>





                {/* ================= Features ================= */}

                <div className="footer-links">

                    <h3>

                        Services

                    </h3>

                    <p>Appointment Booking</p>

                    <p>Digital Queue</p>

                    <p>Live Queue Tracking</p>

                    <p>Hospital Dashboard</p>

                    <p>Patient Management</p>

                </div>





                {/* ================= Contact ================= */}

                <div className="footer-links">

                    <h3>

                        Contact

                    </h3>

                    <p>

                        <FaEnvelope/>

                        support@smartqueue.com

                    </p>

                    <p>

                        <FaMapMarkerAlt/>

                        India

                    </p>

                </div>

            </div>





            {/* ================= Bottom ================= */}

            <div className="footer-bottom">

                <p>

                    © 2026 SmartQueue. All Rights Reserved.

                </p>

                <button
                    onClick={scrollToTop}
                >

                    <FaArrowUp/>

                </button>

            </div>

        </footer>

    );

}

export default Footer;