function HowItWorks(){

    let steps=[
        "Patient books appointment",
        "System generates token",
        "Doctor manages queue",
        "Patient receives updates"
    ];


    return(

        <section id="how" className="py-5 bg-light">


            <div className="container">

                <h2 className="text-center fw-bold mb-5">
                    How SmartQueue Works
                </h2>


                <div className="row">


                    {
                        steps.map((s,i)=>(

                            <div className="col-md-3 text-center">

                                <div className="rounded-circle bg-primary text-white p-3 mx-auto mb-3"
                                     style={{width:"60px"}}>

                                    {i+1}

                                </div>


                                <h5>{s}</h5>


                            </div>

                        ))

                    }


                </div>


            </div>


        </section>

    )

}


export default HowItWorks;