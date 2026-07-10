import React from "react";

import {
    FaArrowRight,
    FaUserClock,
    FaCalendarCheck,
    FaHeartbeat,
    FaCheckCircle
} from "react-icons/fa";

import "./Hero.css";


function Hero(){

    return(

        <section className="hero" id="home">


            <div className="hero-bg-circle one"></div>
            <div className="hero-bg-circle two"></div>



            <div className="hero-container">



                {/* LEFT */}


                <div className="hero-content">


                    <div className="hero-badge">

                        <FaHeartbeat/>

                        Smart Healthcare Queue System

                    </div>




                    <h1>

                        SmartQueue

                        <span>
Smart Waiting,
Better Healthcare
</span>

                    </h1>




                    <p>

                        A digital hospital queue management system
                        that helps patients book appointments,
                        track tokens and receive real-time updates.

                    </p>





                    <div className="hero-buttons">


                        <a
                            href="/register"
                            className="primary-btn"
                        >

                            Get Started

                            <FaArrowRight/>

                        </a>



                        <a
                            href="#features"
                            className="secondary-btn"
                        >

                            Explore Features

                        </a>


                    </div>





                    <div className="hero-trust">


                        <div>

                            <FaCheckCircle/>

                            Real Time Updates

                        </div>


                        <div>

                            <FaCheckCircle/>

                            Secure Platform

                        </div>


                    </div>






                </div>








                {/* RIGHT */}



                <div className="queue-preview">



                    <div className="floating-card top">


                        <FaUserClock/>

                        <div>

                            <strong>
                                120+
                            </strong>

                            <small>
                                Patients Today
                            </small>

                        </div>


                    </div>





                    <div className="queue-card">


                        <div className="queue-header">


                            <h3>
                                Live Queue
                            </h3>


                            <span>
ONLINE
</span>


                        </div>





                        <div className="serving">


                            <p>
                                Now Serving
                            </p>


                            <h2>
                                A102
                            </h2>


                            <span>
Doctor Room 03
</span>


                        </div>






                        <div className="queue-info">


                            <div>

                                <small>
                                    Waiting
                                </small>

                                <strong>
                                    08
                                </strong>

                            </div>



                            <div>

                                <small>
                                    Wait Time
                                </small>

                                <strong>
                                    15 min
                                </strong>

                            </div>



                        </div>



                    </div>







                    <div className="floating-card bottom">


                        <FaCalendarCheck/>


                        <div>

                            <strong>
                                98%
                            </strong>

                            <small>
                                Appointments
                            </small>

                        </div>


                    </div>






                </div>



            </div>


        </section>


    )

}


export default Hero;