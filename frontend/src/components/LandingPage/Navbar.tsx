import { Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const navLinks = [
            { label: "About", href: "#about" },
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "RoleSelection", href: "#roles" },
            
          ];

  return (
    
    
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto ">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg transition-transform duration-200 hover:scale-105">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Civic Sarthi
              </h1>
              <p className="text-xs text-muted-foreground">
                Government Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          
          <div className="flex items-center space-x-9">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-sm font-medium text-muted-foreground
                transition-colors hover:text-foreground
                after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0
                after:bg-primary after:transition-all hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-6">
            <Link to="/login">
            <button className="text-sm font-medium text-foreground transition-colors hover:text-primary">
              Login
            </button>
            </Link>

            <Link to="/register">
            <Button className="text-sm font-semibold px-7 py-2 rounded-xl transition-transform duration-200 hover:scale-105">
              Register
            </Button>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};
