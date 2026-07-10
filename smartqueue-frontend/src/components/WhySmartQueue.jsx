import React from "react";

import {
    FaClock,
    FaTicketAlt,

    FaBell,
    FaCheckCircle
} from "react-icons/fa";


import "./WhySmartQueue.css";


function WhySmartQueue(){

    const problems=[
        {
            icon:<FaClock/>,
            title:"Long Waiting Time",
            desc:"Patients spend hours waiting without knowing their turn."
        },

        {
            icon:<FaTicketAlt/>,
            title:"Manual Token System",
            desc:"Paper based queues create confusion and delays."
        },

        {
            icon:<FaBell/>,
            title:"No Live Updates",
            desc:"Patients cannot track their queue status."
        }
    ];


    const solutions=[
        {
            title:"Real Time Queue Tracking"
        },

        {
            title:"Digital Appointment Management"
        },

        {
            title:"Automatic Token Updates"
        }
    ];


    return(

        <section className="why-section">


            <div className="section-heading">

<span>
Why SmartQueue?
</span>

                <h2>
                    Transform Hospital Waiting
                    into Smart Experience
                </h2>

                <p>
                    SmartQueue replaces traditional queue systems
                    with a faster and smarter digital solution.
                </p>

            </div>





            <div className="compare-container">


                {/* PROBLEM */}


                <div className="problem-box">


                    <h3>
                        Traditional Problems
                    </h3>


                    {
                        problems.map((item,index)=>(

                            <div className="problem-card" key={index}>

                                <div className="icon">
                                    {item.icon}
                                </div>


                                <div>

                                    <h4>
                                        {item.title}
                                    </h4>

                                    <p>
                                        {item.desc}
                                    </p>

                                </div>


                            </div>


                        ))
                    }


                </div>






                <div className="solution-box">


                    <h3>
                        SmartQueue Solution
                    </h3>


                    {
                        solutions.map((item,index)=>(

                            <div className="solution-card" key={index}>


                                <FaCheckCircle/>


                                <span>
{item.title}
</span>


                            </div>


                        ))
                    }


                </div>



            </div>



        </section>

    )

}


export default WhySmartQueue;