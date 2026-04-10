import { BarChart3, CheckCircle, MapPin, Users } from "lucide-react"

export const About = () => {
    return(
         <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">About Civic Sarthi</h2>
              <p className="text-lg text-muted-foreground">
                Bridging the gap between citizens and government
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Empowering Citizens, Enabling Governance</h3>
                <p className="text-muted-foreground mb-4">
                  Civic Sarathi is a comprehensive platform designed to streamline communication 
                  between citizens and local government departments. We believe that every voice 
                  matters in building better communities.
                </p>
                <p className="text-muted-foreground mb-6">
                  Our platform enables real-time issue reporting, transparent tracking, and 
                  efficient resolution of civic problems – from potholes to power outages, 
                  water supply issues to waste management.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-500">Transparent Process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-500">Quick Resolution</span>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-8 shadow-lg border">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-lg bg-primary ">
                    <Users className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="font-semibold text-white">50K+</div>
                    <div className="text-xs text-white">Active Users</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <div className="font-semibold">15K+</div>
                    <div className="text-xs text-muted-foreground">Issues Resolved</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/10">
                    <MapPin className="h-8 w-8 text-warning mx-auto mb-2" />
                    <div className="font-semibold">25+</div>
                    <div className="text-xs text-muted-foreground">Cities Covered</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary">
                    <BarChart3 className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="font-semibold text-white">12</div>
                    <div className="text-xs text-white">Departments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
}