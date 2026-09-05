import React from "react";

import {
    FaCalendarCheck,
    FaTicketAlt,
    FaWifi,
    FaUserMd,
    FaArrowRight
} from "react-icons/fa";

import "./HowItWorks.css";


function HowItWorks() {

    const steps = [

        {
            number: "01",
            icon: <FaCalendarCheck />,
            tag: "Appointment",
            title: "Book an Appointment",
            desc:
                "Patients select a doctor, choose an available appointment and book their visit digitally."
        },

        {
            number: "02",
            icon: <FaTicketAlt />,
            tag: "Digital Token",
            title: "Receive Your Token",
            desc:
                "After booking, SmartQueue provides a digital token that identifies the patient's place in the queue."
        },

        {
            number: "03",
            icon: <FaWifi />,
            tag: "Live Queue",
            title: "Track Your Queue",
            desc:
                "Patients can check their token status, current serving token and estimated waiting time."
        },

        {
            number: "04",
            icon: <FaUserMd />,
            tag: "Consultation",
            title: "Meet the Doctor",
            desc:
                "When the token reaches its turn, the doctor manages the consultation through the dashboard."
        }

    ];


    return (

        <section
            className="how-section"
            id="how"
        >

            {/* Background decoration */}

            <div className="how-bg-circle how-circle-one"></div>

            <div className="how-bg-circle how-circle-two"></div>

            <div className="how-grid-pattern"></div>


            {/* ===============================
                SECTION HEADING
            =============================== */}

            <div className="how-heading">

                <span className="how-label">
                    How It Works
                </span>

                <h2>
                    From Booking to
                    <span> Consultation</span>
                </h2>

                <p>
                    SmartQueue simplifies the complete patient journey,
                    from booking an appointment to reaching the doctor.
                </p>

            </div>


            {/* ===============================
                PROCESS
            =============================== */}

            <div className="timeline">

                <div className="timeline-line"></div>


                {steps.map((step, index) => (

                    <div
                        className={`how-step ${
                            index % 2 === 0
                                ? "step-left"
                                : "step-right"
                        }`}
                        key={step.number}
                    >

                        {/* ===============================
                            CARD
                        =============================== */}

                        <div className="how-card">

                            {/* Card top */}

                            <div className="how-card-top">

                                <div className="how-icon">

                                    {step.icon}

                                </div>

                                <span className="how-tag">
                                    {step.tag}
                                </span>

                            </div>


                            {/* Content */}

                            <div className="how-card-content">

                                <h3>
                                    {step.title}
                                </h3>

                                <p>
                                    {step.desc}
                                </p>

                            </div>


                            {/* Bottom */}

                            <div className="how-card-footer">

                                <span>
                                    Step {step.number}
                                </span>

                                <span className="how-footer-line"></span>

                                <FaArrowRight />

                            </div>

                        </div>


                        {/* ===============================
                            CENTER NUMBER
                        =============================== */}

                        <div className="step-node">

                            <span>
                                {step.number}
                            </span>

                        </div>

                    </div>

                ))}

            </div>


            {/* ===============================
                BOTTOM MESSAGE
            =============================== */}

            <div className="how-bottom">

                <div className="how-bottom-icon">
                    <FaWifi />
                </div>

                <div>

                    <strong>
                        Everything stays connected
                    </strong>

                    <span>
                        Patients, doctors and reception staff stay updated
                        throughout the queue process.
                    </span>

                </div>

            </div>

        </section>

    );

}


export default HowItWorks;