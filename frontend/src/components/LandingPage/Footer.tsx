import { Facebook, Instagram, Link, Mail, MapPin, Phone, Twitter } from "lucide-react"

   export const Footer = () => {
  

    return(

         <footer id="contact" className="bg-card border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">Civic Sarthi</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Empowering citizens to build better communities through transparent 
                and efficient civic issue resolution.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Departments</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Water Supply</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Electricity</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Roads & Transport</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sanitation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  +91 1800-XXX-XXXX
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  support@civicsarathi.gov.in
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  Municipal Corporation Office,<br />
                  City Center, India
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Civic Sarathi. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    )
}