import React from "react";

import {
    FaUserTie,
    FaUserMd,
    FaClipboardCheck,
    FaUser,
    FaArrowRight,
    FaCheckCircle,
    FaHospital,
    FaStethoscope,
    FaTicketAlt,
    FaCalendarCheck
} from "react-icons/fa";

import "./Solutions.css";


function Solutions() {

    const solutions = [

        {
            icon: <FaUserTie />,
            roleIcon: <FaHospital />,
            title: "Admin",
            subtitle: "Hospital Management",

            desc:
                "Manage doctors, receptionists, patients and overall hospital queue operations from one centralized dashboard.",

            features: [
                "User Management",
                "Doctor Management",
                "Queue Monitoring"
            ],

            color: "admin"
        },


        {
            icon: <FaUserMd />,
            roleIcon: <FaStethoscope />,
            title: "Doctor",
            subtitle: "Consultation Management",

            desc:
                "Doctors can view their live patient queue, manage consultations and access patient information efficiently.",

            features: [
                "Live Patient Queue",
                "Consultation Management",
                "Patient Information"
            ],

            color: "doctor"
        },


        {
            icon: <FaClipboardCheck />,
            roleIcon: <FaTicketAlt />,
            title: "Receptionist",
            subtitle: "Front Desk Operations",

            desc:
                "Receptionists can book appointments, generate tokens, check in patients and manage daily appointments.",

            features: [
                "Appointment Booking",
                "Token Management",
                "Patient Check-in"
            ],

            color: "receptionist"
        },


        {
            icon: <FaUser />,
            roleIcon: <FaCalendarCheck />,
            title: "Patient",
            subtitle: "Easy Healthcare Access",

            desc:
                "Patients can book appointments, receive digital tokens and track their queue status without unnecessary waiting.",

            features: [
                "Book Appointment",
                "Digital Token",
                "Live Queue Tracking"
            ],

            color: "patient"
        }

    ];


    return (

        <section
            className="solutions-section"
            id="solutions"
        >

            {/* Background Decorations */}

            <div className="solutions-bg-shape shape-one"></div>

            <div className="solutions-bg-shape shape-two"></div>

            <div className="solutions-grid-pattern"></div>


            {/* Heading */}

            <div className="solutions-heading">

                <span className="solutions-label">
                    <FaHospital />
                    One Platform • Four Roles
                </span>


                <h2>
                    Designed For Every
                    <span> Healthcare Role</span>
                </h2>


                <p>
                    SmartQueue connects hospital staff and patients
                    through role-based dashboards, making appointments,
                    queues and consultations easier to manage.
                </p>

            </div>


            {/* Role Cards */}

            <div className="solutions-grid">

                {solutions.map((item, index) => (

                    <article
                        className={`solution-role-card ${item.color}`}
                        key={index}
                    >

                        {/* Top */}

                        <div className="solution-card-top">

                            <div className="role-icon">

                                {item.icon}

                            </div>


                            <span className="role-number">
                                0{index + 1}
                            </span>

                        </div>


                        {/* Title */}

                        <div className="solution-title-row">

                            <div>

                                <h3>
                                    {item.title}
                                </h3>

                                <span className="solution-subtitle">
                                    {item.subtitle}
                                </span>

                            </div>

                        </div>


                        {/* Description */}

                        <p className="solution-description">
                            {item.desc}
                        </p>


                        {/* Responsibilities */}

                        <div className="solution-features">

                            {item.features.map(
                                (feature, featureIndex) => (

                                    <div
                                        className="solution-feature"
                                        key={featureIndex}
                                    >

                                        <span className="feature-check">
                                            <FaCheckCircle />
                                        </span>

                                        <span>
                                            {feature}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>


                        {/* Bottom */}

                        <div className="solution-card-footer">

                            <span className="role-access">

                                {item.roleIcon}

                                Role-based access

                            </span>


                            <span className="solution-arrow">

                                <FaArrowRight />

                            </span>

                        </div>

                    </article>

                ))}

            </div>


            {/* Architecture Note */}

            <div className="solutions-bottom">

                <div className="solutions-bottom-icon">

                    <FaCheckCircle />

                </div>


                <div>

                    <strong>
                        Role-Based Access Control
                    </strong>

                    <p>
                        Each user gets access only to the features
                        required for their role, keeping hospital
                        operations organized and secure.
                    </p>

                </div>

            </div>


        </section>

    );

}


export default Solutions;