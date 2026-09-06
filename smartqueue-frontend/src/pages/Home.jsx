import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import WhySmartQueue from "../components/WhySmartQueue";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Solutions from "../components/Solutions";
import About from "../components/About";

import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";




function Home(){

    return(

        <>
            <Navbar/>


            <section id="home">
                <Hero/>
            </section>

            <section id="why">
                <WhySmartQueue/>
            </section>


            <section id="features">
                <Features/>
            </section>


            <section id="how">
                <HowItWorks/>
            </section>


            <section id="solutions">
                <Solutions/>
            </section>


            <section id="about">
                <About/>
            </section>

           < section id="faq">
            <FAQ/>
        </section>

            < section id="cta">
                <CTA/>
            </section>

            < section id="footer">
                <Footer/>
            </section>




        </>

    )

}


export default Home;