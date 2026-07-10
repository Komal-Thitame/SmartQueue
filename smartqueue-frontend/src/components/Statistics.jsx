import React from "react";

import {
    FaChartLine,
    FaClock,
    FaUsers,
    FaHospital
} from "react-icons/fa";

import "./Statistics.css";


function Statistics(){


    const stats=[

        {
            icon:<FaChartLine/>,
            number:"98%",
            title:"Appointment Efficiency"
        },


        {
            icon:<FaClock/>,
            number:"40%",
            title:"Less Waiting Time"
        },


        {
            icon:<FaUsers/>,
            number:"120+",
            title:"Patients Managed"
        },


        {
            icon:<FaHospital/>,
            number:"24/7",
            title:"Queue Monitoring"
        }

    ];



    return(


        <section className="stats-section" id="statistics">


            <div className="stats-heading">


<span>
Our Impact
</span>


                <h2>
                    Making Healthcare
                    Faster & Smarter
                </h2>


                <p>
                    SmartQueue improves hospital workflow
                    and patient experience.
                </p>


            </div>





            <div className="stats-grid">


                {

                    stats.map((item,index)=>(


                        <div
                            className="stat-card"
                            key={index}
                        >


                            <div className="stat-icon">

                                {item.icon}

                            </div>


                            <h3>
                                {item.number}
                            </h3>


                            <p>
                                {item.title}
                            </p>


                        </div>


                    ))


                }


            </div>



        </section>


    )

}


export default Statistics;