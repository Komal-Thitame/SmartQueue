import React, { useState, useEffect } from "react";
import {
    FaHeartbeat,
    FaArrowRight
} from "react-icons/fa";

import {
    FiMenu,
    FiX
} from "react-icons/fi";

import "./Navbar.css";


function Navbar() {


    const [scrolled,setScrolled] = useState(false);
    const [open,setOpen] = useState(false);
    const [active,setActive] = useState("home");



    const menuItems = [

        {
            id:"home",
            name:"Home"
        },

        {
            id:"features",
            name:"Features"
        },

        {
            id:"how",
            name:"How It Works"
        },

        {
            id:"solutions",
            name:"Solutions"
        },

        {
            id:"about",
            name:"About"
        }

    ];

    useEffect(()=>{

        const handleScroll = ()=>{


            setScrolled(window.scrollY > 40);



            menuItems.forEach((item)=>{


                const section =
                    document.getElementById(item.id);



                if(section){


                    const position =
                        section.offsetTop - 150;



                    if(window.scrollY >= position){

                        setActive(item.id);

                    }


                }


            });



        };



        window.addEventListener(
            "scroll",
            handleScroll
        );



        return()=>{

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        };


    },[]);







    const scrollToSection=(id)=>{


        const section =
            document.getElementById(id);



        if(section){


            window.scrollTo({

                top:
                    section.offsetTop - 90,

                behavior:"smooth"

            });


        }
        setOpen(false);
    };
    return(
        <header
            className={`navbar ${scrolled ? "active":""}`}
        >
            <div className="nav-container">

                {/* LOGO */}
                <a
                    href="/"
                    className="brand"
                >



                    <div className="logo">

                        <FaHeartbeat/>

                    </div>



                    <div>

                        <h2>
                            Smart<span>Queue</span>
                        </h2>


                        <p>
                            Healthcare Management
                        </p>


                    </div>



                </a>







                {/* NAV LINKS */}



                <nav
                    className={
                        open
                            ? "links show"
                            : "links"
                    }
                >



                    {
                        menuItems.map((item)=>(


                            <a

                                key={item.id}


                                href={`#${item.id}`}


                                className={
                                    active===item.id
                                        ?
                                        "active"
                                        :
                                        ""
                                }



                                onClick={(e)=>{


                                    e.preventDefault();


                                    scrollToSection(item.id);


                                }}



                            >

                                {item.name}


                            </a>



                        ))
                    }



                </nav>









                {/* BUTTONS */}


                <div className="actions">



                    <a

                        href="/login"

                        className="login"

                    >

                        Login

                    </a>

                    <a

                        href="/register"

                        className="start"

                    >
                        Get Started
                        <FaArrowRight/>
                    </a>
                </div>
                {/* MOBILE MENU */}
                <button

                    className="menu-btn"

                    onClick={()=>setOpen(!open)}

                >
                    {
                        open
                            ?
                            <FiX/>
                            :
                            <FiMenu/>
                    }
                </button>
            </div>
        </header>
    );
}
export default Navbar;