import React from "react";

import {
    FaCalendarCheck,
    FaTicketAlt,
    FaWifi,
    FaUserMd
} from "react-icons/fa";

import "./HowItWorks.css";


function HowItWorks(){


    const steps=[

        {
            icon:<FaCalendarCheck/>,
            number:"01",
            title:"Book Appointment",
            desc:"Patients select doctor and book appointment digitally."
        },


        {
            icon:<FaTicketAlt/>,
            number:"02",
            title:"Receive Digital Token",
            desc:"SmartQueue automatically generates queue token."
        },


        {
            icon:<FaWifi/>,
            number:"03",
            title:"Track Live Queue",
            desc:"Patients get real-time updates about their waiting status."
        },


        {
            icon:<FaUserMd/>,
            number:"04",
            title:"Doctor Consultation",
            desc:"Doctor manages patients through smart dashboard."
        }

    ];



    return(

        <section className="how-section" id="how">



            <div className="how-heading">


<span>
How It Works
</span>


                <h2>
                    Simple Process,
                    Smarter Healthcare
                </h2>


                <p>
                    From appointment booking to consultation,
                    SmartQueue makes every step faster.
                </p>


            </div>





            <div className="timeline">


                {
                    steps.map((step,index)=>(


                        <div
                            className={`step ${index%2===0 ? "left":"right"}`}
                            key={index}
                        >



                            <div className="step-card">


                                <div className="step-icon">

                                    {step.icon}

                                </div>



                                <div>

                                    <h3>
                                        {step.title}
                                    </h3>


                                    <p>
                                        {step.desc}
                                    </p>

                                </div>


                            </div>





                            <div className="step-number">

                                {step.number}

                            </div>



                        </div>


                    ))
                }



            </div>




        </section>


    )

}


export default HowItWorks;