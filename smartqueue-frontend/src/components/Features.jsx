function Features(){

    const data=[
        {
            title:"Online Appointment",
            desc:"Patients can easily book appointments anytime."
        },
        {
            title:"Digital Token System",
            desc:"Generate and manage tokens digitally."
        },
        {
            title:"Live Queue Tracking",
            desc:"Patients know their waiting position."
        },
        {
            title:"Doctor Dashboard",
            desc:"Doctors manage patients efficiently."
        }
    ];


    return(

        <section id="features" className="py-5">

            <div className="container">


                <h2 className="text-center fw-bold mb-5">
                    Powerful Features
                </h2>


                <div className="row">


                    {
                        data.map((item,index)=>(

                            <div className="col-md-3 mb-4" key={index}>

                                <div className="card h-100 shadow-sm border-0 p-4">


                                    <h5 className="fw-bold text-primary">
                                        {item.title}
                                    </h5>


                                    <p className="text-muted">
                                        {item.desc}
                                    </p>


                                </div>


                            </div>


                        ))

                    }


                </div>

            </div>


        </section>

    )

}


export default Features;