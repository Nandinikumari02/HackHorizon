import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import civicsense from "@/assets/civicsense.png";
import { Link } from "react-router-dom";


export const Hero = () => {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      
      {/* Background Image */}
      <img
        src={civicsense}
        alt="Modern civic city with digital connectivity"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
          <MapPin className="h-4 w-4" />
          Smart Civic Engagement Platform
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          Your Voice for a <span className="text-secondary">Better City</span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg md:text-xl">
          Report civic issues, track resolutions, and collaborate with local
          government to build cleaner, safer, and smarter communities.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">

  <Link to="/login">
    <Button 
      size="lg" 
      className="gap-2 rounded-full px-8 hover:transition-transform duration-200 hover:scale-105"
    >
      Report an Issue <ArrowRight className="h-5 w-5" />
    </Button>
  </Link>

  <Button 
    size="lg"
    variant="outline"
    onClick={() => {
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    }}
    className="rounded-full border-white/30 text-black hover:transition-transform duration-200 hover:scale-105"
  >
    Learn How It Works
  </Button>

</div>

        {/* Stats */}
        <div className="mt-16 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { value: "15K+", label: "Issues Resolved" },
            { value: "98%", label: "Citizen Satisfaction" },
            { value: "24h", label: "Avg. Response Time" },
          ].map((item) => (
            <div
              key={item.label}
             className="
                rounded-xl
                border border-white/20
                bg-gradient-to-br from-primary/25 via-emerald-400/10 to-transparent
                px-6 py-5
                backdrop-blur-md
                shadow-lg shadow-black/10
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl
              "
            >
              <div className="text-3xl font-bold text-white">
                {item.value}
              </div>
              <div className="mt-1 text-sm text-white/80">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
