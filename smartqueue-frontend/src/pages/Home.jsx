import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Stats from "../components/Stats";
import CTA from "../components/CTA";
import Footer from "../components/Footer";


function Home(){

    return(
        <>
            <Navbar/>
            <Hero/>
            <Features/>
            <HowItWorks/>
            <Stats/>
            <CTA/>
            <Footer/>
        </>
    )

}

export default Home;