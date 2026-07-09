import React, { useState, useEffect } from "react";
import { RiShieldPulseLine } from "react-icons/ri"; /* Unique modern dynamic medical logo */
import { FiArrowRight } from "react-icons/fi";
import "./Navbar.css";

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("Home"); // Tracks real active state

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = ["Home", "Features", "How It Works", "Solutions", "About"];

    return (
        <nav className={`smart-navbar ${scrolled ? "scrolled" : ""}`}>
            <div className="navbar-container">

                {/* Modern Geometric Logo */}
                <a href="/" className="logo-section">
                    <div className="logo-box">
                        <RiShieldPulseLine className="heartbeat-icon" />
                    </div>
                    <div className="logo-content">
                        <h2>Smart<span>Queue</span></h2>
                        <p>Next-Gen Care Ecosystem</p>
                    </div>
                </a>

                {/* Fixed Underline Link Mechanics */}
                <div className="nav-links">
                    {navItems.map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                            className={`nav-item ${activeLink === item ? "active" : ""}`}
                            onClick={() => setActiveLink(item)}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Glassmorphic Actions Group */}
                <div className="nav-actions">
                    <a href="/login" className="login-btn">
                        Login
                    </a>
                    <a href="/register" className="start-btn">
                        <span>Get Started</span>
                        <FiArrowRight className="arrow-icon" />
                    </a>
                </div>

            </div>
        </nav>
    );
}

export default Navbar;