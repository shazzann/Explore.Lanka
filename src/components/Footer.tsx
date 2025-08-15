import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand & Description */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <span className="font-bold text-xl">
                  Explore<span className="text-primary">.Lanka</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-4">
                Discover Sri Lanka's hidden treasures through interactive exploration. Earn rewards, share experiences, and create unforgettable memories.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/game" className="text-muted-foreground hover:text-primary transition-colors">
                    Explore Game
                  </Link>
                </li>
                <li>
                  <Link to="/planner" className="text-muted-foreground hover:text-primary transition-colors">
                    Trip Planner
                  </Link>
                </li>
                <li>
                  <Link to="/assistant" className="text-muted-foreground hover:text-primary transition-colors">
                    AI Assistant
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/photos" className="text-muted-foreground hover:text-primary transition-colors">
                    Photo Feed
                  </Link>
                </li>
                <li>
                  <Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                    Profile
                  </Link>
                </li>
                {/* <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Mobile App
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Travel Guide
                  </a>
                </li> */}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href="mailto:explorelanka123@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                    explorelanka123@gmail.com
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href="tel:+94770651964" className="text-muted-foreground hover:text-primary transition-colors">
                    +94 77 065 1964
                  </a>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    123 Hills Street<br />
                    Colombo 03, Sri Lanka
                  </span>
                </li>
              </ul>
              <Link 
                to="/contact"
                className="inline-block mt-4 text-primary hover:underline text-sm font-medium"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © 2025 ExploreLanka. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;