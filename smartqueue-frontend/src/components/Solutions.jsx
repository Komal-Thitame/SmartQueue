import React from "react";

import {
    FaUserTie,
    FaUserMd,
    FaClipboard,
    FaUser
} from "react-icons/fa";

import "./Solutions.css";


function Solutions(){


    const solutions=[

        {
            icon:<FaUserTie/>,
            title:"Admin",
            desc:"Manage hospital operations, users and performance analytics."
        },


        {
            icon:<FaUserMd/>,
            title:"Doctor",
            desc:"View patient queue and manage consultations efficiently."
        },


        {
            icon:<FaClipboard/>,
            title:"Receptionist",
            desc:"Handle appointments, tokens and patient check-ins."
        },


        {
            icon:<FaUser/>,
            title:"Patient",
            desc:"Book appointments and track live queue status."
        }

    ];



    return(


        <section className="solutions-section" id="solutions">


            <div className="solutions-heading">


<span>
Solutions
</span>


                <h2>
                    Built For Everyone In
                    Healthcare
                </h2>


                <p>
                    One smart platform connecting patients,
                    doctors and hospital staff.
                </p>


            </div>





            <div className="solutions-grid">


                {
                    solutions.map((item,index)=>(


                        <div
                            className="solution-role-card"
                            key={index}
                        >


                            <div className="role-icon">

                                {item.icon}

                            </div>



                            <h3>
                                {item.title}
                            </h3>



                            <p>
                                {item.desc}
                            </p>


                            <button>
                                Explore
                            </button>


                        </div>


                    ))
                }



            </div>



        </section>


    )

}


export default Solutions;