import { Navbar } from "@/components/LandingPage/Navbar";
import { Hero } from "@/components/LandingPage/Hero";
import { About } from "@/components/LandingPage/About";
import { Features } from "@/components/LandingPage/Features";
import { HowItWorks } from "@/components/LandingPage/HowItWorks";
import { Footer } from "@/components/LandingPage/Footer";
import {RoleSelection} from "@/components/LandingPage/RoleSelection";
import Feedback from "@/components/LandingPage/Feedback";




function LandingPage() {
    return(
        <div>
            <Navbar />
            <Hero />
            <About />
            <Features />
            <RoleSelection />
            <HowItWorks />
            <Feedback />
            <Footer />
            
        </div>
    )
}
export default LandingPage;