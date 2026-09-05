import React from "react";

import {
    FaCalendarCheck,
    FaTicketAlt,
    FaUserMd,
    FaBell,
    FaChartLine,
    FaShieldAlt
} from "react-icons/fa";

import "./Features.css";


function Features() {

    const features = [

        {
            icon: <FaCalendarCheck />,
            tag: "Appointments",
            title: "Appointment Management",
            desc:
                "Patients can book appointments digitally, while staff can manage scheduled visits and appointment status."
        },

        {
            icon: <FaTicketAlt />,
            tag: "Queue Management",
            title: "Smart Token Queue",
            desc:
                "Generate digital tokens and track waiting patients, current serving tokens and queue position in real time."
        },

        {
            icon: <FaUserMd />,
            tag: "Doctor Module",
            title: "Doctor Dashboard",
            desc:
                "Doctors can manage their queue, start consultations, complete appointments and view patient information."
        },

        {
            icon: <FaBell />,
            tag: "Live Updates",
            title: "Real-Time Notifications",
            desc:
                "Keep patients and staff informed about token changes, appointment status and important queue updates."
        },

        {
            icon: <FaChartLine />,
            tag: "Analytics",
            title: "Queue Analytics",
            desc:
                "Monitor waiting patients, completed consultations and queue activity to understand hospital performance."
        },

        {
            icon: <FaShieldAlt />,
            tag: "Security",
            title: "Role-Based Access",
            desc:
                "Provide separate access and functionality for Admin, Doctor, Receptionist and Patient roles."
        }

    ];


    return (

        <section
            className="features-section"
            id="features"
        >

            {/* ===============================
                HEADING
            =============================== */}

            <div className="features-heading">

                <span className="features-label">
                    Powerful Features
                </span>

                <h2>
                    Everything You Need for
                    <br />
                    <span>Smart Queue Management</span>
                </h2>

                <p>
                    SmartQueue brings appointments, digital tokens,
                    doctor queues and hospital operations together
                    in one simple platform.
                </p>

            </div>


            {/* ===============================
                FEATURES GRID
            =============================== */}

            <div className="features-grid">

                {features.map((item, index) => (

                    <div
                        className="feature-card"
                        key={index}
                    >

                        {/* Decorative number */}

                        <span className="feature-number">
                            0{index + 1}
                        </span>


                        {/* Top */}

                        <div className="feature-top">

                            <div className="feature-icon">
                                {item.icon}
                            </div>

                            <span className="feature-tag">
                                {item.tag}
                            </span>

                        </div>


                        {/* Content */}

                        <div className="feature-content">

                            <h3>
                                {item.title}
                            </h3>

                            <p>
                                {item.desc}
                            </p>

                        </div>


                        {/* Bottom line */}

                        <div className="feature-bottom">

                            <span>
                                SmartQueue
                            </span>

                            <span className="feature-line"></span>

                        </div>

                    </div>

                ))}

            </div>

        </section>

    );

}


export default Features;