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


function Features(){


    const features=[

        {
            icon:<FaCalendarCheck/>,
            title:"Appointment Management",
            desc:"Patients can easily book and manage hospital appointments digitally."
        },


        {
            icon:<FaTicketAlt/>,
            title:"Smart Token Queue",
            desc:"Generate digital tokens and track live queue position."
        },


        {
            icon:<FaUserMd/>,
            title:"Doctor Dashboard",
            desc:"Doctors can manage appointments and patient information."
        },


        {
            icon:<FaBell/>,
            title:"Real-Time Notifications",
            desc:"Receive instant updates about token status and appointments."
        },


        {
            icon:<FaChartLine/>,
            title:"Queue Analytics",
            desc:"Monitor waiting time and improve hospital efficiency."
        },


        {
            icon:<FaShieldAlt/>,
            title:"Role Based Access",
            desc:"Secure access for Admin, Doctor, Receptionist and Patient."
        }

    ];



    return(


        <section className="features-section" id="features">



            <div className="features-heading">


<span>
Powerful Features
</span>


                <h2>
                    Everything You Need For
                    Smart Queue Management
                </h2>


                <p>
                    A complete digital solution designed
                    to simplify hospital operations.
                </p>


            </div>





            <div className="features-grid">


                {

                    features.map((item,index)=>(


                        <div
                            className="feature-card"
                            key={index}
                        >


                            <div className="feature-icon">

                                {item.icon}

                            </div>


                            <h3>
                                {item.title}
                            </h3>


                            <p>
                                {item.desc}
                            </p>


                        </div>


                    ))


                }



            </div>



        </section>


    )

}


export default Features;